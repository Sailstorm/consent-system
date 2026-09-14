output "public_ip" {
  value = aws_eip.app.public_ip
}

output "app_url" {
  value = "https://${var.domain_name}"
}

output "ssm_connect_command" {
  value = "aws ssm start-session --target ${aws_instance.app.id} --region ${var.aws_region}"
}
