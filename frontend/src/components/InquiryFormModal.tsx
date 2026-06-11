"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateInquiry, useUpdateInquiry } from "@/hooks/useInquiries";
import type { Inquiry } from "@/types/inquiry";

const schema = z.object({
  title: z.string().min(1, "件名は必須です").max(100, "100文字以内で入力してください"),
  content: z.string().min(1, "内容は必須です").max(2000, "2000文字以内で入力してください"),
  requesterName: z.string().min(1, "問い合わせ者名は必須です").max(50),
  requesterEmail: z.string().min(1, "メールアドレスは必須です").email("正しいメール形式で入力してください"),
  priority: z.enum(["HIGH", "MEDIUM", "LOW"]),
  status: z.enum(["PENDING", "IN_PROGRESS", "COMPLETED"]).optional(),
  dueDate: z.string().optional().nullable(),
});

type FormValues = z.infer<typeof schema>;

interface Props {
  open: boolean;
  onClose: () => void;
  inquiry?: Inquiry;
}

export default function InquiryFormModal({ open, onClose, inquiry }: Props) {
  const isEdit = !!inquiry;
  const create = useCreateInquiry();
  const update = useUpdateInquiry();

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      priority: "MEDIUM",
      status: "PENDING",
    },
  });

  useEffect(() => {
    if (open) {
      if (inquiry) {
        reset({
          title: inquiry.title,
          content: inquiry.content,
          requesterName: inquiry.requesterName,
          requesterEmail: inquiry.requesterEmail,
          priority: inquiry.priority,
          status: inquiry.status,
          dueDate: inquiry.dueDate ?? "",
        });
      } else {
        reset({ priority: "MEDIUM", status: "PENDING", dueDate: "" });
      }
    }
  }, [open, inquiry, reset]);

  async function onSubmit(values: FormValues) {
    const dueDate = values.dueDate || null;
    if (isEdit && inquiry) {
      await update.mutateAsync({
        id: inquiry.id,
        data: {
          title: values.title,
          content: values.content,
          requesterName: values.requesterName,
          requesterEmail: values.requesterEmail,
          status: values.status ?? inquiry.status,
          priority: values.priority,
          dueDate,
        },
      });
    } else {
      await create.mutateAsync({
        title: values.title,
        content: values.content,
        requesterName: values.requesterName,
        requesterEmail: values.requesterEmail,
        priority: values.priority,
        dueDate,
      });
    }
    onClose();
  }

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "問い合わせを編集" : "新規問い合わせ登録"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="title">件名 *</Label>
            <Input id="title" {...register("title")} placeholder="件名を入力" />
            {errors.title && <p className="text-xs text-red-600">{errors.title.message}</p>}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="content">内容 *</Label>
            <Textarea
              id="content"
              {...register("content")}
              placeholder="問い合わせ内容を入力"
              rows={4}
            />
            {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="requesterName">問い合わせ者名 *</Label>
              <Input id="requesterName" {...register("requesterName")} placeholder="山田 太郎" />
              {errors.requesterName && (
                <p className="text-xs text-red-600">{errors.requesterName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="requesterEmail">メールアドレス *</Label>
              <Input
                id="requesterEmail"
                type="email"
                {...register("requesterEmail")}
                placeholder="example@email.com"
              />
              {errors.requesterEmail && (
                <p className="text-xs text-red-600">{errors.requesterEmail.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>優先度</Label>
              <Select
                value={watch("priority")}
                onValueChange={(v) => setValue("priority", v as "HIGH" | "MEDIUM" | "LOW")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="HIGH">高</SelectItem>
                  <SelectItem value="MEDIUM">中</SelectItem>
                  <SelectItem value="LOW">低</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {isEdit && (
              <div className="space-y-1.5">
                <Label>ステータス</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) =>
                    setValue("status", v as "PENDING" | "IN_PROGRESS" | "COMPLETED")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">未対応</SelectItem>
                    <SelectItem value="IN_PROGRESS">対応中</SelectItem>
                    <SelectItem value="COMPLETED">完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="dueDate">対応期限</Label>
            <Input id="dueDate" type="date" {...register("dueDate")} />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              キャンセル
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "保存中..." : isEdit ? "更新" : "登録"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
