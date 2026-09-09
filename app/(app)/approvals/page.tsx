"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { RatingBadge } from "@/components/rating-badge"
import { ReviewDetail } from "@/components/review-detail"
import { StatusBadge } from "@/components/status-badge"
import { EmptyState } from "@/components/empty-state"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { KPI_COEFF, RATING_LABEL } from "@/lib/calc"
import { formatCoeff, periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"
import type { Rating, SelfReview } from "@/types/hr"
import { ClipboardCheck } from "lucide-react"
import { cn } from "@/lib/utils"

const RATINGS: Rating[] = [
  "xuat-sac",
  "tot",
  "dat",
  "can-cai-thien",
  "khong-dat",
]

export default function ApprovalsPage() {
  const { employees, reviews, period, approveReview } = useHr()
  const [openId, setOpenId] = useState<string | null>(null)
  const [nextRating, setNextRating] = useState<Rating | null>(null)
  const [note, setNote] = useState("")

  const rows = useMemo(
    () =>
      employees
        .map((employee) => ({
          employee,
          review: reviews.find(
            (r) => r.employeeId === employee.id && r.period === period
          ),
        }))
        .filter((row) => row.review),
    [employees, reviews, period]
  )

  const pending = rows.filter((r) => r.review?.status === "pending")
  const done = rows.filter(
    (r) =>
      r.review?.status === "approved" || r.review?.status === "adjusted"
  )

  const active = rows.find((r) => r.employee.id === openId)

  function openSheet(review: SelfReview) {
    setOpenId(review.employeeId)
    setNextRating(review.selfRating)
    setNote("")
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Duyệt đánh giá"
        description="Mở từng người, duyệt như họ tự xếp hoặc đổi xếp loại."
      />

      <Tabs defaultValue="pending">
        <TabsList>
          <TabsTrigger value="pending">Chờ duyệt ({pending.length})</TabsTrigger>
          <TabsTrigger value="done">Đã xong ({done.length})</TabsTrigger>
        </TabsList>
        <TabsContent value="pending" className="mt-4 space-y-3">
          {pending.length === 0 ? (
            <EmptyState
              icon={<ClipboardCheck className="size-4" />}
              title="Hết phiếu chờ"
              description="Tháng này không còn đánh giá cần duyệt."
            />
          ) : (
            pending.map(({ employee, review }) => (
              <button
                key={employee.id}
                type="button"
                onClick={() => review && openSheet(review)}
                className="w-full text-left"
              >
                <Card className="transition-colors hover:bg-muted/30">
                  <CardContent className="flex items-center gap-3">
                    <PersonAvatar
                      name={employee.name}
                      initials={employee.initials}
                    />
                    <div className="min-w-0 flex-1">
                      <p className="font-medium">{employee.name}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {employee.id} · {employee.group}
                      </p>
                    </div>
                    <div className="flex flex-col items-end gap-1">
                      <StatusBadge status={review!.status} />
                      <RatingBadge rating={review!.selfRating} />
                    </div>
                  </CardContent>
                </Card>
              </button>
            ))
          )}
        </TabsContent>
        <TabsContent value="done" className="mt-4 space-y-3">
          {done.map(({ employee, review }) => (
            <button
              key={employee.id}
              type="button"
              onClick={() => review && openSheet(review)}
              className="w-full text-left"
            >
              <Card className="transition-colors hover:bg-muted/30">
                <CardContent className="flex items-center gap-3">
                  <PersonAvatar
                    name={employee.name}
                    initials={employee.initials}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-medium">{employee.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {employee.id} · {employee.group}
                    </p>
                  </div>
                  <RatingBadge rating={review?.managerRating ?? null} />
                </CardContent>
              </Card>
            </button>
          ))}
        </TabsContent>
      </Tabs>

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {active?.review ? (
            <>
              <SheetHeader>
                <SheetTitle>{active.employee.name}</SheetTitle>
                <SheetDescription>
                  {active.employee.id} · Tự xếp{" "}
                  {active.review.selfRating
                    ? RATING_LABEL[active.review.selfRating]
                    : "—"}
                </SheetDescription>
              </SheetHeader>
              <div className="px-4">
                <ReviewDetail review={active.review} />
              </div>

              {active.review.status === "pending" ? (
                <SheetFooter className="gap-4">
                  <Button
                    onClick={() => {
                      const review = active.review
                      if (!review?.selfRating) return
                      approveReview(
                        active.employee.id,
                        review.selfRating,
                        "Duyệt theo tự đánh giá.",
                        false
                      )
                      toast.success(`Đã duyệt ${active.employee.name}`)
                      setOpenId(null)
                    }}
                  >
                    Duyệt như họ tự xếp
                  </Button>

                  <div className="space-y-2">
                    <Label>Hoặc đổi xếp loại</Label>
                    <div className="grid grid-cols-2 gap-2">
                      {RATINGS.map((value) => (
                        <button
                          key={value}
                          type="button"
                          onClick={() => setNextRating(value)}
                          className={cn(
                            "rounded-lg border px-2 py-2 text-left text-sm",
                            nextRating === value
                              ? "border-foreground bg-foreground text-background"
                              : "bg-background"
                          )}
                        >
                          {RATING_LABEL[value]}
                          <span className="block text-[11px] opacity-70">
                            {formatCoeff(KPI_COEFF[value])}
                          </span>
                        </button>
                      ))}
                    </div>
                    <Textarea
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      placeholder="Lý do điều chỉnh (bắt buộc nếu đổi)"
                    />
                    <Button
                      variant="outline"
                      disabled={
                        !nextRating ||
                        nextRating === active.review.selfRating ||
                        !note.trim()
                      }
                      onClick={() => {
                        if (!nextRating || !note.trim()) return
                        approveReview(
                          active.employee.id,
                          nextRating,
                          note.trim(),
                          true
                        )
                        toast.success(`Đã điều chỉnh ${active.employee.name}`)
                        setOpenId(null)
                      }}
                    >
                      Lưu điều chỉnh
                    </Button>
                  </div>
                </SheetFooter>
              ) : null}
            </>
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}
