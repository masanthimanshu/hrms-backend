variable "name" {
  description = "Application/repository name"
  type        = string
  default     = "hrms-backend"
}

variable "force_delete" {
  description = "Whether to force delete repository contents on destroy"
  type        = bool
  default     = true
}

