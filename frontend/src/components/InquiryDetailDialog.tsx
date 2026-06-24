"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import type { Inquiry } from "@/types/inquiry";
import { STATUS_LABELS } from "@/types/inquiry";

interface Props {
  inquiry: Inquiry | null;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

const statusColor: Record<string, string> = {
  PENDING: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_REPLY: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="grid grid-cols-3 gap-2 text-sm">
      <span className="text-muted-foreground font-medium">{label}</span>
      <span className="col-span-2">{value}</span>
    </div>
  );
}

export default function InquiryDetailDialog({ inquiry, onClose, onEdit, onDelete }: Props) {
  if (!inquiry) return null;

  return (
    <Dialog open={!!inquiry} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="pr-6 leading-snug">{inquiry.title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-3 py-1">
          <div className="flex gap-2">
            <Badge className={statusColor[inquiry.status]}>
              {STATUS_LABELS[inquiry.status]}
            </Badge>
          </div>

          <Separator />

          <div className="space-y-2.5">
            <Row label="顧客名" value={inquiry.customerName} />
            <Row label="担当者" value={inquiry.assigneeName || "—"} />
            <Row label="メール" value={inquiry.requesterEmail} />
            {inquiry.dueDate && <Row label="対応期限" value={inquiry.dueDate} />}
          </div>

          <Separator />

          <div>
            <p className="text-sm text-muted-foreground font-medium mb-1">内容</p>
            <p className="text-sm whitespace-pre-wrap">{inquiry.content}</p>
          </div>

          {inquiry.memo && (
            <>
              <Separator />
              <div>
                <p className="text-xs text-muted-foreground font-medium mb-1">
                  内部メモ（顧客非公開）
                </p>
                <p className="text-sm whitespace-pre-wrap bg-amber-50 border border-amber-200 rounded p-2">
                  {inquiry.memo}
                </p>
              </div>
            </>
          )}

          <div className="grid grid-cols-2 gap-2 text-xs text-muted-foreground pt-1">
            <span>作成: {new Date(inquiry.createdAt).toLocaleString("ja-JP")}</span>
            <span>更新: {new Date(inquiry.updatedAt).toLocaleString("ja-JP")}</span>
          </div>
        </div>

        <div className="flex justify-between pt-2">
          <Button variant="destructive" size="sm" onClick={onDelete}>
            履歴へ移動
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={onClose}>
              閉じる
            </Button>
            <Button size="sm" onClick={onEdit}>
              編集
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
