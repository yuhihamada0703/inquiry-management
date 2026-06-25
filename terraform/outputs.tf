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

output "rds_endpoint" {
  description = "RDSエンドポイント（EC2からの接続先）"
  value       = aws_db_instance.main.endpoint
}

output "rds_host" {
  description = "RDSホスト名"
  value       = aws_db_instance.main.address
}

output "rds_port" {
  description = "RDSポート番号"
  value       = aws_db_instance.main.port
}

output "rds_db_name" {
  description = "RDSデータベース名"
  value       = aws_db_instance.main.db_name
}
