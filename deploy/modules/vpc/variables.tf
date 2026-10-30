variable "name" {
  description = "Application name used for naming VPC resources"
  type        = string
  default     = "hrms-backend"
}

variable "cidr_block" {
  description = "VPC CIDR block"
  type        = string
  default     = "10.0.0.0/16"
}

