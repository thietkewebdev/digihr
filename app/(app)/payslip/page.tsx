"use client"

import { useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { FileText } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { EmptyState } from "@/components/empty-state"
import { Money } from "@/components/money"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"

export default function PayslipIndexPage() {
  const { role, actingEmployee, payrolls, period } = useHr()
  const router = useRouter()
  const mine = actingEmployee
    ? payrolls.find((p) => p.employee.id === actingEmployee.id)
    : undefined

  useEffect(() => {
    if (role === "employee" && mine?.published) {
      router.replace(`/payslip/${mine.employee.id}`)
    }
  }, [role, mine, router])

  if (role === "employee") {
    if (!mine?.published) {
      return (
        <div className="space-y-6">
          <PageHeader
            eyebrow={periodLabel(period)}
            title="Phiếu lương"
            description="Chỉ xem phiếu của bạn."
          />
          <EmptyState
            icon={<FileText className="size-4" />}
            title="Tháng này chưa phát hành"
            description="Khi kế toán chốt bảng lương, phiếu sẽ hiện ở đây."
          />
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Phiếu lương"
        description="Mở từng phiếu để in hoặc gửi cho nhân viên."
      />
      <div className="grid gap-3">
        {payrolls.map((line) => (
          <Link key={line.employee.id} href={`/payslip/${line.employee.id}`}>
            <Card className="transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-3">
                <PersonAvatar
                  name={line.employee.name}
                  initials={line.employee.initials}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{line.employee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {line.employee.id}
                  </p>
                </div>
                <div className="text-right">
                  <Money value={line.net} className="block font-semibold" />
                  <Badge
                    variant="secondary"
                    className={
                      line.published
                        ? "border-0 bg-emerald-50 text-emerald-800"
                        : "border-0 bg-zinc-100 text-zinc-600"
                    }
                  >
                    {line.published ? "Đã phát hành" : "Chưa phát hành"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  )
}
