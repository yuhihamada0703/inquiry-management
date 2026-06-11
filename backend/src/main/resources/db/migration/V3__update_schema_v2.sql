-- ① ステータスENUMに WAITING_REPLY を追加（対応中と完了の間）
ALTER TABLE inquiries
    MODIFY COLUMN status ENUM('PENDING','IN_PROGRESS','WAITING_REPLY','COMPLETED') NOT NULL DEFAULT 'PENDING';

-- ② requester_name → customer_name にリネーム
ALTER TABLE inquiries
    RENAME COLUMN requester_name TO customer_name;

-- ③ priority 列とインデックスを削除
ALTER TABLE inquiries DROP INDEX idx_inquiries_priority;
ALTER TABLE inquiries DROP COLUMN priority;

-- ④ 担当者名を追加
ALTER TABLE inquiries
    ADD COLUMN assignee_name VARCHAR(50) NOT NULL DEFAULT '' AFTER customer_name;

-- ⑤ 内部メモを追加（顧客非公開）
ALTER TABLE inquiries
    ADD COLUMN memo TEXT AFTER content;

-- ⑥ 論理削除用タイムスタンプを追加
ALTER TABLE inquiries
    ADD COLUMN deleted_at DATETIME DEFAULT NULL AFTER updated_at;

CREATE INDEX idx_inquiries_deleted_at ON inquiries (deleted_at);

-- ⑦ サンプルデータに担当者名を補完
UPDATE inquiries SET assignee_name = '田中 担当' WHERE customer_name = '山田 太郎';
UPDATE inquiries SET assignee_name = '鈴木 担当' WHERE customer_name = '鈴木 花子';
UPDATE inquiries SET assignee_name = '佐藤 担当' WHERE customer_name = '佐藤 次郎';
UPDATE inquiries SET assignee_name = '伊藤 担当' WHERE customer_name = '田中 美咲';
UPDATE inquiries SET assignee_name = '高橋 担当' WHERE customer_name = '伊藤 健一';
