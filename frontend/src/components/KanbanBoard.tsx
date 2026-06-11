"use client";

import { useState, useCallback } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import InquiryCard from "./InquiryCard";
import { useUpdateStatus, useReorder } from "@/hooks/useInquiries";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

const COLUMNS: InquiryStatus[] = ["PENDING", "IN_PROGRESS", "COMPLETED"];

interface Props {
  inquiries: Inquiry[];
  onCardClick: (inquiry: Inquiry) => void;
}

export default function KanbanBoard({ inquiries, onCardClick }: Props) {
  const [localItems, setLocalItems] = useState<Inquiry[]>(inquiries);
  const [activeInquiry, setActiveInquiry] = useState<Inquiry | null>(null);

  const updateStatus = useUpdateStatus();
  const reorder = useReorder();

  // Sync external data when not dragging
  const [isDragging, setIsDragging] = useState(false);
  if (!isDragging && JSON.stringify(localItems.map((i) => i.id)) !== JSON.stringify(inquiries.map((i) => i.id))) {
    setLocalItems(inquiries);
  }

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const byStatus = useCallback(
    (status: InquiryStatus) =>
      localItems
        .filter((i) => i.status === status)
        .sort((a, b) => a.displayOrder - b.displayOrder),
    [localItems]
  );

  function handleDragStart({ active }: { active: { id: string | number } }) {
    setIsDragging(true);
    setActiveInquiry(localItems.find((i) => i.id === active.id) ?? null);
  }

  function handleDragOver({ active, over }: DragOverEvent) {
    if (!over) return;
    const activeItem = localItems.find((i) => i.id === active.id);
    if (!activeItem) return;

    const overStatus = COLUMNS.includes(over.id as InquiryStatus)
      ? (over.id as InquiryStatus)
      : localItems.find((i) => i.id === over.id)?.status;

    if (overStatus && activeItem.status !== overStatus) {
      setLocalItems((prev) =>
        prev.map((i) => (i.id === activeItem.id ? { ...i, status: overStatus } : i))
      );
    }
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setIsDragging(false);
    setActiveInquiry(null);
    if (!over) return;

    const activeItem = localItems.find((i) => i.id === active.id);
    const overItem = localItems.find((i) => i.id === over.id);
    if (!activeItem) return;

    const targetStatus = COLUMNS.includes(over.id as InquiryStatus)
      ? (over.id as InquiryStatus)
      : overItem?.status ?? activeItem.status;

    if (activeItem.status !== targetStatus) {
      updateStatus.mutate({ id: activeItem.id, status: targetStatus });
    }

    const columnItems = localItems.filter((i) => i.status === targetStatus);
    const oldIndex = columnItems.findIndex((i) => i.id === active.id);
    const newIndex = overItem ? columnItems.findIndex((i) => i.id === over.id) : columnItems.length - 1;

    if (oldIndex !== newIndex) {
      const reordered = arrayMove(columnItems, oldIndex, newIndex);
      const reorderItems = reordered.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      reorder.mutate(reorderItems);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="flex gap-4 overflow-x-auto pb-4">
        {COLUMNS.map((status) => (
          <KanbanColumn
            key={status}
            status={status}
            inquiries={byStatus(status)}
            onCardClick={onCardClick}
          />
        ))}
      </div>
      <DragOverlay>
        {activeInquiry && (
          <InquiryCard inquiry={activeInquiry} onClick={() => {}} />
        )}
      </DragOverlay>
    </DndContext>
  );
}
