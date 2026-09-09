"use client"

import type { ReactNode } from "react"
import Link from "next/link"
import { ArrowRight, CheckCircle2, Clock3, PenLine, Wallet } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { RatingBadge } from "@/components/rating-badge"
import { StatusBadge } from "@/components/status-badge"
import { Money } from "@/components/money"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { useHr } from "@/lib/hr-store"
import { cksAttainment, cksCoefficient, finalRating, kpiCoefficient } from "@/lib/calc"
import { formatPercent, periodLabel } from "@/lib/format"
import { cn } from "@/lib/utils"

export default function DashboardPage() {
  const { role } = useHr()
  if (role === "employee") return <EmployeeHome />
  if (role === "manager") return <ManagerHome />
  return <AdminHome />
}

function EmployeeHome() {
  const { actingEmployee, period, getReview, getPayroll } = useHr()
  if (!actingEmployee) return null

  const review = getReview(actingEmployee.id)
  const payroll = getPayroll(actingEmployee.id)
  const rating = finalRating(review)
  const coeff = kpiCoefficient(review)
  const status = review?.status ?? "draft"

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title={`Xin chào, ${firstName(actingEmployee.name)}`}
        description="Xem nhanh đánh giá tháng, hệ số KPI và phiếu lương."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Tự đánh giá
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <StatusBadge status={status} />
            <p className="text-sm text-muted-foreground">
              {status === "draft" && "Chưa gửi. Điền 3 kết quả và gửi quản lý."}
              {status === "pending" && "Đã gửi. Chờ quản lý duyệt."}
              {status === "approved" && "Quản lý đã duyệt."}
              {status === "adjusted" && "Quản lý đã điều chỉnh xếp loại."}
            </p>
            <Link
              href="/self-review"
              className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
            >
              {status === "draft" ? "Tiếp tục" : "Xem phiếu"}
              <ArrowRight />
            </Link>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Hệ số KPI
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold tracking-tight">
              {coeff ? `×${coeff}` : "—"}
            </div>
            <RatingBadge rating={rating} />
            <p className="text-sm text-muted-foreground">
              KPI = {actingEmployee.kpiTarget.toLocaleString("vi-VN")} × hệ số
              cuối.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Phiếu lương
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {payroll?.published ? (
              <>
                <Money value={payroll.net} className="text-2xl font-semibold" />
                <p className="text-sm text-muted-foreground">Đã phát hành.</p>
                <Link
                  href={`/payslip/${actingEmployee.id}`}
                  className={cn(buttonVariants({ variant: "outline", size: "sm" }))}
                >
                  Xem phiếu
                  <ArrowRight />
                </Link>
              </>
            ) : (
              <>
                <p className="text-lg font-medium">Chưa phát hành</p>
                <p className="text-sm text-muted-foreground">
                  Kế toán sẽ mở phiếu khi chốt bảng lương.
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Việc nên làm</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <QuickAction
            href="/self-review"
            icon={<PenLine className="size-4" />}
            title="Đánh giá tháng này"
            hint="3 kết quả + vướng mắc"
          />
          <QuickAction
            href="/payslip"
            icon={<Wallet className="size-4" />}
            title="Phiếu lương của tôi"
            hint="Chỉ xem số của bạn"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function ManagerHome() {
  const { employees, reviews, period, cks, payrolls } = useHr()
  const pending = reviews.filter(
    (r) => r.period === period && r.status === "pending"
  )
  const decided = reviews.filter(
    (r) =>
      r.period === period && (r.status === "approved" || r.status === "adjusted")
  )
  const pct = cksAttainment(cks)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Tổng quan nhóm"
        description="Duyệt đánh giá, theo dõi CKS và thưởng dự án."
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Chờ duyệt
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{pending.length}</div>
            <p className="mt-1 text-sm text-muted-foreground">
              {decided.length} người đã có kết quả
            </p>
            <Link
              href="/approvals"
              className={cn(
                buttonVariants({ variant: "outline", size: "sm" }),
                "mt-3"
              )}
            >
              Duyệt ngay
            </Link>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Doanh thu CKS
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-3xl font-semibold">{formatPercent(pct)}</div>
            <Progress value={Math.min(pct, 140)} />
            <p className="text-sm text-muted-foreground">
              Hệ số team {cksCoefficient(pct)}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Thực nhận nhóm
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Money
              value={payrolls.reduce((s, p) => s + p.net, 0)}
              className="text-2xl font-semibold"
            />
            <p className="mt-1 text-sm text-muted-foreground">
              Ước tính {employees.length} người
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3">
        {employees.map((employee) => {
          const review = reviews.find(
            (r) => r.employeeId === employee.id && r.period === period
          )
          return (
            <Card key={employee.id} size="sm">
              <CardContent className="flex items-center gap-3">
                <PersonAvatar
                  name={employee.name}
                  initials={employee.initials}
                />
                <div className="min-w-0 flex-1">
                  <p className="truncate font-medium">{employee.name}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {employee.id} · {employee.group}
                  </p>
                </div>
                <StatusBadge status={review?.status ?? "draft"} />
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

function AdminHome() {
  const { payrolls, period, cks, publishedIds, employees, publishAll } = useHr()
  const unpublished = employees.length - publishedIds.length
  const pct = cksAttainment(cks)

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Bảng điều khiển lương"
        description="Chốt OT, khấu trừ và phát hành phiếu lương."
        action={
          unpublished > 0 ? (
            <Button onClick={publishAll}>Phát hành tất cả</Button>
          ) : null
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Tổng thực nhận
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Money
              value={payrolls.reduce((s, p) => s + p.net, 0)}
              className="text-2xl font-semibold"
            />
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              Phiếu chưa phát hành
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-2">
            <Clock3 className="size-4 text-amber-600" />
            <span className="text-3xl font-semibold">{unpublished}</span>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle className="text-sm text-muted-foreground">
              CKS tháng
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-semibold">{formatPercent(pct)}</div>
            <p className="text-sm text-muted-foreground">
              Hệ số {cksCoefficient(pct)}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lối tắt</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-2 sm:grid-cols-2">
          <QuickAction
            href="/payroll"
            icon={<Wallet className="size-4" />}
            title="Bảng lương"
            hint="Sửa OT, phụ cấp, khấu trừ"
          />
          <QuickAction
            href="/cks"
            icon={<CheckCircle2 className="size-4" />}
            title="Doanh thu CKS"
            hint="Một số cho cả team"
          />
        </CardContent>
      </Card>
    </div>
  )
}

function QuickAction({
  href,
  icon,
  title,
  hint,
}: {
  href: string
  icon: ReactNode
  title: string
  hint: string
}) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-xl border bg-background px-3 py-3 transition-colors hover:bg-muted/50"
    >
      <div className="flex size-9 items-center justify-center rounded-lg bg-muted">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <p className="font-medium">{title}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <ArrowRight className="size-4 text-muted-foreground" />
    </Link>
  )
}

function firstName(full: string) {
  const parts = full.trim().split(" ")
  return parts[parts.length - 1]
}
