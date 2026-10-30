output "ecr_url" {
  description = "ECR repository URL"
  value       = module.ecr.repository_url
}

output "lbc_role_arn" {
  description = "IAM Role ARN for AWS Load Balancer Controller"
  value       = module.eks.lbc_role_arn
}

output "vpc_id" {
  description = "VPC ID"
  value       = module.vpc.vpc_id
}

output "cluster_name" {
  description = "EKS Cluster Name"
  value       = module.eks.cluster_name
}

output "cluster_endpoint" {
  description = "EKS Cluster Kubernetes API Endpoint"
  value       = module.eks.cluster_endpoint
}
