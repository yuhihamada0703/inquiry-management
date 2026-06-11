"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Inquiry } from "@/types/inquiry";

interface Props {
  inquiry: Inquiry;
  onClick: () => void;
}

export default function InquiryCard({ inquiry, onClick }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: inquiry.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const isOverdue =
    inquiry.dueDate && new Date(inquiry.dueDate) < new Date() && inquiry.status !== "COMPLETED";

  return (
    <Card
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing"
      onClick={onClick}
    >
      <CardHeader className="pb-1 pt-3 px-3">
        <p className="text-sm font-medium leading-tight line-clamp-2">{inquiry.title}</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-1.5">
        <p className="text-xs text-muted-foreground line-clamp-2">{inquiry.content}</p>
        <div className="flex items-center justify-between gap-1">
          <span className="text-xs text-muted-foreground truncate">{inquiry.customerName}</span>
          {inquiry.assigneeName && (
            <span className="text-xs text-muted-foreground truncate">{inquiry.assigneeName}</span>
          )}
        </div>
        {inquiry.dueDate && (
          <p className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
            {isOverdue ? "⚠ " : "期限: "}
            {inquiry.dueDate}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
