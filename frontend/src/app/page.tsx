"use client";

import { useState, useDeferredValue } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import KanbanBoard from "@/components/KanbanBoard";
import InquiryDetailDialog from "@/components/InquiryDetailDialog";
import InquiryFormModal from "@/components/InquiryFormModal";
import DeleteConfirmDialog from "@/components/DeleteConfirmDialog";
import { useInquiries } from "@/hooks/useInquiries";
import type { Inquiry } from "@/types/inquiry";

type SortKey = "createdAt" | "priority" | "dueDate";

export default function HomePage() {
  const [keyword, setKeyword] = useState("");
  const [sort, setSort] = useState<SortKey>("createdAt");
  const [direction, setDirection] = useState<"asc" | "desc">("desc");

  const deferredKeyword = useDeferredValue(keyword);

  const { data, isLoading, isError } = useInquiries({
    keyword: deferredKeyword || undefined,
    sort,
    direction,
    size: 200,
  });

  const [detailInquiry, setDetailInquiry] = useState<Inquiry | null>(null);
  const [editInquiry, setEditInquiry] = useState<Inquiry | null>(null);
  const [deleteInquiry, setDeleteInquiry] = useState<Inquiry | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  function handleCardClick(inquiry: Inquiry) {
    setDetailInquiry(inquiry);
  }

  function handleEdit() {
    setEditInquiry(detailInquiry);
    setDetailInquiry(null);
  }

  function handleDelete() {
    setDeleteInquiry(detailInquiry);
    setDetailInquiry(null);
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-white sticky top-0 z-10">
        <div className="max-w-screen-2xl mx-auto px-4 py-3 flex items-center gap-3">
          <h1 className="text-lg font-bold whitespace-nowrap">問い合わせ管理</h1>
          <div className="flex-1 max-w-sm">
            <Input
              placeholder="キーワード検索..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="h-8 text-sm"
            />
          </div>
          <div className="flex items-center gap-2 ml-auto">
            <Select value={sort} onValueChange={(v) => setSort(v as SortKey)}>
              <SelectTrigger className="h-8 text-xs w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="createdAt">作成日時</SelectItem>
                <SelectItem value="priority">優先度</SelectItem>
                <SelectItem value="dueDate">対応期限</SelectItem>
              </SelectContent>
            </Select>
            <Select value={direction} onValueChange={(v) => setDirection(v as "asc" | "desc")}>
              <SelectTrigger className="h-8 text-xs w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="desc">降順</SelectItem>
                <SelectItem value="asc">昇順</SelectItem>
              </SelectContent>
            </Select>
            <Button size="sm" onClick={() => setShowCreate(true)}>
              + 新規登録
            </Button>
          </div>
        </div>
      </header>

      {/* Main */}
      <main className="max-w-screen-2xl mx-auto px-4 py-6">
        {isLoading && (
          <div className="text-center text-muted-foreground py-20">読み込み中...</div>
        )}
        {isError && (
          <div className="text-center text-red-600 py-20">
            データの取得に失敗しました。バックエンドが起動しているか確認してください。
          </div>
        )}
        {data && (
          <KanbanBoard
            inquiries={data.content}
            onCardClick={handleCardClick}
          />
        )}
      </main>

      {/* Dialogs */}
      <InquiryDetailDialog
        inquiry={detailInquiry}
        onClose={() => setDetailInquiry(null)}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
      <InquiryFormModal
        open={showCreate}
        onClose={() => setShowCreate(false)}
      />
      <InquiryFormModal
        open={!!editInquiry}
        onClose={() => setEditInquiry(null)}
        inquiry={editInquiry ?? undefined}
      />
      <DeleteConfirmDialog
        inquiry={deleteInquiry}
        onClose={() => setDeleteInquiry(null)}
      />
    </div>
  );
}
