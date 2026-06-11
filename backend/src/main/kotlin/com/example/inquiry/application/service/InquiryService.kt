package com.example.inquiry.application.service

import com.example.inquiry.application.dto.*
import com.example.inquiry.domain.entity.Inquiry
import com.example.inquiry.domain.entity.InquiryPriority
import com.example.inquiry.domain.entity.InquiryStatus
import com.example.inquiry.domain.repository.InquiryRepository
import jakarta.persistence.EntityNotFoundException
import org.springframework.data.domain.PageRequest
import org.springframework.data.domain.Sort
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional

@Service
@Transactional(readOnly = true)
class InquiryService(private val repository: InquiryRepository) {

    fun findAll(
        status: InquiryStatus?,
        priority: InquiryPriority?,
        keyword: String?,
        sort: String,
        direction: String,
        page: Int,
        size: Int
    ): PageResponse<InquiryResponse> {
        val sortOrder = if (direction.equals("asc", ignoreCase = true)) Sort.Direction.ASC else Sort.Direction.DESC
        val sortField = when (sort) {
            "priority" -> "priority"
            "dueDate" -> "dueDate"
            else -> "createdAt"
        }
        val pageable = PageRequest.of(page, size, Sort.by(sortOrder, sortField))
        val result = repository.findByFilters(status, priority, keyword, pageable)
        return PageResponse(
            content = result.content.map { InquiryResponse.from(it) },
            totalElements = result.totalElements,
            totalPages = result.totalPages,
            page = result.number,
            size = result.size
        )
    }

    fun findById(id: Long): InquiryResponse {
        val inquiry = repository.findById(id)
            .orElseThrow { EntityNotFoundException("Inquiry not found: id=$id") }
        return InquiryResponse.from(inquiry)
    }

    @Transactional
    fun create(request: InquiryCreateRequest): InquiryResponse {
        val maxOrder = repository.findByStatusOrderByDisplayOrderAsc(InquiryStatus.PENDING)
            .maxOfOrNull { it.displayOrder } ?: -1
        val inquiry = Inquiry(
            title = request.title,
            content = request.content,
            requesterName = request.requesterName,
            requesterEmail = request.requesterEmail,
            priority = request.priority,
            dueDate = request.dueDate,
            displayOrder = maxOrder + 1
        )
        return InquiryResponse.from(repository.save(inquiry))
    }

    @Transactional
    fun update(id: Long, request: InquiryUpdateRequest): InquiryResponse {
        val inquiry = repository.findById(id)
            .orElseThrow { EntityNotFoundException("Inquiry not found: id=$id") }
        inquiry.title = request.title
        inquiry.content = request.content
        inquiry.requesterName = request.requesterName
        inquiry.requesterEmail = request.requesterEmail
        inquiry.status = request.status
        inquiry.priority = request.priority
        inquiry.dueDate = request.dueDate
        return InquiryResponse.from(repository.save(inquiry))
    }

    @Transactional
    fun updateStatus(id: Long, request: StatusUpdateRequest): InquiryResponse {
        val inquiry = repository.findById(id)
            .orElseThrow { EntityNotFoundException("Inquiry not found: id=$id") }
        inquiry.status = request.status
        return InquiryResponse.from(repository.save(inquiry))
    }

    @Transactional
    fun reorder(request: ReorderRequest) {
        val ids = request.items.map { it.id }
        val inquiries = repository.findAllById(ids).associateBy { it.id }
        request.items.forEach { item ->
            inquiries[item.id]?.displayOrder = item.displayOrder
        }
        repository.saveAll(inquiries.values)
    }

    @Transactional
    fun delete(id: Long) {
        if (!repository.existsById(id)) {
            throw EntityNotFoundException("Inquiry not found: id=$id")
        }
        repository.deleteById(id)
    }
}
