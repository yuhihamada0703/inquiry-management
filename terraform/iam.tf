# ─────────────────────────────────────────────
# EC2 用 IAM ロール（SSM エージェント経由でコマンド実行するため）
# ─────────────────────────────────────────────
resource "aws_iam_role" "ec2_ssm" {
  name = "${var.app_name}-ec2-ssm-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [{
      Action    = "sts:AssumeRole"
      Effect    = "Allow"
      Principal = { Service = "ec2.amazonaws.com" }
    }]
  })

  tags = { Name = "${var.app_name}-ec2-ssm-role" }
}

resource "aws_iam_role_policy_attachment" "ssm_core" {
  role       = aws_iam_role.ec2_ssm.name
  policy_arn = "arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore"
}

resource "aws_iam_instance_profile" "ec2_ssm" {
  name = "${var.app_name}-ec2-ssm-profile"
  role = aws_iam_role.ec2_ssm.name
}

# ─────────────────────────────────────────────
# GitHub Actions 用 IAM ユーザー（SSM コマンド送信権限のみ）
# ─────────────────────────────────────────────
resource "aws_iam_user" "github_actions" {
  name = "${var.app_name}-github-actions"
  tags = { Name = "${var.app_name}-github-actions" }
}

resource "aws_iam_access_key" "github_actions" {
  user = aws_iam_user.github_actions.name
}

resource "aws_iam_user_policy" "github_actions_ssm" {
  name = "${var.app_name}-ssm-deploy-policy"
  user = aws_iam_user.github_actions.name

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        # SendCommand: 対象インスタンスとドキュメントのみ許可
        Effect = "Allow"
        Action = ["ssm:SendCommand"]
        Resource = [
          "arn:aws:ssm:${var.aws_region}:*:document/AWS-RunShellScript",
          aws_instance.main.arn
        ]
      },
      {
        # GetCommandInvocation / ListCommandInvocations はリソース指定が不可（*必須）
        Effect = "Allow"
        Action = [
          "ssm:GetCommandInvocation",
          "ssm:ListCommandInvocations"
        ]
        Resource = "*"
      }
    ]
  })
}

output "github_actions_access_key_id" {
  description = "GitHub Actions 用 IAM アクセスキー ID（GitHub Secret: AWS_ACCESS_KEY_ID に設定）"
  value       = aws_iam_access_key.github_actions.id
}

output "github_actions_secret_access_key" {
  description = "GitHub Actions 用 IAM シークレットキー（GitHub Secret: AWS_SECRET_ACCESS_KEY に設定）"
  value       = aws_iam_access_key.github_actions.secret
  sensitive   = true
}

output "ec2_instance_id" {
  description = "EC2 インスタンス ID（GitHub Secret: EC2_INSTANCE_ID に設定）"
  value       = aws_instance.main.id
}
