"use client";

import { useState, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { inquiryApi } from "@/lib/api";
import { useHardDeleteInquiry } from "@/hooks/useInquiries";
import type { Inquiry } from "@/types/inquiry";
import { STATUS_LABELS } from "@/types/inquiry";

interface Props {
  open: boolean;
  onClose: () => void;
}

const statusColor: Record<string, string> = {
  PENDING: "bg-red-100 text-red-700",
  IN_PROGRESS: "bg-yellow-100 text-yellow-700",
  WAITING_REPLY: "bg-blue-100 text-blue-700",
  COMPLETED: "bg-green-100 text-green-700",
};

interface AdminDeleteDialogProps {
  inquiry: Inquiry;
  onCancel: () => void;
  onSuccess: () => void;
}

function AdminDeleteDialog({ inquiry, onCancel, onSuccess }: AdminDeleteDialogProps) {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const hardDelete = useHardDeleteInquiry();

  async function handleConfirm() {
    setError("");
    try {
      await hardDelete.mutateAsync({ id: inquiry.id, data: { adminPassword: password } });
      onSuccess();
    } catch {
      setError("パスワードが正しくありません");
    }
  }

  return (
    <Dialog open={true} onOpenChange={(v) => !v && onCancel()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="text-sm">完全削除（管理者認証）</DialogTitle>
        </DialogHeader>
        <p className="text-xs text-muted-foreground">
          「{inquiry.title}」を完全に削除します。この操作は取り消せません。
        </p>
        <div className="space-y-1.5">
          <Label htmlFor="admin-pw" className="text-xs">管理者パスワード</Label>
          <Input
            id="admin-pw"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleConfirm()}
            placeholder="パスワードを入力"
            className="h-8 text-sm"
            autoFocus
          />
          {error && <p className="text-xs text-red-600">{error}</p>}
        </div>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" size="sm" onClick={onCancel}>
            キャンセル
          </Button>
          <Button
            variant="destructive"
            size="sm"
            onClick={handleConfirm}
            disabled={!password || hardDelete.isPending}
          >
            {hardDelete.isPending ? "削除中..." : "完全削除"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function HistoryDialog({ open, onClose }: Props) {
  const [historyItems, setHistoryItems] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(false);
  const [targetInquiry, setTargetInquiry] = useState<Inquiry | null>(null);
  const qc = useQueryClient();

  useEffect(() => {
    if (open) fetchHistory();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  async function fetchHistory() {
    setLoading(true);
    try {
      const items = await inquiryApi.history();
      setHistoryItems(items);
    } finally {
      setLoading(false);
    }
  }

  function handleOpen(v: boolean) {
    if (!v) onClose();
  }

  function handleDeleteSuccess() {
    setTargetInquiry(null);
    fetchHistory();
    qc.invalidateQueries({ queryKey: ["inquiries"] });
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>削除済み履歴</DialogTitle>
          </DialogHeader>

          {loading && (
            <p className="text-center text-muted-foreground py-8 text-sm">読み込み中...</p>
          )}

          {!loading && historyItems.length === 0 && (
            <p className="text-center text-muted-foreground py-8 text-sm">
              削除済みの問い合わせはありません
            </p>
          )}

          {!loading && historyItems.length > 0 && (
            <div className="space-y-2">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="border rounded-lg p-3 flex items-start gap-3"
                >
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-medium truncate">{item.title}</span>
                      <Badge className={`text-xs ${statusColor[item.status]}`}>
                        {STATUS_LABELS[item.status]}
                      </Badge>
                    </div>
                    <div className="flex gap-3 text-xs text-muted-foreground">
                      <span>顧客: {item.customerName}</span>
                      {item.assigneeName && <span>担当: {item.assigneeName}</span>}
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1">{item.content}</p>
                    <p className="text-xs text-muted-foreground">
                      削除日時: {item.deletedAt ? new Date(item.deletedAt).toLocaleString("ja-JP") : "—"}
                    </p>
                  </div>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="shrink-0 text-xs h-7 px-2"
                    onClick={() => setTargetInquiry(item)}
                  >
                    完全削除
                  </Button>
                </div>
              ))}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {targetInquiry && (
        <AdminDeleteDialog
          inquiry={targetInquiry}
          onCancel={() => setTargetInquiry(null)}
          onSuccess={handleDeleteSuccess}
        />
      )}
    </>
  );
}
