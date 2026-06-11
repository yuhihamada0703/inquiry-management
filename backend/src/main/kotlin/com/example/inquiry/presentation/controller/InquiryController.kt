package com.example.inquiry.presentation.controller

import com.example.inquiry.application.dto.*
import com.example.inquiry.application.service.InquiryService
import com.example.inquiry.domain.entity.InquiryPriority
import com.example.inquiry.domain.entity.InquiryStatus
import jakarta.validation.Valid
import org.springframework.http.HttpStatus
import org.springframework.web.bind.annotation.*

@RestController
@RequestMapping("/api/inquiries")
class InquiryController(private val service: InquiryService) {

    @GetMapping
    fun findAll(
        @RequestParam(required = false) status: InquiryStatus?,
        @RequestParam(required = false) priority: InquiryPriority?,
        @RequestParam(required = false) keyword: String?,
        @RequestParam(defaultValue = "createdAt") sort: String,
        @RequestParam(defaultValue = "desc") direction: String,
        @RequestParam(defaultValue = "0") page: Int,
        @RequestParam(defaultValue = "20") size: Int
    ): PageResponse<InquiryResponse> =
        service.findAll(status, priority, keyword, sort, direction, page, size)

    @GetMapping("/{id}")
    fun findById(@PathVariable id: Long): InquiryResponse =
        service.findById(id)

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    fun create(@Valid @RequestBody request: InquiryCreateRequest): InquiryResponse =
        service.create(request)

    @PutMapping("/{id}")
    fun update(@PathVariable id: Long, @Valid @RequestBody request: InquiryUpdateRequest): InquiryResponse =
        service.update(id, request)

    @PatchMapping("/{id}/status")
    fun updateStatus(@PathVariable id: Long, @RequestBody request: StatusUpdateRequest): InquiryResponse =
        service.updateStatus(id, request)

    @PatchMapping("/reorder")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun reorder(@RequestBody request: ReorderRequest) =
        service.reorder(request)

    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    fun delete(@PathVariable id: Long) =
        service.delete(id)
}
