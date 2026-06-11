# Inquiry Management

顧客からの問い合わせを一元管理するWebアプリケーションです。
ステータス管理・優先度管理・ドラッグ&ドロップによる直感的な操作を提供します。

## 技術スタック

| 領域 | 技術 |
|------|------|
| フロントエンド | Next.js 14 / TypeScript / TailwindCSS / shadcn/ui |
| バックエンド | Kotlin / Spring Boot 3.2 |
| データベース | MySQL 8.0 |
| インフラ | AWS EC2 + RDS / Nginx / Terraform |

## 機能

- 問い合わせのCRUD操作
- ステータス管理（未対応 / 対応中 / 完了）
- ドラッグ&ドロップによるステータス変更・並び替え
- 優先度・期限によるソート
- キーワード検索

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
- [画面設計書](docs/screen-design.md)
- [データベース設計書](docs/database-design.md)
- [技術スタック](docs/tech-stack.md)
- [インフラ構成](docs/infrastructure.md)

## スクリーンショット

*（デプロイ後に追加予定）*

## セットアップ

### ローカル開発環境

```bash
# リポジトリクローン
git clone <repository-url>
cd inquiry-management

# バックエンド起動
cd backend
./gradlew bootRun

# フロントエンド起動
cd frontend
npm install
npm run dev
```

詳細は各ディレクトリの README を参照してください。
