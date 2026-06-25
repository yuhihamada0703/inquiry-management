# ─────────────────────────────────────────────
# VPC（デフォルトVPCを使わず専用VPCを作成）
# ─────────────────────────────────────────────
resource "aws_vpc" "main" {
  cidr_block           = "10.0.0.0/16"
  enable_dns_hostnames = true
  enable_dns_support   = true

  tags = { Name = "${var.app_name}-vpc" }
}

resource "aws_internet_gateway" "main" {
  vpc_id = aws_vpc.main.id
  tags   = { Name = "${var.app_name}-igw" }
}

resource "aws_subnet" "public" {
  vpc_id                  = aws_vpc.main.id
  cidr_block              = "10.0.1.0/24"
  availability_zone       = "${var.aws_region}a"
  map_public_ip_on_launch = true

  tags = { Name = "${var.app_name}-public-subnet" }
}

resource "aws_route_table" "public" {
  vpc_id = aws_vpc.main.id

  route {
    cidr_block = "0.0.0.0/0"
    gateway_id = aws_internet_gateway.main.id
  }

  tags = { Name = "${var.app_name}-public-rt" }
}

resource "aws_route_table_association" "public" {
  subnet_id      = aws_subnet.public.id
  route_table_id = aws_route_table.public.id
}

# ─────────────────────────────────────────────
# セキュリティグループ
# ─────────────────────────────────────────────
resource "aws_security_group" "ec2" {
  name        = "${var.app_name}-ec2-sg"
  description = "Security group for EC2 instance"
  vpc_id      = aws_vpc.main.id

  # SSH: 自分のIPのみ許可（セキュリティのため全公開しない）
  ingress {
    description = "SSH from my IP"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # HTTP: フロントエンド（Next.js）- 自分のIPのみ
  ingress {
    description = "HTTP from my IP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # バックエンドAPI（Spring Boot）- 自分のIPのみ
  ingress {
    description = "Backend API from my IP"
    from_port   = 8080
    to_port     = 8080
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  # フロントエンド（Next.js）- 自分のIPのみ
  ingress {
    description = "Frontend Next.js from my IP"
    from_port   = 3000
    to_port     = 3000
    protocol    = "tcp"
    cidr_blocks = [var.my_ip]
  }

  egress {
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = { Name = "${var.app_name}-ec2-sg" }
}

# ─────────────────────────────────────────────
# AMI（Amazon Linux 2023 最新版を自動取得）
# ─────────────────────────────────────────────
data "aws_ami" "amazon_linux_2023" {
  most_recent = true
  owners      = ["amazon"]

  filter {
    name   = "name"
    values = ["al2023-ami-*-x86_64"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }
}

# ─────────────────────────────────────────────
# EC2 インスタンス（t2.micro = 無料枠）
# ─────────────────────────────────────────────
resource "aws_instance" "main" {
  ami                    = data.aws_ami.amazon_linux_2023.id
  instance_type          = "t3.micro" # 無料枠: 750時間/月
  subnet_id              = aws_subnet.public.id
  vpc_security_group_ids = [aws_security_group.ec2.id]
  key_name               = var.key_pair_name

  root_block_device {
    volume_type = "gp2"
    volume_size = 20 # GB（無料枠: 30GBまで）
    encrypted   = true
  }

  # 起動時にDockerとDocker Composeをインストール
  user_data = <<-EOF
    #!/bin/bash
    yum update -y
    yum install -y docker git
    systemctl enable docker
    systemctl start docker
    usermod -aG docker ec2-user

    # Docker Compose インストール
    curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
      -o /usr/local/bin/docker-compose
    chmod +x /usr/local/bin/docker-compose
  EOF

  tags = { Name = "${var.app_name}-server" }
}

# ─────────────────────────────────────────────
# Elastic IP（再起動してもIPが変わらないように）
# 注意: EC2が停止中でも料金が発生するため、使わない時はEC2を動かしておくこと
# ─────────────────────────────────────────────
resource "aws_eip" "main" {
  instance = aws_instance.main.id
  domain   = "vpc"

  tags = { Name = "${var.app_name}-eip" }
}
