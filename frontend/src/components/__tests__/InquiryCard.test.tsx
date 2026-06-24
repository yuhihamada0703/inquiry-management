import { render, screen, fireEvent } from '@testing-library/react'
import InquiryCard from '../InquiryCard'
import type { Inquiry } from '@/types/inquiry'

jest.mock('@dnd-kit/sortable', () => ({
  useSortable: () => ({
    attributes: {},
    listeners: {},
    setNodeRef: jest.fn(),
    transform: null,
    transition: null,
    isDragging: false,
  }),
}))

jest.mock('@dnd-kit/utilities', () => ({
  CSS: {
    Transform: {
      toString: () => '',
    },
  },
}))

const baseInquiry: Inquiry = {
  id: 1,
  title: 'テスト問い合わせ',
  content: 'テスト内容です',
  memo: null,
  customerName: '山田太郎',
  customerNameKana: 'ヤマダタロウ',
  assigneeName: '田中担当',
  assigneeNameKana: 'タナカタントウ',
  requesterEmail: 'yamada@example.com',
  status: 'PENDING',
  dueDate: null,
  displayOrder: 0,
  createdAt: '2026-01-01T00:00:00',
  updatedAt: '2026-01-01T00:00:00',
  deletedAt: null,
}

describe('InquiryCard', () => {
  it('renders title and customer name', () => {
    render(<InquiryCard inquiry={baseInquiry} onClick={jest.fn()} />)

    expect(screen.getByText('テスト問い合わせ')).toBeInTheDocument()
    expect(screen.getByText('山田太郎')).toBeInTheDocument()
  })

  it('renders content', () => {
    render(<InquiryCard inquiry={baseInquiry} onClick={jest.fn()} />)

    expect(screen.getByText('テスト内容です')).toBeInTheDocument()
  })

  it('renders assignee name when provided', () => {
    render(<InquiryCard inquiry={baseInquiry} onClick={jest.fn()} />)

    expect(screen.getByText('田中担当')).toBeInTheDocument()
  })

  it('does not render assignee when empty', () => {
    const noAssignee = { ...baseInquiry, assigneeName: '' }
    render(<InquiryCard inquiry={noAssignee} onClick={jest.fn()} />)

    expect(screen.queryByText('田中担当')).not.toBeInTheDocument()
  })

  it('calls onClick when card is clicked', () => {
    const onClick = jest.fn()
    render(<InquiryCard inquiry={baseInquiry} onClick={onClick} />)

    fireEvent.click(screen.getByText('テスト問い合わせ'))

    expect(onClick).toHaveBeenCalledTimes(1)
  })

  it('renders due date when provided', () => {
    const withDueDate = { ...baseInquiry, dueDate: '2026-12-31' }
    render(<InquiryCard inquiry={withDueDate} onClick={jest.fn()} />)

    expect(screen.getByText(/2026-12-31/)).toBeInTheDocument()
  })

  it('shows overdue indicator for past due dates on non-completed inquiries', () => {
    const overdue = { ...baseInquiry, dueDate: '2020-01-01', status: 'PENDING' as const }
    render(<InquiryCard inquiry={overdue} onClick={jest.fn()} />)

    expect(screen.getByText(/⚠/)).toBeInTheDocument()
  })

  it('does not show overdue indicator for completed inquiries', () => {
    const completed = { ...baseInquiry, dueDate: '2020-01-01', status: 'COMPLETED' as const }
    render(<InquiryCard inquiry={completed} onClick={jest.fn()} />)

    expect(screen.queryByText(/⚠/)).not.toBeInTheDocument()
  })
})
