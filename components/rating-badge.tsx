import { Badge } from "@/components/ui/badge"
import { formatCoeff } from "@/lib/format"
import { KPI_COEFF, RATING_LABEL } from "@/lib/calc"
import type { Rating } from "@/types/hr"
import { cn } from "@/lib/utils"

const TONE: Record<Rating, string> = {
  "xuat-sac": "bg-emerald-50 text-emerald-800",
  tot: "bg-green-50 text-green-800",
  dat: "bg-sky-50 text-sky-800",
  "can-cai-thien": "bg-amber-50 text-amber-800",
  "khong-dat": "bg-red-50 text-red-700",
}

export function RatingBadge({
  rating,
  showCoeff = true,
}: {
  rating: Rating | null
  showCoeff?: boolean
}) {
  if (!rating) {
    return (
      <Badge variant="secondary" className="border-0 text-muted-foreground">
        Chưa xếp loại
      </Badge>
    )
  }

  return (
    <Badge variant="secondary" className={cn("border-0", TONE[rating])}>
      {RATING_LABEL[rating]}
      {showCoeff ? ` · ${formatCoeff(KPI_COEFF[rating])}` : null}
    </Badge>
  )
}
