resource "aws_ecr_repository" "app" {
  name         = var.name
  force_delete = var.force_delete
}
