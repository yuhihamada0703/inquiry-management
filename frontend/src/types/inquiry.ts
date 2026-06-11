export type InquiryStatus = "PENDING" | "IN_PROGRESS" | "WAITING_REPLY" | "COMPLETED";

export interface Inquiry {
  id: number;
  title: string;
  content: string;
  memo: string | null;
  customerName: string;
  customerNameKana: string | null;
  assigneeName: string;
  assigneeNameKana: string | null;
  requesterEmail: string;
  status: InquiryStatus;
  dueDate: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
  deletedAt: string | null;
}

export interface PageResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

export interface InquiryCreateRequest {
  title: string;
  content: string;
  memo?: string | null;
  customerName: string;
  customerNameKana?: string;
  assigneeName?: string;
  assigneeNameKana?: string;
  requesterEmail: string;
  dueDate?: string | null;
}

export interface InquiryUpdateRequest {
  title: string;
  content: string;
  memo?: string | null;
  customerName: string;
  customerNameKana?: string;
  assigneeName?: string;
  assigneeNameKana?: string;
  requesterEmail: string;
  status: InquiryStatus;
  dueDate?: string | null;
}

export interface HardDeleteRequest {
  adminPassword: string;
}

export interface ReorderItem {
  id: number;
  displayOrder: number;
}

export interface InquiryListParams {
  status?: InquiryStatus | null;
  keyword?: string;
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  size?: number;
}

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: "未対応",
  IN_PROGRESS: "対応中",
  WAITING_REPLY: "回答待ち",
  COMPLETED: "完了",
};
