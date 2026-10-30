# --- Networking & VPC ---
module "vpc" {
  source = "./modules/vpc"
  name   = local.name
}

# --- EKS Cluster, Fargate Profile & Load Balancer IAM ---
module "eks" {
  source             = "./modules/eks"
  name               = local.name
  public_subnet_ids  = module.vpc.public_subnet_ids
  private_subnet_ids = module.vpc.private_subnet_ids
}

# --- Container Registry ---
module "ecr" {
  source = "./modules/ecr"
  name   = local.name
}

