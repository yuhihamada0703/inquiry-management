# Inquiry Management

顧客からの問い合わせを一元管理するWebアプリケーションです。
カンバンボード形式でステータス管理・ドラッグ&ドロップによる直感的な操作を提供します。

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js 14 / TypeScript / TailwindCSS / Radix UI |
| バックエンド | Kotlin / Spring Boot 3.2 |
| データベース | MySQL 8.0 |
| インフラ | AWS EC2 + RDS / Nginx / Terraform |

## 機能

- 問い合わせのCRUD操作（顧客名・担当者・内部メモ・対応期限）
- ステータス管理（未対応 / 対応中 / 回答待ち / 完了）
- ドラッグ&ドロップによるステータス変更・カラム内並び替え
- 顧客名・担当者のふりがな順ソート（読み順）
- 期限・作成日時によるソート
- キーワード検索
- 論理削除と削除済み履歴管理（管理者パスワードで完全削除）

## プロジェクト構成

```
inquiry-management/
├── frontend/      # Next.js アプリ
├── backend/       # Kotlin + Spring Boot
├── terraform/     # インフラ構成
├── docs/          # 設計ドキュメント
└── README.md
```

## ドキュメント

- [要件定義書](docs/requirements.md)
- [機能要件定義書](docs/functional-requirements.md)
- [技術スタック](docs/tech-stack.md)

## セットアップ

### 前提条件

- Docker Desktop
- Java 17+
- Node.js 18+

### ローカル開発環境

```bash
# リポジトリクローン
git clone <repository-url>
cd inquiry-management

# MySQLコンテナ起動
docker compose up -d

# DBマイグレーション（手動）
docker exec -it inquiry-db mysql -u root -p inquiry_db
# → V1〜V4のSQLを順番に適用

# バックエンド起動
cd backend
./gradlew bootRun

# フロントエンド起動
cd frontend
npm install
npm run dev
```

### 環境変数

| 変数名 | デフォルト | 説明 |
|--------|-----------|------|
| DB_HOST | localhost | MySQLホスト |
| DB_PORT | 3306 | MySQLポート |
| DB_NAME | inquiry_db | DB名 |
| DB_USER | root | DBユーザー |
| DB_PASSWORD | password | DBパスワード |
| ADMIN_PASSWORD | admin1234 | 完全削除用管理者パスワード |
| NEXT_PUBLIC_API_URL | http://localhost:8080 | バックエンドURL |
