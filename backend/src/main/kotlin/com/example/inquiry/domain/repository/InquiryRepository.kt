package com.example.inquiry.domain.repository

import com.example.inquiry.domain.entity.Inquiry
import com.example.inquiry.domain.entity.InquiryStatus
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface InquiryRepository : JpaRepository<Inquiry, Long> {

    @Query("""
        SELECT i FROM Inquiry i
        WHERE i.deletedAt IS NULL
          AND (:status IS NULL OR i.status = :status)
          AND (:keyword IS NULL OR i.title LIKE %:keyword% OR i.content LIKE %:keyword% OR i.customerName LIKE %:keyword%)
    """)
    fun findByFilters(
        status: InquiryStatus?,
        keyword: String?,
        pageable: Pageable
    ): Page<Inquiry>

    @Query("SELECT i FROM Inquiry i WHERE i.deletedAt IS NOT NULL ORDER BY i.deletedAt DESC")
    fun findHistory(): List<Inquiry>

    @Query("SELECT i FROM Inquiry i WHERE i.status = :status AND i.deletedAt IS NULL ORDER BY i.displayOrder ASC")
    fun findActiveByStatus(status: InquiryStatus): List<Inquiry>

    fun countByStatus(status: InquiryStatus): Long
}
