package com.example.inquiry.domain.repository

import com.example.inquiry.domain.entity.Inquiry
import com.example.inquiry.domain.entity.InquiryPriority
import com.example.inquiry.domain.entity.InquiryStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface InquiryRepository : JpaRepository<Inquiry, Long> {

    @Query("""
        SELECT i FROM Inquiry i
        WHERE (:status IS NULL OR i.status = :status)
          AND (:priority IS NULL OR i.priority = :priority)
          AND (:keyword IS NULL OR i.title LIKE %:keyword% OR i.content LIKE %:keyword%)
    """)
    fun findByFilters(
        status: InquiryStatus?,
        priority: InquiryPriority?,
        keyword: String?,
        pageable: Pageable
    ): Page<Inquiry>

    fun findByStatusOrderByDisplayOrderAsc(status: InquiryStatus): List<Inquiry>

    fun countByStatus(status: InquiryStatus): Long
}
