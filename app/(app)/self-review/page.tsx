"use client"

import { useMemo, useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { RatingBadge } from "@/components/rating-badge"
import { ReviewDetail } from "@/components/review-detail"
import { StatusBadge } from "@/components/status-badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { KPI_COEFF, RATING_LABEL } from "@/lib/calc"
import { formatCoeff, periodLabel } from "@/lib/format"
import { reviewOrEmpty, useHr } from "@/lib/hr-store"
import type { Rating, ReviewProject, SelfReview } from "@/types/hr"
import { cn } from "@/lib/utils"
import { Plus, Trash2 } from "lucide-react"

const RATINGS: Rating[] = [
  "xuat-sac",
  "tot",
  "dat",
  "can-cai-thien",
  "khong-dat",
]

export default function SelfReviewPage() {
  const { actingEmployee, period, reviews, saveReview, role } = useHr()

  if (role !== "employee" || !actingEmployee) {
    return null
  }

  const stored = reviewOrEmpty(reviews, actingEmployee.id, period)
  const locked = stored.status !== "draft"

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Tự đánh giá tháng"
        description="Viết ngắn, rõ việc. Không chấm điểm 100."
        action={<StatusBadge status={stored.status} />}
      />

      {locked ? (
        <Card>
          <CardContent className="pt-1">
            <ReviewDetail review={stored} />
          </CardContent>
        </Card>
      ) : (
        <ReviewForm
          initial={stored}
          onSave={(review) => {
            saveReview(review)
            toast.success("Đã lưu nháp")
          }}
          onSubmit={(review) => {
            saveReview({
              ...review,
              status: "pending",
              submittedAt: new Date().toISOString(),
            })
            toast.success("Đã gửi quản lý duyệt")
          }}
        />
      )}
    </div>
  )
}

function ReviewForm({
  initial,
  onSave,
  onSubmit,
}: {
  initial: SelfReview
  onSave: (review: SelfReview) => void
  onSubmit: (review: SelfReview) => void
}) {
  const [highlights, setHighlights] = useState<[string, string, string]>(
    initial.highlights
  )
  const [issues, setIssues] = useState(initial.issues)
  const [links, setLinks] = useState(
    initial.evidenceLinks.length ? initial.evidenceLinks : [""]
  )
  const [projects, setProjects] = useState<ReviewProject[]>(initial.projects)
  const [rating, setRating] = useState<Rating | null>(initial.selfRating)

  const draft: SelfReview = useMemo(
    () => ({
      ...initial,
      highlights,
      issues,
      evidenceLinks: links.map((l) => l.trim()).filter(Boolean),
      projects: projects.filter((p) => p.code.trim()),
      selfRating: rating,
      status: "draft",
    }),
    [highlights, issues, links, projects, rating, initial]
  )

  const errors = {
    h0: !highlights[0].trim(),
    h1: !highlights[1].trim(),
    h2: !highlights[2].trim(),
    issues: !issues.trim(),
    rating: !rating,
  }
  const valid = !Object.values(errors).some(Boolean)

  return (
    <form
      className="space-y-5"
      onSubmit={(e) => {
        e.preventDefault()
        if (!valid) {
          toast.error("Điền đủ 3 kết quả, vướng mắc và xếp loại.")
          return
        }
        onSubmit(draft)
      }}
    >
      <Card>
        <CardContent className="space-y-4">
          <div>
            <h2 className="font-medium">3 kết quả nổi bật</h2>
            <p className="text-sm text-muted-foreground">Bắt buộc. Viết cụ thể.</p>
          </div>
          {highlights.map((value, i) => (
            <div key={i} className="space-y-1.5">
              <Label htmlFor={`h-${i}`}>Kết quả {i + 1}</Label>
              <Textarea
                id={`h-${i}`}
                value={value}
                aria-invalid={errors[`h${i}` as "h0" | "h1" | "h2"]}
                onChange={(e) => {
                  const next: [string, string, string] = [...highlights]
                  next[i] = e.target.value
                  setHighlights(next)
                }}
                placeholder="Việc đã làm xong, số liệu nếu có"
              />
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div>
            <Label htmlFor="issues">Việc chưa xong / vướng mắc</Label>
            <p className="text-sm text-muted-foreground">Bắt buộc.</p>
          </div>
          <Textarea
            id="issues"
            value={issues}
            aria-invalid={errors.issues}
            onChange={(e) => setIssues(e.target.value)}
            placeholder="Trễ tiến độ, chờ khách, thiếu công cụ…"
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div>
            <h2 className="font-medium">Link minh chứng</h2>
            <p className="text-sm text-muted-foreground">
              Không bắt buộc, nên có.
            </p>
          </div>
          {links.map((link, i) => (
            <div key={i} className="flex gap-2">
              <Input
                value={link}
                onChange={(e) => {
                  const next = [...links]
                  next[i] = e.target.value
                  setLinks(next)
                }}
                placeholder="https://"
              />
              {links.length > 1 ? (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setLinks(links.filter((_, j) => j !== i))}
                >
                  <Trash2 />
                </Button>
              ) : null}
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setLinks([...links, ""])}
          >
            <Plus /> Thêm link
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div>
            <h2 className="font-medium">Dự án tham gia</h2>
            <p className="text-sm text-muted-foreground">Không bắt buộc.</p>
          </div>
          {projects.map((project, i) => (
            <div key={i} className="grid grid-cols-6 gap-2">
              <Input
                className="col-span-2"
                placeholder="Mã (CM09)"
                value={project.code}
                onChange={(e) => {
                  const next = [...projects]
                  next[i] = { ...project, code: e.target.value }
                  setProjects(next)
                }}
              />
              <Input
                className="col-span-2"
                type="number"
                min={0}
                placeholder="Số ngày"
                value={project.days || ""}
                onChange={(e) => {
                  const next = [...projects]
                  next[i] = { ...project, days: Number(e.target.value) || 0 }
                  setProjects(next)
                }}
              />
              <Input
                className="col-span-2"
                placeholder="Vai trò"
                value={project.role}
                onChange={(e) => {
                  const next = [...projects]
                  next[i] = { ...project, role: e.target.value }
                  setProjects(next)
                }}
              />
            </div>
          ))}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              setProjects([...projects, { code: "", days: 0, role: "" }])
            }
          >
            <Plus /> Thêm dự án
          </Button>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="space-y-3">
          <div>
            <h2 className="font-medium">Tự xếp loại</h2>
            <p className="text-sm text-muted-foreground">
              Quản lý có thể giữ hoặc đổi.
            </p>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {RATINGS.map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => setRating(value)}
                className={cn(
                  "rounded-xl border px-3 py-3 text-left transition-colors",
                  rating === value
                    ? "border-foreground bg-foreground text-background"
                    : "bg-background hover:bg-muted/50"
                )}
              >
                <div className="font-medium">{RATING_LABEL[value]}</div>
                <div
                  className={cn(
                    "text-xs",
                    rating === value ? "text-background/70" : "text-muted-foreground"
                  )}
                >
                  Hệ số {formatCoeff(KPI_COEFF[value])}
                </div>
              </button>
            ))}
          </div>
          <RatingBadge rating={rating} />
        </CardContent>
      </Card>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          onClick={() => onSave(draft)}
        >
          Lưu nháp
        </Button>
        <Button type="submit">Gửi duyệt</Button>
      </div>
    </form>
  )
}
