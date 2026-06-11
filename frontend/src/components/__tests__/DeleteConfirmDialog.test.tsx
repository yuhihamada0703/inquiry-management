import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import DeleteConfirmDialog from '../DeleteConfirmDialog'
import type { Inquiry } from '@/types/inquiry'

const mockMutateAsync = jest.fn()

jest.mock('@/hooks/useInquiries', () => ({
  useDeleteInquiry: () => ({
    mutateAsync: mockMutateAsync,
    isPending: false,
  }),
}))

const sampleInquiry: Inquiry = {
  id: 1,
  title: '削除テスト問い合わせ',
  content: '内容',
  requesterName: '山田',
  requesterEmail: 'yamada@example.com',
  status: 'PENDING',
  priority: 'MEDIUM',
  dueDate: null,
  displayOrder: 0,
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
}

describe('DeleteConfirmDialog', () => {
  beforeEach(() => {
    mockMutateAsync.mockReset()
  })

  it('shows the dialog with inquiry title when inquiry is provided', () => {
    render(<DeleteConfirmDialog inquiry={sampleInquiry} onClose={jest.fn()} />)

    expect(screen.getByText('問い合わせを削除')).toBeInTheDocument()
    expect(screen.getByText(/削除テスト問い合わせ/)).toBeInTheDocument()
  })

  it('does not render dialog content when inquiry is null', () => {
    render(<DeleteConfirmDialog inquiry={null} onClose={jest.fn()} />)

    expect(screen.queryByText('問い合わせを削除')).not.toBeInTheDocument()
  })

  it('calls onClose when cancel button is clicked', () => {
    const onClose = jest.fn()
    render(<DeleteConfirmDialog inquiry={sampleInquiry} onClose={onClose} />)

    fireEvent.click(screen.getByText('キャンセル'))

    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('calls mutateAsync with inquiry id when delete button is clicked', async () => {
    mockMutateAsync.mockResolvedValue(undefined)
    const onClose = jest.fn()
    render(<DeleteConfirmDialog inquiry={sampleInquiry} onClose={onClose} />)

    fireEvent.click(screen.getByText('削除'))

    await waitFor(() => {
      expect(mockMutateAsync).toHaveBeenCalledWith(1)
    })
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('shows deletion warning message', () => {
    render(<DeleteConfirmDialog inquiry={sampleInquiry} onClose={jest.fn()} />)

    expect(screen.getByText(/この操作は取り消せません/)).toBeInTheDocument()
  })
})
