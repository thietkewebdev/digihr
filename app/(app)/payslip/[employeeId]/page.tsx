"use client"

import { use } from "react"
import Link from "next/link"
import { Printer } from "lucide-react"
import { EmptyState } from "@/components/empty-state"
import { PayslipDocument } from "@/components/payslip-document"
import { Button, buttonVariants } from "@/components/ui/button"
import { useHr } from "@/lib/hr-store"
import { cn } from "@/lib/utils"

export default function PayslipDetailPage({
  params,
}: {
  params: Promise<{ employeeId: string }>
}) {
  const { employeeId } = use(params)
  const { role, actingEmployee, getPayroll, getEmployee } = useHr()
  const line = getPayroll(employeeId)
  const employee = getEmployee(employeeId)

  const isOwn = actingEmployee?.id === employeeId
  const allowed =
    role === "admin" || role === "manager" || (role === "employee" && isOwn)

  if (!allowed) {
    return (
      <EmptyState
        title="Bạn chỉ xem được phiếu của mình"
        action={
          <Link href="/payslip" className={cn(buttonVariants())}>
            Quay lại
          </Link>
        }
      />
    )
  }

  if (!line || !employee) {
    return <EmptyState title="Không tìm thấy phiếu lương" />
  }

  if (role === "employee" && !line.published) {
    return (
      <EmptyState
        title="Phiếu lương chưa phát hành"
        description="Khi kế toán chốt tháng, bạn sẽ xem và in được phiếu này."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="no-print flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-xs text-muted-foreground">GREENSOFT</p>
          <h1 className="text-xl font-semibold tracking-tight">
            Phiếu lương · {employee.name}
          </h1>
        </div>
        <div className="flex gap-2">
          <Link
            href={role === "employee" ? "/dashboard" : "/payroll"}
            className={cn(buttonVariants({ variant: "outline" }))}
          >
            Đóng
          </Link>
          <Button onClick={() => window.print()}>
            <Printer /> In / PDF
          </Button>
        </div>
      </div>
      <PayslipDocument line={line} />
    </div>
  )
}
