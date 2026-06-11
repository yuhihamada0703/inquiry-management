"use client";

import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import type { Inquiry } from "@/types/inquiry";
import { PRIORITY_LABELS } from "@/types/inquiry";

interface Props {
  inquiry: Inquiry;
  onClick: () => void;
}

const priorityColor: Record<string, string> = {
  HIGH: "bg-red-100 text-red-700 border-red-200",
  MEDIUM: "bg-yellow-100 text-yellow-700 border-yellow-200",
  LOW: "bg-green-100 text-green-700 border-green-200",
};

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
      className="cursor-grab active:cursor-grabbing hover:shadow-md transition-shadow"
      onClick={onClick}
    >
      <CardHeader className="pb-2 pt-3 px-3">
        <p className="text-sm font-medium leading-tight line-clamp-2">{inquiry.title}</p>
      </CardHeader>
      <CardContent className="px-3 pb-3 space-y-2">
        <p className="text-xs text-muted-foreground line-clamp-2">{inquiry.content}</p>
        <div className="flex items-center gap-1.5 flex-wrap">
          <Badge variant="outline" className={`text-xs ${priorityColor[inquiry.priority]}`}>
            {PRIORITY_LABELS[inquiry.priority]}
          </Badge>
          {inquiry.dueDate && (
            <span className={`text-xs ${isOverdue ? "text-red-600 font-medium" : "text-muted-foreground"}`}>
              {isOverdue ? "⚠ " : ""}
              {inquiry.dueDate}
            </span>
          )}
        </div>
        <p className="text-xs text-muted-foreground">{inquiry.requesterName}</p>
      </CardContent>
    </Card>
  );
}
