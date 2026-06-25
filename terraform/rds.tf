# ─────────────────────────────────────────────
# プライベートサブネット（RDS用 - 2 AZ 必須）
# ─────────────────────────────────────────────
resource "aws_subnet" "private_1" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.10.0/24"
  availability_zone = "${var.aws_region}a"

  tags = { Name = "${var.app_name}-private-subnet-1" }
}

resource "aws_subnet" "private_2" {
  vpc_id            = aws_vpc.main.id
  cidr_block        = "10.0.11.0/24"
  availability_zone = "${var.aws_region}c"

  tags = { Name = "${var.app_name}-private-subnet-2" }
}

# ─────────────────────────────────────────────
# RDS セキュリティグループ
# EC2のセキュリティグループからのみ MySQL (3306) を許可
# ─────────────────────────────────────────────
resource "aws_security_group" "rds" {
  name        = "${var.app_name}-rds-sg"
  description = "Security group for RDS - allows MySQL only from EC2 SG"
  vpc_id      = aws_vpc.main.id

  ingress {
    description     = "MySQL from EC2 only"
    from_port       = 3306
    to_port         = 3306
    protocol        = "tcp"
    security_groups = [aws_security_group.ec2.id]
  }

  # アウトバウンドは全許可（RDS標準）
  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-rds-sg" }
}

# ─────────────────────────────────────────────
# RDS サブネットグループ（複数 AZ 必須）
# ─────────────────────────────────────────────
resource "aws_db_subnet_group" "main" {
  name        = "${var.app_name}-db-subnet-group"
  description = "Subnet group for RDS - private subnets only"
  subnet_ids  = [aws_subnet.private_1.id, aws_subnet.private_2.id]

  tags = { Name = "${var.app_name}-db-subnet-group" }
}

# ─────────────────────────────────────────────
# RDS パラメータグループ（MySQL 8.0）
# ─────────────────────────────────────────────
resource "aws_db_parameter_group" "main" {
  name        = "${var.app_name}-mysql8-params"
  family      = "mysql8.0"
  description = "Parameter group for ${var.app_name} MySQL 8.0"

  parameter {
    name  = "character_set_server"
    value = "utf8mb4"
  }

  parameter {
    name  = "collation_server"
    value = "utf8mb4_unicode_ci"
  }

  parameter {
    name  = "time_zone"
    value = "Asia/Tokyo"
  }

  tags = { Name = "${var.app_name}-mysql8-params" }
}

# ─────────────────────────────────────────────
# RDS インスタンス（MySQL 8.0, db.t3.micro）
# publicly_accessible = false でインターネットから接続不可
# ─────────────────────────────────────────────
resource "aws_db_instance" "main" {
  identifier = "${var.app_name}-db"

  engine         = "mysql"
  engine_version = "8.0"
  instance_class = "db.t3.micro"

  allocated_storage     = 20
  max_allocated_storage = 100
  storage_type          = "gp2"
  storage_encrypted     = true

  db_name  = var.db_name
  username = var.db_username
  password = var.db_password

  db_subnet_group_name   = aws_db_subnet_group.main.name
  vpc_security_group_ids = [aws_security_group.rds.id]
  parameter_group_name   = aws_db_parameter_group.main.name

  # EC2 以外からのアクセスを完全遮断
  publicly_accessible = false

  # 本番用途でなければ無効化（コスト削減）
  multi_az = false

  backup_retention_period = 0
  backup_window           = "03:00-04:00"
  maintenance_window      = "Mon:04:00-Mon:05:00"

  skip_final_snapshot       = false
  final_snapshot_identifier = "${var.app_name}-db-final-snapshot"
  deletion_protection       = false

  tags = { Name = "${var.app_name}-db" }
}
