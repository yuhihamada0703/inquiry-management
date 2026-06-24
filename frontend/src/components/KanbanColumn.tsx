"use client";

import { useDroppable } from "@dnd-kit/core";
import { SortableContext, verticalListSortingStrategy } from "@dnd-kit/sortable";
import InquiryCard from "./InquiryCard";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";
import { STATUS_LABELS } from "@/types/inquiry";

interface Props {
  status: InquiryStatus;
  inquiries: Inquiry[];
  onCardClick: (inquiry: Inquiry) => void;
}

const columnStyle: Record<InquiryStatus, { header: string; bg: string }> = {
  PENDING: {
    header: "bg-red-50 border-red-200 text-red-800",
    bg: "bg-red-50/30",
  },
  IN_PROGRESS: {
    header: "bg-yellow-50 border-yellow-200 text-yellow-800",
    bg: "bg-yellow-50/30",
  },
  WAITING_REPLY: {
    header: "bg-blue-50 border-blue-200 text-blue-800",
    bg: "bg-blue-50/30",
  },
  COMPLETED: {
    header: "bg-green-50 border-green-200 text-green-800",
    bg: "bg-green-50/30",
  },
};

export default function KanbanColumn({ status, inquiries, onCardClick }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });
  const style = columnStyle[status];

  return (
    <div className="flex flex-col w-72 flex-shrink-0">
      <div className={`rounded-t-lg border px-4 py-2.5 ${style.header}`}>
        <span className="font-semibold text-sm">
          {STATUS_LABELS[status]}
        </span>
        <span className="ml-2 text-xs opacity-70">({inquiries.length})</span>
      </div>
      <div
        ref={setNodeRef}
        className={`flex-1 min-h-24 rounded-b-lg border border-t-0 p-2 space-y-2 transition-colors ${style.bg} ${
          isOver ? "ring-2 ring-primary/50" : ""
        }`}
      >
        <SortableContext
          items={inquiries.map((i) => i.id)}
          strategy={verticalListSortingStrategy}
        >
          {inquiries.map((inquiry) => (
            <InquiryCard
              key={inquiry.id}
              inquiry={inquiry}
              onClick={() => onCardClick(inquiry)}
            />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
