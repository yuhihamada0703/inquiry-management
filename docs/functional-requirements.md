# 機能要件定義書

## 問い合わせエンティティ

### フィールド定義

| フィールド名 | 型 | 必須 | 説明 |
|-------------|-----|------|------|
| id | Long | 自動 | 主キー（自動採番） |
| title | String | ○ | 件名（最大100文字） |
| content | String | ○ | 問い合わせ内容（最大2000文字） |
| memo | String | - | 内部メモ（顧客非公開、最大1000文字） |
| customerName | String | ○ | 顧客名（最大50文字） |
| customerNameKana | String | - | 顧客名ふりがな（最大100文字、ソート用） |
| assigneeName | String | - | 担当者名（最大50文字） |
| assigneeNameKana | String | - | 担当者ふりがな（最大100文字、ソート用） |
| requesterEmail | String | ○ | 問い合わせ者メールアドレス |
| status | Enum | ○ | PENDING / IN_PROGRESS / WAITING_REPLY / COMPLETED |
| dueDate | LocalDate | - | 対応期限 |
| displayOrder | Int | ○ | カラム内の表示順（ドラッグ&ドロップ用） |
| createdAt | LocalDateTime | 自動 | 作成日時 |
| updatedAt | LocalDateTime | 自動 | 更新日時 |
| deletedAt | LocalDateTime | - | 論理削除日時（nullなら有効） |

### ソート仕様

- ふりがな（customerNameKana / assigneeNameKana）が入力されている場合はふりがな順でソート
- ふりがなが未入力の場合はサーバー側で自動的に漢字名をふりがな列にセット（フォールバック）

### ステータス定義

| 値 | 表示名 | 色 |
|----|--------|----|
| PENDING | 未対応 | 赤系 |
| IN_PROGRESS | 対応中 | 黄系 |
| WAITING_REPLY | 回答待ち | 青系 |
| COMPLETED | 完了 | 緑系 |

---

## API エンドポイント一覧

### 問い合わせ

| メソッド | パス | 説明 |
|---------|------|------|
| GET | /api/inquiries | 一覧取得（フィルタ・ソート・ページネーション対応） |
| GET | /api/inquiries/{id} | 詳細取得 |
| GET | /api/inquiries/history | 論理削除済み一覧取得 |
| POST | /api/inquiries | 新規登録 |
| PUT | /api/inquiries/{id} | 更新 |
| DELETE | /api/inquiries/{id} | 論理削除 |
| DELETE | /api/inquiries/{id}/permanent | 物理削除（管理者パスワード必須） |
| PATCH | /api/inquiries/{id}/status | ステータス変更 |
| PATCH | /api/inquiries/reorder | 表示順更新（ドラッグ&ドロップ） |

### クエリパラメータ（GET /api/inquiries）

| パラメータ | 型 | デフォルト | 説明 |
|-----------|-----|-----------|------|
| status | String | null | ステータスフィルタ |
| keyword | String | null | キーワード検索（件名・内容・顧客名） |
| sort | String | createdAt | ソートキー（createdAt / customerName / assigneeName / dueDate） |
| direction | String | desc | asc / desc |
| page | Int | 0 | ページ番号（0始まり） |
| size | Int | 20 | 1ページあたり件数 |

### ソートキーとDB列の対応

| sort パラメータ | 実際にソートする列 |
|----------------|-----------------|
| customerName | customer_name_kana |
| assigneeName | assignee_name_kana |
| dueDate | due_date |
| createdAt | created_at |

---

## 画面フロー

```
トップ画面（カンバンボード）
  ├── 問い合わせカードをクリック → 詳細ダイアログ
  │     ├── 編集ボタン → 編集フォーム（モーダル）
  │     └── 「履歴へ移動」ボタン → 確認ダイアログ → 論理削除
  ├── 新規登録ボタン → 登録フォーム（モーダル）
  ├── 「履歴」ボタン → 削除済み一覧ダイアログ
  │     └── 完全削除ボタン → 管理者パスワード入力 → 物理削除
  ├── ヘッダー検索バー → キーワード検索
  └── ソートメニュー → 並び替え切り替え（顧客名/担当者/期限/作成日時）
```

---

## バリデーションルール

| フィールド | ルール |
|-----------|--------|
| title | 必須、1〜100文字 |
| content | 必須、1〜2000文字 |
| memo | 任意、最大1000文字 |
| customerName | 必須、1〜50文字 |
| customerNameKana | 任意、最大100文字（ひらがな推奨） |
| assigneeName | 任意、最大50文字 |
| assigneeNameKana | 任意、最大100文字（ひらがな推奨） |
| requesterEmail | 必須、メール形式 |
| status | PENDING / IN_PROGRESS / WAITING_REPLY / COMPLETED のいずれか |
| dueDate | 任意 |

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

---

## 管理者パスワード

- デフォルト: `admin1234`
- 環境変数 `ADMIN_PASSWORD` で上書き可能
- 完全削除（物理削除）操作時に要求される
