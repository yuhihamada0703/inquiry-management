package com.example.inquiry.application.dto

import com.example.inquiry.domain.entity.Inquiry
import com.example.inquiry.domain.entity.InquiryStatus
import jakarta.validation.constraints.*
import java.time.LocalDate
import java.time.LocalDateTime

data class InquiryResponse(
    val id: Long,
    val title: String,
    val content: String,
    val memo: String?,
    val customerName: String,
    val customerNameKana: String?,
    val assigneeName: String,
    val assigneeNameKana: String?,
    val requesterEmail: String,
    val status: InquiryStatus,
    val dueDate: LocalDate?,
    val displayOrder: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime,
    val deletedAt: LocalDateTime?
) {
    companion object {
        fun from(inquiry: Inquiry) = InquiryResponse(
            id = inquiry.id,
            title = inquiry.title,
            content = inquiry.content,
            memo = inquiry.memo,
            customerName = inquiry.customerName,
            customerNameKana = inquiry.customerNameKana,
            assigneeName = inquiry.assigneeName,
            assigneeNameKana = inquiry.assigneeNameKana,
            requesterEmail = inquiry.requesterEmail,
            status = inquiry.status,
            dueDate = inquiry.dueDate,
            displayOrder = inquiry.displayOrder,
            createdAt = inquiry.createdAt,
            updatedAt = inquiry.updatedAt,
            deletedAt = inquiry.deletedAt
        )
    }
}

data class InquiryCreateRequest(
    @field:NotBlank
    @field:Size(max = 100)
    val title: String,

    @field:NotBlank
    @field:Size(max = 2000)
    val content: String,

    @field:Size(max = 1000)
    val memo: String? = null,

    @field:NotBlank
    @field:Size(max = 50)
    val customerName: String,

    @field:Size(max = 100)
    val customerNameKana: String? = null,

    @field:Size(max = 50)
    val assigneeName: String = "",

    @field:Size(max = 100)
    val assigneeNameKana: String? = null,

    @field:NotBlank
    @field:Email
    val requesterEmail: String,

    val dueDate: LocalDate? = null
)

data class InquiryUpdateRequest(
    @field:NotBlank
    @field:Size(max = 100)
    val title: String,

    @field:NotBlank
    @field:Size(max = 2000)
    val content: String,

    @field:Size(max = 1000)
    val memo: String? = null,

    @field:NotBlank
    @field:Size(max = 50)
    val customerName: String,

    @field:Size(max = 100)
    val customerNameKana: String? = null,

    @field:Size(max = 50)
    val assigneeName: String = "",

    @field:Size(max = 100)
    val assigneeNameKana: String? = null,

    @field:NotBlank
    @field:Email
    val requesterEmail: String,

    val status: InquiryStatus,

    val dueDate: LocalDate? = null
)

data class StatusUpdateRequest(
    val status: InquiryStatus
)

data class HardDeleteRequest(
    val adminPassword: String
)

data class ReorderRequest(
    val items: List<ReorderItem>
)

data class ReorderItem(
    val id: Long,
    val displayOrder: Int
)

data class PageResponse<T>(
    val content: List<T>,
    val totalElements: Long,
    val totalPages: Int,
    val page: Int,
    val size: Int
)

data class ErrorResponse(
    val status: Int,
    val error: String,
    val message: String,
    val timestamp: LocalDateTime = LocalDateTime.now()
)
