"use client";

import { useEffect, useMemo, useState } from "react";
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

const selectClass =
  "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm focus:outline-none focus:ring-1 focus:ring-ring";

interface DatePickerProps {
  value: string;
  onChange: (v: string) => void;
}

function DateScrollPicker({ value, onChange }: DatePickerProps) {
  const today = new Date();
  const currentYear = today.getFullYear();

  const parse = (v: string) => {
    const p = v ? v.split("-") : [];
    return { y: p[0] ?? "", m: p[1] ?? "", d: p[2] ?? "" };
  };

  const initial = parse(value);
  const [y, setY] = useState(initial.y);
  const [m, setM] = useState(initial.m);
  const [d, setD] = useState(initial.d);

  const initialYear = value ? Number(value.split("-")[0]) : 0;
  const years = useMemo(() => {
    const base = Array.from({ length: 5 }, (_, i) => currentYear + i);
    // 既存の問い合わせに過去年の期限がある場合（編集時）はその年も選択肢に含める
    if (initialYear && initialYear < currentYear && !base.includes(initialYear)) {
      return [initialYear, ...base];
    }
    return base;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentYear]);
  const months = Array.from({ length: 12 }, (_, i) => i + 1);
  const daysInMonth = y && m ? new Date(Number(y), Number(m), 0).getDate() : 31;
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);

  function emit(ny: string, nm: string, nd: string) {
    if (ny && nm && nd) {
      const clamped = Math.min(Number(nd), new Date(Number(ny), Number(nm), 0).getDate());
      onChange(`${ny}-${nm.padStart(2, "0")}-${String(clamped).padStart(2, "0")}`);
    } else if (!ny) {
      onChange("");
    }
  }

  return (
    <div className="flex gap-1.5 items-center">
      <select
        className={selectClass}
        value={y}
        onChange={(e) => { setY(e.target.value); emit(e.target.value, m, d); }}
      >
        <option value="">年</option>
        {years.map((yr) => (
          <option key={yr} value={String(yr)}>{yr}年</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={m}
        onChange={(e) => { setM(e.target.value); emit(y, e.target.value, d); }}
      >
        <option value="">月</option>
        {months.map((mo) => (
          <option key={mo} value={String(mo).padStart(2, "0")}>{mo}月</option>
        ))}
      </select>
      <select
        className={selectClass}
        value={d}
        onChange={(e) => { setD(e.target.value); emit(y, m, e.target.value); }}
      >
        <option value="">日</option>
        {days.map((dy) => (
          <option key={dy} value={String(dy).padStart(2, "0")}>{dy}日</option>
        ))}
      </select>
    </div>
  );
}

const schema = z.object({
  title: z.string().min(1, "件名は必須です").max(100, "100文字以内で入力してください"),
  content: z.string().min(1, "内容は必須です").max(2000, "2000文字以内で入力してください"),
  memo: z.string().max(1000, "1000文字以内で入力してください").optional().nullable(),
  customerName: z.string().min(1, "顧客名は必須です").max(50),
  customerNameKana: z.string().max(100).optional(),
  assigneeName: z.string().max(50).optional(),
  assigneeNameKana: z.string().max(100).optional(),
  requesterEmail: z.string().min(1, "メールアドレスは必須です").email("正しいメール形式で入力してください"),
  status: z.enum(["PENDING", "IN_PROGRESS", "WAITING_REPLY", "COMPLETED"]).optional(),
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
      status: "PENDING",
    },
  });

  useEffect(() => {
    if (open) {
      if (inquiry) {
        reset({
          title: inquiry.title,
          content: inquiry.content,
          memo: inquiry.memo ?? "",
          customerName: inquiry.customerName,
          customerNameKana: inquiry.customerNameKana ?? "",
          assigneeName: inquiry.assigneeName,
          assigneeNameKana: inquiry.assigneeNameKana ?? "",
          requesterEmail: inquiry.requesterEmail,
          status: inquiry.status,
          dueDate: inquiry.dueDate ?? "",
        });
      } else {
        reset({ status: "PENDING", dueDate: "", memo: "", assigneeName: "", customerNameKana: "", assigneeNameKana: "" });
      }
    }
  }, [open, inquiry, reset]);

  async function onSubmit(values: FormValues) {
    const dueDate = values.dueDate || null;
    const memo = values.memo || null;
    if (isEdit && inquiry) {
      await update.mutateAsync({
        id: inquiry.id,
        data: {
          title: values.title,
          content: values.content,
          memo,
          customerName: values.customerName,
          customerNameKana: values.customerNameKana || undefined,
          assigneeName: values.assigneeName ?? "",
          assigneeNameKana: values.assigneeNameKana || undefined,
          requesterEmail: values.requesterEmail,
          status: values.status ?? inquiry.status,
          dueDate,
        },
      });
    } else {
      await create.mutateAsync({
        title: values.title,
        content: values.content,
        memo,
        customerName: values.customerName,
        customerNameKana: values.customerNameKana || undefined,
        assigneeName: values.assigneeName ?? "",
        assigneeNameKana: values.assigneeNameKana || undefined,
        requesterEmail: values.requesterEmail,
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

          <div className="space-y-1.5">
            <Label htmlFor="memo" className="text-muted-foreground">
              内部メモ <span className="text-xs">（顧客非公開）</span>
            </Label>
            <Textarea
              id="memo"
              {...register("memo")}
              placeholder="担当者のみ確認できるメモ"
              rows={2}
            />
            {errors.memo && <p className="text-xs text-red-600">{errors.memo.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="customerName">顧客名 *</Label>
              <Input id="customerName" {...register("customerName")} placeholder="山田 太郎" />
              {errors.customerName && (
                <p className="text-xs text-red-600">{errors.customerName.message}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="customerNameKana" className="text-muted-foreground">
                ふりがな <span className="text-xs">（ソート用）</span>
              </Label>
              <Input id="customerNameKana" {...register("customerNameKana")} placeholder="やまだ たろう" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="assigneeName">担当者</Label>
              <Input id="assigneeName" {...register("assigneeName")} placeholder="田中 担当" />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="assigneeNameKana" className="text-muted-foreground">
                担当者ふりがな <span className="text-xs">（ソート用）</span>
              </Label>
              <Input id="assigneeNameKana" {...register("assigneeNameKana")} placeholder="たなか たんとう" />
            </div>
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

          <div className="grid grid-cols-2 gap-3">
            {isEdit && (
              <div className="space-y-1.5">
                <Label>ステータス</Label>
                <Select
                  value={watch("status")}
                  onValueChange={(v) =>
                    setValue("status", v as "PENDING" | "IN_PROGRESS" | "WAITING_REPLY" | "COMPLETED")
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">未対応</SelectItem>
                    <SelectItem value="IN_PROGRESS">対応中</SelectItem>
                    <SelectItem value="WAITING_REPLY">回答待ち</SelectItem>
                    <SelectItem value="COMPLETED">完了</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}
            <div className="space-y-1.5">
              <Label>対応期限</Label>
              <DateScrollPicker
                key={`${open}-${inquiry?.id ?? "new"}`}
                value={watch("dueDate") ?? ""}
                onChange={(v) => setValue("dueDate", v || null)}
              />
            </div>
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
