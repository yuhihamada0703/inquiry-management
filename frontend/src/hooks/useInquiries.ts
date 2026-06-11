import {
  useQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";
import { inquiryApi } from "@/lib/api";
import type {
  InquiryListParams,
  InquiryCreateRequest,
  InquiryUpdateRequest,
  ReorderItem,
} from "@/types/inquiry";

const KEYS = {
  all: ["inquiries"] as const,
  list: (params: InquiryListParams) => ["inquiries", "list", params] as const,
  detail: (id: number) => ["inquiries", id] as const,
};

export function useInquiries(params: InquiryListParams = {}) {
  return useQuery({
    queryKey: KEYS.list(params),
    queryFn: () => inquiryApi.list(params),
  });
}

export function useInquiry(id: number) {
  return useQuery({
    queryKey: KEYS.detail(id),
    queryFn: () => inquiryApi.get(id),
    enabled: id > 0,
  });
}

export function useCreateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: InquiryCreateRequest) => inquiryApi.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: InquiryUpdateRequest }) =>
      inquiryApi.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useUpdateStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) =>
      inquiryApi.updateStatus(id, status),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useReorder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (items: ReorderItem[]) => inquiryApi.reorder(items),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}

export function useDeleteInquiry() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => inquiryApi.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: KEYS.all }),
  });
}
