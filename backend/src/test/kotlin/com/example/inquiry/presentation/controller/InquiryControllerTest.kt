package com.example.inquiry.presentation.controller

import com.example.inquiry.application.dto.*
import com.example.inquiry.application.service.InquiryService
import com.example.inquiry.domain.entity.InquiryPriority
import com.example.inquiry.domain.entity.InquiryStatus
import com.example.inquiry.presentation.advice.GlobalExceptionHandler
import jakarta.persistence.EntityNotFoundException
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import org.springframework.http.MediaType
import org.springframework.http.converter.json.JacksonJsonHttpMessageConverter
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.*
import org.springframework.test.web.servlet.setup.MockMvcBuilders
import java.time.LocalDateTime

@ExtendWith(MockitoExtension::class)
class InquiryControllerTest {

    @Mock private lateinit var service: InquiryService
    private lateinit var mockMvc: MockMvc

    @BeforeEach
    fun setUp() {
        mockMvc = MockMvcBuilders
            .standaloneSetup(InquiryController(service))
            .setControllerAdvice(GlobalExceptionHandler())
            .setMessageConverters(JacksonJsonHttpMessageConverter())
            .build()
    }

    private fun sampleResponse() = InquiryResponse(
        id = 1L,
        title = "テスト問い合わせ",
        content = "テスト内容",
        requesterName = "山田太郎",
        requesterEmail = "yamada@example.com",
        status = InquiryStatus.PENDING,
        priority = InquiryPriority.MEDIUM,
        dueDate = null,
        displayOrder = 0,
        createdAt = LocalDateTime.of(2026, 1, 1, 0, 0),
        updatedAt = LocalDateTime.of(2026, 1, 1, 0, 0)
    )

    private fun samplePageResponse() = PageResponse(
        content = listOf(sampleResponse()),
        totalElements = 1L,
        totalPages = 1,
        page = 0,
        size = 20
    )

    @Test
    fun `GET inquiries returns 200 with page response`() {
        whenever(service.findAll(null, null, null, "createdAt", "desc", 0, 20))
            .thenReturn(samplePageResponse())

        mockMvc.perform(get("/api/inquiries"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.content").isArray)
            .andExpect(jsonPath("$.totalElements").value(1))
            .andExpect(jsonPath("$.content[0].title").value("テスト問い合わせ"))
    }

    @Test
    fun `GET inquiry by id returns 200`() {
        whenever(service.findById(1L)).thenReturn(sampleResponse())

        mockMvc.perform(get("/api/inquiries/1"))
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.id").value(1))
            .andExpect(jsonPath("$.title").value("テスト問い合わせ"))
    }

    @Test
    fun `GET inquiry by id returns 404 when not found`() {
        whenever(service.findById(99L)).thenThrow(EntityNotFoundException("Inquiry not found: id=99"))

        mockMvc.perform(get("/api/inquiries/99"))
            .andExpect(status().isNotFound)
            .andExpect(jsonPath("$.status").value(404))
    }

    @Test
    fun `POST inquiry returns 201 with valid body`() {
        whenever(service.create(any())).thenReturn(sampleResponse())

        mockMvc.perform(
            post("/api/inquiries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "title": "新規問い合わせ",
                        "content": "お問い合わせ内容",
                        "requesterName": "山田太郎",
                        "requesterEmail": "yamada@example.com",
                        "priority": "MEDIUM"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isCreated)
            .andExpect(jsonPath("$.id").value(1))
    }

    @Test
    fun `POST inquiry returns 400 when title is blank`() {
        mockMvc.perform(
            post("/api/inquiries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "title": "",
                        "content": "内容",
                        "requesterName": "山田",
                        "requesterEmail": "yamada@example.com",
                        "priority": "MEDIUM"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `POST inquiry returns 400 when email is invalid`() {
        mockMvc.perform(
            post("/api/inquiries")
                .contentType(MediaType.APPLICATION_JSON)
                .content(
                    """
                    {
                        "title": "タイトル",
                        "content": "内容",
                        "requesterName": "山田",
                        "requesterEmail": "not-an-email",
                        "priority": "MEDIUM"
                    }
                    """.trimIndent()
                )
        )
            .andExpect(status().isBadRequest)
    }

    @Test
    fun `PATCH status returns 200`() {
        whenever(service.updateStatus(any(), any()))
            .thenReturn(sampleResponse().copy(status = InquiryStatus.IN_PROGRESS))

        mockMvc.perform(
            patch("/api/inquiries/1/status")
                .contentType(MediaType.APPLICATION_JSON)
                .content("""{"status": "IN_PROGRESS"}""")
        )
            .andExpect(status().isOk)
    }

    @Test
    fun `DELETE inquiry returns 204`() {
        doNothing().whenever(service).delete(1L)

        mockMvc.perform(delete("/api/inquiries/1"))
            .andExpect(status().isNoContent)
    }
}
