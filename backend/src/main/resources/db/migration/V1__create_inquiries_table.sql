CREATE TABLE inquiries (
    id            BIGINT       NOT NULL AUTO_INCREMENT,
    title         VARCHAR(100) NOT NULL,
    content       TEXT         NOT NULL,
    requester_name  VARCHAR(50)  NOT NULL,
    requester_email VARCHAR(255) NOT NULL,
    status        ENUM('PENDING','IN_PROGRESS','COMPLETED') NOT NULL DEFAULT 'PENDING',
    priority      ENUM('HIGH','MEDIUM','LOW')               NOT NULL DEFAULT 'MEDIUM',
    due_date      DATE,
    display_order INT          NOT NULL DEFAULT 0,
    created_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at    DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE INDEX idx_inquiries_status          ON inquiries (status);
CREATE INDEX idx_inquiries_priority        ON inquiries (priority);
CREATE INDEX idx_inquiries_status_order    ON inquiries (status, display_order);
CREATE INDEX idx_inquiries_due_date        ON inquiries (due_date);
