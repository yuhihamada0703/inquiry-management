terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.5.0"

  backend "s3" {
    bucket  = "inquiry-terraform-state-993391629586" # ← 自分のアカウントIDに変更
    key     = "inquiry-management/terraform.tfstate"
    region  = "ap-northeast-1"
    profile = "inquiry-prod"
  }
}

provider "aws" {
  region  = var.aws_region
  profile = "inquiry-prod"
}

