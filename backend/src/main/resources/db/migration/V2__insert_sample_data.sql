INSERT INTO inquiries (title, content, requester_name, requester_email, status, priority, due_date, display_order) VALUES
('ログインできない', 'パスワードをリセットしたが、ログインページでエラーが表示される。', '山田 太郎', 'yamada@example.com', 'PENDING', 'HIGH', '2026-06-20', 0),
('請求書の金額が間違っている', '今月の請求書に先月分の料金が二重計上されているように見えます。', '鈴木 花子', 'suzuki@example.com', 'IN_PROGRESS', 'HIGH', '2026-06-15', 0),
('機能の使い方が分からない', 'ダッシュボードのエクスポート機能の手順を教えてください。', '佐藤 次郎', 'sato@example.com', 'PENDING', 'MEDIUM', NULL, 1),
('データが表示されない', 'レポート画面でデータが空欄になっている。先週まで表示されていた。', '田中 美咲', 'tanaka@example.com', 'PENDING', 'HIGH', '2026-06-18', 2),
('パスワード変更ができない', 'アカウント設定からパスワードを変更しようとしてもエラーになる。', '伊藤 健一', 'ito@example.com', 'COMPLETED', 'LOW', NULL, 0);
