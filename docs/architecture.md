# システムアーキテクチャ

## 全体構成図

```mermaid
graph TB
    subgraph Client["クライアント"]
        Browser["ブラウザ\n(Chrome / Edge / Safari)"]
    end

    subgraph AWS["AWS"]
        subgraph EC2["EC2 インスタンス"]
            Nginx["Nginx\n(リバースプロキシ\n:80 / :443)"]
            Frontend["Next.js\n(フロントエンド\n:3000)"]
            Backend["Spring Boot\n(バックエンド API\n:8080)"]
        end

        subgraph RDS["RDS"]
            MySQL["MySQL 8.0"]
        end
    end

    Browser -->|"HTTPS"| Nginx
    Nginx -->|"/ → :3000"| Frontend
    Nginx -->|"/api → :8080"| Backend
    Backend -->|"JDBC\n(3306)"| MySQL
    Frontend -->|"REST API\n(/api/...)"| Nginx
```

## コンポーネント説明

| コンポーネント | 役割 | 技術 |
|-------------|------|------|
| Nginx | リバースプロキシ。`/api/*` をバックエンドへ、それ以外をフロントエンドへルーティング | Nginx 1.24.x |
| Next.js | カンバンボードUI。SSR + クライアントサイドフェッチ (TanStack Query) | Next.js 15 / TypeScript |
| Spring Boot | REST API サーバー。ビジネスロジック・バリデーション・DB アクセスを担当 | Kotlin / Spring Boot 4.x |
| MySQL | 問い合わせデータの永続化。Flyway でスキーマ管理 | MySQL 8.0 (AWS RDS) |

## ローカル開発環境との差異

```mermaid
graph LR
    subgraph Local["ローカル開発"]
        L_Browser["ブラウザ"] --> L_Next["Next.js :3000"]
        L_Next -->|"直接"| L_Spring["Spring Boot :8080"]
        L_Spring --> L_Docker["MySQL\n(Docker コンテナ)"]
    end

    subgraph Prod["本番 (AWS)"]
        P_Browser["ブラウザ"] --> P_Nginx["Nginx"]
        P_Nginx --> P_Next["Next.js"]
        P_Nginx --> P_Spring["Spring Boot"]
        P_Spring --> P_RDS["MySQL (RDS)"]
    end
```

| 項目 | ローカル | 本番 |
|------|---------|------|
| DB | Docker コンテナ (MySQL) | AWS RDS |
| プロキシ | なし（直接アクセス） | Nginx |
| Flyway | 無効（手動 SQL 適用） | 有効（自動マイグレーション） |
| 環境変数 | `.env` / デフォルト値 | EC2 環境変数 |

## CI/CD フロー

```mermaid
graph LR
    Push["git push\n(GitHub)"] --> CI["GitHub Actions"]
    CI --> Test_BE["バックエンド\nテスト\n(Gradle)"]
    CI --> Test_FE["フロントエンド\n型チェック + Lint\n(npm)"]
    Test_BE --> Pass{全パス?}
    Test_FE --> Pass
    Pass -->|Yes| Done["マージ可能"]
    Pass -->|No| Fail["ブロック"]
```
