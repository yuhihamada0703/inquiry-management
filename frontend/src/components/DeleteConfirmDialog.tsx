"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useDeleteInquiry } from "@/hooks/useInquiries";
import type { Inquiry } from "@/types/inquiry";

interface Props {
  inquiry: Inquiry | null;
  onClose: () => void;
}

export default function DeleteConfirmDialog({ inquiry, onClose }: Props) {
  const del = useDeleteInquiry();

  async function handleDelete() {
    if (!inquiry) return;
    await del.mutateAsync(inquiry.id);
    onClose();
  }

  return (
    <Dialog open={!!inquiry} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>問い合わせを履歴へ移動</DialogTitle>
        </DialogHeader>
        <p className="text-sm text-muted-foreground">
          「{inquiry?.title}」を履歴に移動しますか？
          <br />
          <span className="text-xs">履歴画面から復元はできません。完全削除は管理者のみ可能です。</span>
        </p>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            キャンセル
          </Button>
          <Button variant="destructive" onClick={handleDelete} disabled={del.isPending}>
            {del.isPending ? "移動中..." : "履歴へ移動"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
