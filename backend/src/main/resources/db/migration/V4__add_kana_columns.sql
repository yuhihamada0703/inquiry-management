ALTER TABLE inquiries ADD COLUMN customer_name_kana VARCHAR(100) NULL;
ALTER TABLE inquiries ADD COLUMN assignee_name_kana VARCHAR(100) NULL;

-- 既存データは漢字名をそのままフリガナ列にコピー（未入力扱い）
UPDATE inquiries SET customer_name_kana = customer_name;
UPDATE inquiries SET assignee_name_kana = assignee_name;
