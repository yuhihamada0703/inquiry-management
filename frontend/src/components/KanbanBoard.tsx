"use client";

import { useState, useCallback, useEffect } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  PointerSensor,
  useSensor,
  useSensors,
  rectIntersection,
  closestCenter,
} from "@dnd-kit/core";
import type { CollisionDetection } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import KanbanColumn from "./KanbanColumn";
import { useUpdateStatus, useReorder } from "@/hooks/useInquiries";
import type { Inquiry, InquiryStatus } from "@/types/inquiry";

const COLUMNS: InquiryStatus[] = ["PENDING", "IN_PROGRESS", "WAITING_REPLY", "COMPLETED"];

interface Props {
  inquiries: Inquiry[];
  onCardClick: (inquiry: Inquiry) => void;
  sort: string;
  direction: "asc" | "desc";
}

// rectIntersection first → same-column cards only during vertical drag;
// closestCenter fallback for gaps between cards
const customCollision: CollisionDetection = (args) => {
  const intersections = rectIntersection(args);
  return intersections.length > 0 ? intersections : closestCenter(args);
};

function sortItems(items: Inquiry[], sort: string, direction: "asc" | "desc"): Inquiry[] {
  const dir = direction === "asc" ? 1 : -1;
  return [...items].sort((a, b) => {
    switch (sort) {
      case "customerName":
        return dir * (a.customerNameKana || a.customerName || "").localeCompare(
          b.customerNameKana || b.customerName || "", "ja"
        );
      case "assigneeName":
        return dir * (a.assigneeNameKana || a.assigneeName || "").localeCompare(
          b.assigneeNameKana || b.assigneeName || "", "ja"
        );
      case "dueDate": {
        const ad = a.dueDate ?? "9999-99-99";
        const bd = b.dueDate ?? "9999-99-99";
        return dir * ad.localeCompare(bd);
      }
      case "createdAt":
        return dir * a.createdAt.localeCompare(b.createdAt);
      default:
        return a.displayOrder - b.displayOrder;
    }
  });
}

export default function KanbanBoard({ inquiries, onCardClick, sort, direction }: Props) {
  const [localItems, setLocalItems] = useState<Inquiry[]>(inquiries);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStartStatus, setDragStartStatus] = useState<InquiryStatus | null>(null);

  const updateStatus = useUpdateStatus();
  const reorder = useReorder();

  useEffect(() => {
    if (!isDragging && !updateStatus.isPending && !reorder.isPending) {
      setLocalItems(inquiries);
    }
  }, [inquiries, isDragging, updateStatus.isPending, reorder.isPending]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const byStatus = useCallback(
    (status: InquiryStatus) => {
      const filtered = localItems.filter((i) => i.status === status);
      // ドラッグ中は displayOrder で固定（ガタつき防止）
      if (isDragging) return filtered.sort((a, b) => a.displayOrder - b.displayOrder);
      return sortItems(filtered, sort, direction);
    },
    [localItems, isDragging, sort, direction]
  );

  function handleDragStart({ active }: { active: { id: string | number } }) {
    setIsDragging(true);
    const item = localItems.find((i) => i.id === active.id) ?? null;
    setDragStartStatus(item?.status ?? null);
  }

  function handleDragOver({ active, over, delta }: DragOverEvent) {
    if (!over) return;
    const activeItem = localItems.find((i) => i.id === active.id);
    if (!activeItem) return;

    const overStatus = COLUMNS.includes(over.id as InquiryStatus)
      ? (over.id as InquiryStatus)
      : localItems.find((i) => i.id === over.id)?.status;

    if (!overStatus || activeItem.status === overStatus) return;

    // 列幅288px (w-72) の約40%以上水平移動した場合のみ列変更を許可
    // これにより縦ドラッグ時の誤検出を防ぐ
    if (Math.abs(delta.x) < 120) return;

    setLocalItems((prev) =>
      prev.map((i) => (i.id === activeItem.id ? { ...i, status: overStatus } : i))
    );
  }

  function handleDragEnd({ active, over }: DragEndEvent) {
    setIsDragging(false);

    if (!over) {
      setDragStartStatus(null);
      return;
    }

    const activeItem = localItems.find((i) => i.id === active.id);
    const overItem = localItems.find((i) => i.id === over.id);
    if (!activeItem) {
      setDragStartStatus(null);
      return;
    }

    const targetStatus = COLUMNS.includes(over.id as InquiryStatus)
      ? (over.id as InquiryStatus)
      : overItem?.status ?? activeItem.status;

    // ① バグ修正: dragStartStatus（ドラッグ前）と比較してステータス変更を確実に呼ぶ
    if (dragStartStatus && dragStartStatus !== targetStatus) {
      updateStatus.mutate({ id: activeItem.id, status: targetStatus });
    }
    setDragStartStatus(null);

    // ドラッグ中は displayOrder 順で表示しているので、その順でカラムアイテムを取得
    const columnItems = localItems
      .filter((i) => i.status === targetStatus)
      .sort((a, b) => a.displayOrder - b.displayOrder);

    const oldIndex = columnItems.findIndex((i) => i.id === active.id);
    const newIndex = overItem && overItem.status === targetStatus
      ? columnItems.findIndex((i) => i.id === over.id)
      : columnItems.length - 1;

    if (oldIndex !== -1 && oldIndex !== newIndex) {
      const reordered = arrayMove(columnItems, oldIndex, newIndex);
      // ② localItems を即座更新してスムーズな動きを実現
      const updatedItems = localItems.map((item) => {
        const newOrder = reordered.findIndex((r) => r.id === item.id);
        if (newOrder !== -1) return { ...item, displayOrder: newOrder };
        return item;
      });
      setLocalItems(updatedItems);

      const reorderItems = reordered.map((item, idx) => ({ id: item.id, displayOrder: idx }));
      reorder.mutate(reorderItems);
    }
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={customCollision}
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
    </DndContext>
  );
}
