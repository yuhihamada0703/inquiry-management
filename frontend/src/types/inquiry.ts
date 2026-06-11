export type InquiryStatus = "PENDING" | "IN_PROGRESS" | "COMPLETED";
export type InquiryPriority = "HIGH" | "MEDIUM" | "LOW";

export interface Inquiry {
  id: number;
  title: string;
  content: string;
  requesterName: string;
  requesterEmail: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  dueDate: string | null;
  displayOrder: number;
  createdAt: string;
  updatedAt: string;
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
  requesterName: string;
  requesterEmail: string;
  priority: InquiryPriority;
  dueDate?: string | null;
}

export interface InquiryUpdateRequest {
  title: string;
  content: string;
  requesterName: string;
  requesterEmail: string;
  status: InquiryStatus;
  priority: InquiryPriority;
  dueDate?: string | null;
}

export interface ReorderItem {
  id: number;
  displayOrder: number;
}

export interface InquiryListParams {
  status?: InquiryStatus | null;
  priority?: InquiryPriority | null;
  keyword?: string;
  sort?: string;
  direction?: "asc" | "desc";
  page?: number;
  size?: number;
}

export const STATUS_LABELS: Record<InquiryStatus, string> = {
  PENDING: "未対応",
  IN_PROGRESS: "対応中",
  COMPLETED: "完了",
};

export const PRIORITY_LABELS: Record<InquiryPriority, string> = {
  HIGH: "高",
  MEDIUM: "中",
  LOW: "低",
};
