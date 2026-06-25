variable "aws_region" {
  description = "AWSリージョン"
  type        = string
  default     = "ap-northeast-1"
}

variable "app_name" {
  description = "アプリ名（リソース名のプレフィックス）"
  type        = string
  default     = "inquiry"
}

variable "key_pair_name" {
  description = "EC2に接続するためのキーペア名（AWSに登録済みのもの）"
  type        = string
}

variable "my_ip" {
  description = "SSHを許可するIPアドレス（例: 203.0.113.0/32）"
  type        = string
}

# ─────────────────────────────────────────────
# RDS 設定
# ─────────────────────────────────────────────
variable "db_name" {
  description = "RDSデータベース名"
  type        = string
  default     = "inquiry_db"
}

variable "db_username" {
  description = "RDS管理者ユーザー名"
  type        = string
  default     = "admin"
}

variable "db_password" {
  description = "RDS管理者パスワード（terraform.tfvarsに記載、Gitにコミットしないこと）"
  type        = string
  sensitive   = true
}
