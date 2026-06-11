package com.example.inquiry.application.service

import com.example.inquiry.application.dto.*
import com.example.inquiry.domain.entity.Inquiry
import com.example.inquiry.domain.entity.InquiryPriority
import com.example.inquiry.domain.entity.InquiryStatus
import com.example.inquiry.domain.repository.InquiryRepository
import jakarta.persistence.EntityNotFoundException
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.junit.jupiter.api.assertThrows
import org.junit.jupiter.api.extension.ExtendWith
import org.mockito.InjectMocks
import org.mockito.Mock
import org.mockito.junit.jupiter.MockitoExtension
import org.mockito.kotlin.*
import java.util.Optional

@ExtendWith(MockitoExtension::class)
class InquiryServiceTest {

    @Mock private lateinit var repository: InquiryRepository
    @InjectMocks private lateinit var service: InquiryService

    private fun sampleInquiry(
        id: Long = 1L,
        displayOrder: Int = 0,
        status: InquiryStatus = InquiryStatus.PENDING
    ) = Inquiry(
        id = id,
        title = "テストタイトル",
        content = "テスト内容",
        requesterName = "山田太郎",
        requesterEmail = "yamada@example.com",
        priority = InquiryPriority.MEDIUM,
        displayOrder = displayOrder,
        status = status
    )

    @Test
    fun `findById returns response when found`() {
        val inquiry = sampleInquiry()
        whenever(repository.findById(1L)).thenReturn(Optional.of(inquiry))

        val result = service.findById(1L)

        assertThat(result.id).isEqualTo(1L)
        assertThat(result.title).isEqualTo("テストタイトル")
        assertThat(result.requesterEmail).isEqualTo("yamada@example.com")
    }

    @Test
    fun `findById throws EntityNotFoundException when not found`() {
        whenever(repository.findById(99L)).thenReturn(Optional.empty())

        assertThrows<EntityNotFoundException> { service.findById(99L) }
    }

    @Test
    fun `create assigns displayOrder as max plus one`() {
        whenever(repository.findByStatusOrderByDisplayOrderAsc(InquiryStatus.PENDING))
            .thenReturn(listOf(sampleInquiry(displayOrder = 0), sampleInquiry(displayOrder = 3)))
        whenever(repository.save(any())).thenAnswer { it.getArgument<Inquiry>(0) }

        service.create(
            InquiryCreateRequest(
                title = "新規問い合わせ",
                content = "内容",
                requesterName = "田中",
                requesterEmail = "tanaka@example.com",
                priority = InquiryPriority.LOW
            )
        )

        val captor = argumentCaptor<Inquiry>()
        verify(repository).save(captor.capture())
        assertThat(captor.firstValue.displayOrder).isEqualTo(4)
    }

    @Test
    fun `create assigns displayOrder 0 when no existing inquiries`() {
        whenever(repository.findByStatusOrderByDisplayOrderAsc(InquiryStatus.PENDING))
            .thenReturn(emptyList())
        whenever(repository.save(any())).thenAnswer { it.getArgument<Inquiry>(0) }

        service.create(
            InquiryCreateRequest(
                title = "初回問い合わせ",
                content = "内容",
                requesterName = "田中",
                requesterEmail = "tanaka@example.com",
                priority = InquiryPriority.HIGH
            )
        )

        val captor = argumentCaptor<Inquiry>()
        verify(repository).save(captor.capture())
        assertThat(captor.firstValue.displayOrder).isEqualTo(0)
    }

    @Test
    fun `update modifies inquiry fields`() {
        val inquiry = sampleInquiry()
        whenever(repository.findById(1L)).thenReturn(Optional.of(inquiry))
        whenever(repository.save(any())).thenAnswer { it.getArgument<Inquiry>(0) }

        val result = service.update(
            1L,
            InquiryUpdateRequest(
                title = "更新タイトル",
                content = "更新内容",
                requesterName = "鈴木",
                requesterEmail = "suzuki@example.com",
                status = InquiryStatus.IN_PROGRESS,
                priority = InquiryPriority.HIGH
            )
        )

        assertThat(result.title).isEqualTo("更新タイトル")
        assertThat(result.status).isEqualTo(InquiryStatus.IN_PROGRESS)
        assertThat(result.priority).isEqualTo(InquiryPriority.HIGH)
    }

    @Test
    fun `updateStatus changes status`() {
        val inquiry = sampleInquiry()
        whenever(repository.findById(1L)).thenReturn(Optional.of(inquiry))
        whenever(repository.save(any())).thenAnswer { it.getArgument<Inquiry>(0) }

        val result = service.updateStatus(1L, StatusUpdateRequest(InquiryStatus.COMPLETED))

        assertThat(result.status).isEqualTo(InquiryStatus.COMPLETED)
    }

    @Test
    fun `delete calls deleteById when inquiry exists`() {
        whenever(repository.existsById(1L)).thenReturn(true)
        doNothing().whenever(repository).deleteById(1L)

        service.delete(1L)

        verify(repository).deleteById(1L)
    }

    @Test
    fun `delete throws EntityNotFoundException when not found`() {
        whenever(repository.existsById(99L)).thenReturn(false)

        assertThrows<EntityNotFoundException> { service.delete(99L) }
    }
}
