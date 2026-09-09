import { Badge } from "@/components/ui/badge"
import type { ReviewStatus } from "@/types/hr"
import { cn } from "@/lib/utils"

const STATUS: Record<
  ReviewStatus,
  { label: string; className: string }
> = {
  draft: {
    label: "Nháp",
    className: "bg-zinc-100 text-zinc-600",
  },
  pending: {
    label: "Chờ duyệt",
    className: "bg-amber-50 text-amber-800",
  },
  approved: {
    label: "Đã duyệt",
    className: "bg-emerald-50 text-emerald-800",
  },
  adjusted: {
    label: "Đã điều chỉnh",
    className: "bg-sky-50 text-sky-800",
  },
}

export function StatusBadge({ status }: { status: ReviewStatus }) {
  const item = STATUS[status]
  return (
    <Badge
      variant="secondary"
      className={cn("border-0 font-medium", item.className)}
    >
      {item.label}
    </Badge>
  )
}
