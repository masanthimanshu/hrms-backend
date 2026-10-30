#!/usr/bin/env bash
set -eo pipefail

# --- Configuration ---
REGION="ap-south-1"
PROFILE="eks-fargate-user"
CLUSTER="hrms-backend-cluster"
APP="hrms-backend"

# --- Error Handling ---
trap 'echo -e "\n❌ [ERROR] Deployment failed at line $LINENO. Review the error above."' ERR

# --- 1. Preflight Checks ---
echo "🔍 [1/6] Checking required CLI tools..."
for tool in aws kubectl helm docker terraform; do
  if ! command -v "$tool" >/dev/null 2>&1; then
    echo "❌ Error: '$tool' is not installed or not in your PATH." >&2
    exit 1
  fi
done

# --- 2. Kubeconfig & CoreDNS Setup ---
echo "🚀 [2/6] Connecting to EKS cluster ($CLUSTER)..."
aws eks update-kubeconfig --name "$CLUSTER" --region "$REGION" --profile "$PROFILE"

echo "🔧 Ensuring CoreDNS runs on Fargate..."
kubectl patch deployment coredns -n kube-system --type json \
  -p='[{"op": "remove", "path": "/spec/template/metadata/annotations/eks.amazonaws.com~1compute-type"}]' 2>/dev/null || true

# --- 3. Terraform Outputs ---
echo "📦 [3/6] Reading Terraform outputs..."
ECR_URL=$(terraform -chdir=deploy output -raw ecr_url)
LBC_ROLE=$(terraform -chdir=deploy output -raw lbc_role_arn)
VPC_ID=$(terraform -chdir=deploy output -raw vpc_id)

if [ -z "$ECR_URL" ] || [ -z "$LBC_ROLE" ] || [ -z "$VPC_ID" ]; then
  echo "❌ Error: Failed to fetch Terraform outputs. Run 'terraform apply' in ./deploy first." >&2
  exit 1
fi

# --- 4. AWS Load Balancer Controller ---
echo "☸️  [4/6] Installing/Updating AWS Load Balancer Controller..."
helm upgrade --install aws-load-balancer-controller eks/aws-load-balancer-controller \
  --repo https://aws.github.io/eks-charts -n kube-system \
  --set clusterName="$CLUSTER" \
  --set region="$REGION" \
  --set vpcId="$VPC_ID" \
  --set serviceAccount.create=true \
  --set serviceAccount.name=aws-load-balancer-controller \
  --set serviceAccount.annotations."eks\.amazonaws\.com/role-arn"="$LBC_ROLE"

# --- 5. Build & Push Docker Image ---
echo "🔐 [5/6] Building & pushing container image to ECR..."
aws ecr get-login-password --region "$REGION" --profile "$PROFILE" | docker login --username AWS --password-stdin "$ECR_URL"
docker build --platform linux/amd64 -t "$ECR_URL:latest" .
docker push "$ECR_URL:latest"

# --- 6. Deploy Application via Helm ---
echo "🚀 [6/6] Deploying $APP application via Helm..."
helm upgrade --install "$APP" ./chart \
  --set image.repository="$ECR_URL" \
  --set image.tag="latest"

echo ""
echo "⏳ Waiting for Internet-facing Load Balancer URL..."
LB=""
WAIT_COUNT=0
while [ -z "$LB" ]; do
  sleep 5
  WAIT_COUNT=$((WAIT_COUNT + 1))
  LB=$(kubectl get svc "$APP" -o jsonpath='{.status.loadBalancer.ingress[0].hostname}' 2>/dev/null || true)
  if [ $WAIT_COUNT -gt 36 ]; then # 3 minutes timeout
    echo "⚠️ Warning: Load balancer DNS is taking longer than expected. Check status with: kubectl get svc $APP"
    break
  fi
done

if [ -n "$LB" ]; then
  echo ""
  echo "=========================================================================="
  echo "🎉 SUCCESS: Application is LIVE!"
  echo "👉 Base URL:         http://$LB"
  echo "👉 Health Endpoint:  http://$LB/health"
  echo "=========================================================================="
fi
