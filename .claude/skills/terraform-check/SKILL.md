---
name: terraform-check
description: Run Terraform quality checks on the terraform/ directory. Use this skill when the user asks to check, lint, validate, or review Terraform code, or when infrastructure changes are included in a diff. Covers format check, validation, security scan (tfsec), and best-practice linting (tflint).
---

# Terraform Quality Check

Terraform コードの品質チェックを実施するスキル。`terraform/` ディレクトリに対して以下を順番に実行する。

## チェック項目

1. **フォーマットチェック** (`terraform fmt -check -recursive`)
   - インデントや整形が公式スタイルに準拠しているか確認
   - 差分があれば `terraform fmt -recursive` で自動修正する

2. **構文バリデーション** (`terraform validate`)
   - HCL の構文エラー・参照エラーを検出
   - ※ `terraform init` が必要な場合は `-backend=false` オプションで初期化してから実行

3. **セキュリティスキャン** (`tfsec .` または `checkov -d .`)
   - ハードコードされたシークレット、過度に広いセキュリティグループ、暗号化設定の欠如などを検出
   - tfsec が未インストールの場合は checkov にフォールバック、両方なければスキップ

4. **ベストプラクティス Lint** (`tflint`)
   - 非推奨リソース・引数、プロバイダー固有のルール違反を検出
   - 未インストールの場合はスキップ

## 実行手順

```bash
cd terraform

# 1. フォーマットチェック
terraform fmt -check -recursive
# → 差分があれば terraform fmt -recursive で修正

# 2. バリデーション（バックエンド接続なし）
terraform init -backend=false -input=false
terraform validate

# 3. セキュリティスキャン（インストール済みツールを使用）
if command -v tfsec &>/dev/null; then
  tfsec .
elif command -v checkov &>/dev/null; then
  checkov -d . --framework terraform
fi

# 4. Lint
if command -v tflint &>/dev/null; then
  tflint --recursive
fi
```

## 結果の報告

各チェックの結果を以下の形式でまとめて報告する：

| チェック | 結果 | 備考 |
|---------|------|------|
| fmt | ✅ / ❌ | 差分があったファイル名 |
| validate | ✅ / ❌ | エラーメッセージ |
| tfsec / checkov | ✅ / ⚠️ / スキップ | 検出された問題 |
| tflint | ✅ / ⚠️ / スキップ | 検出された問題 |

- **CRITICAL / HIGH** の問題はブロッキング扱いとして必ず修正を提案する
- **MEDIUM / LOW** は内容を説明した上でユーザーに判断を委ねる
- セキュリティツールが未インストールの場合は手動レビューポイントを列挙する

## このプロジェクト固有の注意点

- `terraform.tfvars` は `.gitignore` で除外済み（シークレットを含む）。`terraform.tfvars.example` のみ追跡対象
- バックエンドは S3（`inquiry-terraform-state-*` バケット）のため、`init` 時は `-backend=false` を使用
- AWS プロバイダーは `inquiry-prod` プロファイルを使用（ローカル実行時は AWS 認証情報が必要）
- セキュリティグループの `cidr_blocks` が `var.my_ip` に依存しており、`0.0.0.0/0` ではないことを確認
