import axios from "axios";
import type {
  Inquiry,
  InquiryStatus,
  InquiryCreateRequest,
  InquiryUpdateRequest,
  InquiryListParams,
  PageResponse,
  ReorderItem,
  HardDeleteRequest,
} from "@/types/inquiry";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8080",
  headers: { "Content-Type": "application/json" },
});

export const inquiryApi = {
  list(params: InquiryListParams = {}): Promise<PageResponse<Inquiry>> {
    const cleaned = Object.fromEntries(
      Object.entries(params).filter(([, v]) => v !== null && v !== undefined && v !== "")
    );
    return api.get("/api/inquiries", { params: cleaned }).then((r) => r.data);
  },

  history(): Promise<Inquiry[]> {
    return api.get("/api/inquiries/history").then((r) => r.data);
  },

  get(id: number): Promise<Inquiry> {
    return api.get(`/api/inquiries/${id}`).then((r) => r.data);
  },

  create(data: InquiryCreateRequest): Promise<Inquiry> {
    return api.post("/api/inquiries", data).then((r) => r.data);
  },

  update(id: number, data: InquiryUpdateRequest): Promise<Inquiry> {
    return api.put(`/api/inquiries/${id}`, data).then((r) => r.data);
  },

  updateStatus(id: number, status: InquiryStatus): Promise<Inquiry> {
    return api.patch(`/api/inquiries/${id}/status`, { status }).then((r) => r.data);
  },

  reorder(items: ReorderItem[]): Promise<void> {
    return api.patch("/api/inquiries/reorder", { items }).then(() => undefined);
  },

  softDelete(id: number): Promise<void> {
    return api.delete(`/api/inquiries/${id}`).then(() => undefined);
  },

  hardDelete(id: number, data: HardDeleteRequest): Promise<void> {
    return api.delete(`/api/inquiries/${id}/permanent`, { data }).then(() => undefined);
  },
};
