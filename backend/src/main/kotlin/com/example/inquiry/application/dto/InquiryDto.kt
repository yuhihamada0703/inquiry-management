package com.example.inquiry.application.dto

import com.example.inquiry.domain.entity.Inquiry
import com.example.inquiry.domain.entity.InquiryPriority
import com.example.inquiry.domain.entity.InquiryStatus
import jakarta.validation.constraints.*
import java.time.LocalDate
import java.time.LocalDateTime

data class InquiryResponse(
    val id: Long,
    val title: String,
    val content: String,
    val requesterName: String,
    val requesterEmail: String,
    val status: InquiryStatus,
    val priority: InquiryPriority,
    val dueDate: LocalDate?,
    val displayOrder: Int,
    val createdAt: LocalDateTime,
    val updatedAt: LocalDateTime
) {
    companion object {
        fun from(inquiry: Inquiry) = InquiryResponse(
            id = inquiry.id,
            title = inquiry.title,
            content = inquiry.content,
            requesterName = inquiry.requesterName,
            requesterEmail = inquiry.requesterEmail,
            status = inquiry.status,
            priority = inquiry.priority,
            dueDate = inquiry.dueDate,
            displayOrder = inquiry.displayOrder,
            createdAt = inquiry.createdAt,
            updatedAt = inquiry.updatedAt
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

    @field:NotBlank
    @field:Size(max = 50)
    val requesterName: String,

    @field:NotBlank
    @field:Email
    val requesterEmail: String,

    val priority: InquiryPriority = InquiryPriority.MEDIUM,

    @field:FutureOrPresent
    val dueDate: LocalDate? = null
)

data class InquiryUpdateRequest(
    @field:NotBlank
    @field:Size(max = 100)
    val title: String,

    @field:NotBlank
    @field:Size(max = 2000)
    val content: String,

    @field:NotBlank
    @field:Size(max = 50)
    val requesterName: String,

    @field:NotBlank
    @field:Email
    val requesterEmail: String,

    val status: InquiryStatus,

    val priority: InquiryPriority,

    @field:FutureOrPresent
    val dueDate: LocalDate? = null
)

data class StatusUpdateRequest(
    val status: InquiryStatus
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
