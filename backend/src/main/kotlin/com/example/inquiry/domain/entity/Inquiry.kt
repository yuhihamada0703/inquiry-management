package com.example.inquiry.domain.entity

import jakarta.persistence.*
import java.time.LocalDate
import java.time.LocalDateTime

enum class InquiryStatus {
    PENDING, IN_PROGRESS, WAITING_REPLY, COMPLETED
}

@Entity
@Table(name = "inquiries")
class Inquiry(
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    val id: Long = 0,

    @Column(nullable = false, length = 100)
    var title: String,

    @Column(nullable = false, columnDefinition = "TEXT")
    var content: String,

    @Column(columnDefinition = "TEXT")
    var memo: String? = null,

    @Column(name = "customer_name", nullable = false, length = 50)
    var customerName: String,

    @Column(name = "customer_name_kana", length = 100)
    var customerNameKana: String? = null,

    @Column(name = "assignee_name", nullable = false, length = 50)
    var assigneeName: String = "",

    @Column(name = "assignee_name_kana", length = 100)
    var assigneeNameKana: String? = null,

    @Column(name = "requester_email", nullable = false)
    var requesterEmail: String,

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    var status: InquiryStatus = InquiryStatus.PENDING,

    @Column(name = "due_date")
    var dueDate: LocalDate? = null,

    @Column(name = "display_order", nullable = false)
    var displayOrder: Int = 0,

    @Column(name = "created_at", nullable = false, updatable = false)
    val createdAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "updated_at", nullable = false)
    var updatedAt: LocalDateTime = LocalDateTime.now(),

    @Column(name = "deleted_at")
    var deletedAt: LocalDateTime? = null
) {
    @PreUpdate
    fun onUpdate() {
        updatedAt = LocalDateTime.now()
    }
}
