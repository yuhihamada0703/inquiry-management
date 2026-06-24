# 技術スタック

## フロントエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Next.js | 15.x (App Router) | フレームワーク |
| TypeScript | 5.x | 型安全な開発 |
| TailwindCSS | 3.x | スタイリング |
| shadcn/ui | latest | UIコンポーネント |
| @dnd-kit | latest | ドラッグ&ドロップ |
| TanStack Query | 5.x | サーバー状態管理 |
| React Hook Form | 7.x | フォーム管理 |
| Zod | 3.x | スキーマバリデーション |
| Axios | 1.x | HTTP通信 |

## バックエンド

| 技術 | バージョン | 用途 |
|------|-----------|------|
| Kotlin | 1.9.x | メイン言語 |
| Spring Boot | 3.2.x | フレームワーク |
| Spring Data JPA | - | ORM |
| Spring Web MVC | - | REST API |
| Spring Validation | - | バリデーション |
| MySQL Connector | 8.x | DBドライバ |
| Flyway | 9.x | DBマイグレーション |

## データベース

| 技術 | バージョン | 用途 |
|------|-----------|------|
| MySQL | 8.0 | メインDB（本番: AWS RDS） |

## インフラ

| 技術 | バージョン | 用途 |
|------|-----------|------|
| AWS EC2 | - | アプリサーバー |
| AWS RDS | MySQL 8.0 | マネージドDB |
| Nginx | 1.24.x | リバースプロキシ |
| Terraform | 1.7.x | インフラ as Code |

## 開発環境

| ツール | 用途 |
|--------|------|
| Docker / Docker Compose | ローカル開発環境 |
| Git / GitHub | バージョン管理 |
| IntelliJ IDEA / VS Code | IDE |

## CI/CD

| ツール | 用途 |
|--------|------|
| GitHub Actions | PR・push 時にテスト・ビルド・デプロイを自動化 |
| GHCR (GitHub Container Registry) | バックエンド Docker イメージの保管 |

### パイプライン概要

| ジョブ | トリガー | 内容 |
|-------|---------|------|
| Backend Test | PR / push | Gradle テスト（H2 インメモリ DB） |
| Frontend Test & Build | PR / push | ESLint + Jest + Next.js ビルド確認 |
| Build & Push | main push のみ | Docker イメージビルド → GHCR へ push |
| Deploy to Production | main push のみ | SSH で EC2 へデプロイ（docker compose 更新） |
