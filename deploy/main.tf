terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = ">= 6.0"
    }
  }

  backend "s3" {
    encrypt      = true
    use_lockfile = true
    region       = "ap-south-1"
    profile      = "eks-fargate-user"
    key          = "hrms-backend/terraform.tfstate"
    bucket       = "scoobies-terraform-state-bucket"
  }
}

provider "aws" {
  region  = "ap-south-1"
  profile = "eks-fargate-user"
}

locals {
  name = "hrms-backend"
}
