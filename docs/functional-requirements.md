# 機能要件定義書

## 問い合わせエンティティ

### フィールド定義

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Long | 自動 | 主キー（自動採番） |
| title | String | ○ | 件名（最大100文字） |
| content | String | ○ | 問い合わせ内容（最大2000文字） |
| requesterName | String | ○ | 問い合わせ者名（最大50文字） |
| requesterEmail | String | ○ | 問い合わせ者メールアドレス |
| status | Enum | ○ | PENDING / IN_PROGRESS / COMPLETED |
| priority | Enum | ○ | HIGH / MEDIUM / LOW |
| dueDate | LocalDate | - | 対応期限 |
| displayOrder | Int | ○ | カラム内の表示順（ドラッグ&ドロップ用） |
| createdAt | LocalDateTime | 自動 | 作成日時 |
| updatedAt | LocalDateTime | 自動 | 更新日時 |

### ステータス定義

| 値 | 表示名 | 色 |
|----|--------|----|
| PENDING | 未対応 | 赤系 |
| IN_PROGRESS | 対応中 | 黄系 |
| COMPLETED | 完了 | 緑系 |

### 優先度定義

| 値 | 表示名 | 重み |
|----|--------|------|
| HIGH | 高 | 1 |
| MEDIUM | 中 | 2 |
| LOW | 低 | 3 |

---

## API エンドポイント一覧

### 問い合わせ

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/inquiries | 一覧取得（フィルタ・ソート・ページネーション対応） |
| GET | /api/inquiries/{id} | 詳細取得 |
| POST | /api/inquiries | 新規登録 |
| PUT | /api/inquiries/{id} | 更新 |
| DELETE | /api/inquiries/{id} | 削除 |
| PATCH | /api/inquiries/{id}/status | ステータス変更 |
| PATCH | /api/inquiries/reorder | 表示順更新（ドラッグ&ドロップ） |

### クエリパラメータ（GET /api/inquiries）

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| status | String | null | ステータスフィルタ |
| priority | String | null | 優先度フィルタ |
| keyword | String | null | キーワード検索（件名・内容） |
| sort | String | createdAt | ソートキー（createdAt / priority / dueDate） |
| direction | String | desc | asc / desc |
| page | Int | 0 | ページ番号（0始まり） |
| size | Int | 20 | 1ページあたり件数 |

---

## 画面フロー

```
トップ画面（カンバンボード）
  ├── 問い合わせカードをクリック → 詳細ダイアログ
  │     ├── 編集ボタン → 編集フォーム（モーダル）
  │     └── 削除ボタン → 確認ダイアログ → 削除
  ├── 新規登録ボタン → 登録フォーム（モーダル）
  ├── ヘッダー検索バー → キーワード検索
  └── ソートメニュー → 並び替え切り替え
```

---

## バリデーションルール

| フィールド | ルール |
|-----------|--------|
| title | 必須、1〜100文字 |
| content | 必須、1〜2000文字 |
| requesterName | 必須、1〜50文字 |
| requesterEmail | 必須、メール形式 |
| status | PENDING / IN_PROGRESS / COMPLETED のいずれか |
| priority | HIGH / MEDIUM / LOW のいずれか |
| dueDate | 今日以降の日付（任意） |

---

## エラーレスポンス形式

```json
{
  "status": 400,
  "error": "Bad Request",
  "message": "バリデーションエラーの詳細",
  "timestamp": "2026-06-11T10:00:00"
}
```
