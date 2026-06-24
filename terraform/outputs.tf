output "ec2_public_ip" {
  description = "EC2のパブリックIP（Elastic IP）"
  value       = aws_eip.main.public_ip
}

output "ssh_command" {
  description = "SSHでEC2に接続するコマンド"
  value       = "ssh -i ~/.ssh/${var.key_pair_name}.pem ec2-user@${aws_eip.main.public_ip}"
}

output "frontend_url" {
  description = "フロントエンドURL（Next.js）"
  value       = "http://${aws_eip.main.public_ip}:3000"
}

output "backend_url" {
  description = "バックエンドURL（Spring Boot）"
  value       = "http://${aws_eip.main.public_ip}:8080"
}
