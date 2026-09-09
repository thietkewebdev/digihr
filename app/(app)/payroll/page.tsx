"use client"

import { useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { Money } from "@/components/money"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { STANDARD_DAYS, type PayrollLine } from "@/lib/calc"
import { formatNumber, parseVndInput, periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"

export default function PayrollPage() {
  const {
    payrolls,
    period,
    role,
    updatePayrollInput,
    publishPayslip,
    publishAll,
    payrollInputs,
  } = useHr()
  const [openId, setOpenId] = useState<string | null>(null)
  const canEdit = role === "admin"
  const canView = role === "manager" || role === "admin"
  const active = payrolls.find((p) => p.employee.id === openId)
  const unpublished = payrolls.filter((p) => !p.published).length

  if (!canView) return null

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Bảng lương"
        description="KPI, CKS và dự án lấy từ các module. OT / phụ cấp / khấu trừ sửa tại đây."
        action={
          canEdit && unpublished > 0 ? (
            <Button
              onClick={() => {
                publishAll()
                toast.success("Đã phát hành toàn bộ phiếu lương")
              }}
            >
              Phát hành tất cả
            </Button>
          ) : null
        }
      />

      <div className="grid gap-3">
        {payrolls.map((line) => (
          <button
            key={line.employee.id}
            type="button"
            className="w-full text-left"
            onClick={() => setOpenId(line.employee.id)}
          >
            <Card className="transition-colors hover:bg-muted/30">
              <CardContent className="flex items-center gap-3">
                <PersonAvatar
                  name={line.employee.name}
                  initials={line.employee.initials}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{line.employee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Công {line.workDays}/{STANDARD_DAYS}
                    {line.kpi ? ` · KPI ${formatNumber(line.kpi)}` : " · KPI chờ"}
                    {line.project ? ` · DA ${formatNumber(line.project)}` : ""}
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
                    {line.published ? "Đã phát hành" : "Nháp"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </button>
        ))}
      </div>

      <Sheet open={!!openId} onOpenChange={(o) => !o && setOpenId(null)}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          {active ? (
            <PayrollSheet
              key={active.employee.id}
              line={active}
              canEdit={canEdit}
              input={payrollInputs.find(
                (p) => p.employeeId === active.employee.id
              )}
              onSave={(patch) => {
                updatePayrollInput(active.employee.id, patch)
                toast.success("Đã lưu điều chỉnh lương")
              }}
              onPublish={() => {
                publishPayslip(active.employee.id)
                toast.success(`Đã phát hành phiếu ${active.employee.name}`)
              }}
            />
          ) : null}
        </SheetContent>
      </Sheet>
    </div>
  )
}

function PayrollSheet({
  line,
  canEdit,
  input,
  onSave,
  onPublish,
}: {
  line: PayrollLine
  canEdit: boolean
  input:
    | {
        workDays: number
        overtime: number
        allowances: number
        otherBonus: number
        otherBonusLabel: string
        advance: number
        otherDeduction: number
        otherDeductionLabel: string
      }
    | undefined
  onSave: (patch: {
    workDays: number
    overtime: number
    allowances: number
    otherBonus: number
    otherBonusLabel: string
    advance: number
    otherDeduction: number
    otherDeductionLabel: string
  }) => void
  onPublish: () => void
}) {
  const [workDays, setWorkDays] = useState(input?.workDays ?? line.workDays)
  const [overtime, setOvertime] = useState(input?.overtime ?? 0)
  const [allowances, setAllowances] = useState(input?.allowances ?? 0)
  const [otherBonus, setOtherBonus] = useState(input?.otherBonus ?? 0)
  const [otherBonusLabel, setOtherBonusLabel] = useState(
    input?.otherBonusLabel ?? ""
  )
  const [advance, setAdvance] = useState(input?.advance ?? 0)
  const [otherDeduction, setOtherDeduction] = useState(
    input?.otherDeduction ?? 0
  )
  const [otherDeductionLabel, setOtherDeductionLabel] = useState(
    input?.otherDeductionLabel ?? ""
  )

  return (
    <>
      <SheetHeader>
        <SheetTitle>{line.employee.name}</SheetTitle>
        <SheetDescription>
          {line.employee.id} · thực nhận{" "}
          {formatNumber(line.net)} ₫
        </SheetDescription>
      </SheetHeader>

      <div className="space-y-3 px-4 text-sm">
        <Line label="Lương cứng (theo công)" value={line.proratedBase} />
        <Line
          label="KPI cá nhân"
          value={line.kpi}
          hint={line.kpiCoeff ? `×${line.kpiCoeff}` : "Chưa duyệt"}
        />
        <Line label="Thưởng CKS" value={line.cks} />
        <Line label="Thưởng dự án" value={line.project} />
        <Line label="Tổng thu nhập" value={line.income} strong />
        <Line label="BHXH + BHYT + BHTN" value={line.bhxh + line.bhyt + line.bhtn} />
        <Line label="TNCN" value={line.tncn} />
        <Line label="Thực nhận" value={line.net} strong />
      </div>

      {canEdit ? (
        <div className="grid gap-3 px-4">
          <MoneyField
            label="Ngày công"
            value={String(workDays)}
            onChange={(v) => setWorkDays(v)}
            plain
          />
          <MoneyField
            label="Tăng ca"
            value={overtime}
            onChange={(n) => setOvertime(n)}
          />
          <MoneyField
            label="Phụ cấp"
            value={allowances}
            onChange={(n) => setAllowances(n)}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Tên thưởng khác</Label>
              <Input
                value={otherBonusLabel}
                onChange={(e) => setOtherBonusLabel(e.target.value)}
              />
            </div>
            <MoneyField
              label="Số thưởng khác"
              value={otherBonus}
              onChange={(n) => setOtherBonus(n)}
            />
          </div>
          <MoneyField
            label="Tạm ứng"
            value={advance}
            onChange={(n) => setAdvance(n)}
          />
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <Label>Tên khấu trừ khác</Label>
              <Input
                value={otherDeductionLabel}
                onChange={(e) => setOtherDeductionLabel(e.target.value)}
              />
            </div>
            <MoneyField
              label="Số khấu trừ"
              value={otherDeduction}
              onChange={(n) => setOtherDeduction(n)}
            />
          </div>
        </div>
      ) : (
        <p className="px-4 text-sm text-muted-foreground">
          Quản lý xem được số. Chỉ Payroll-Admin sửa OT và khấu trừ.
        </p>
      )}

      <SheetFooter>
        {canEdit ? (
          <Button
            onClick={() =>
              onSave({
                workDays,
                overtime,
                allowances,
                otherBonus,
                otherBonusLabel,
                advance,
                otherDeduction,
                otherDeductionLabel,
              })
            }
          >
            Lưu điều chỉnh
          </Button>
        ) : null}
        <Link
          href={`/payslip/${line.employee.id}`}
          className="text-center text-sm text-[#1f6b4a] underline-offset-2 hover:underline"
        >
          Mở phiếu lương
        </Link>
        {canEdit && !line.published ? (
          <Button variant="outline" onClick={onPublish}>
            Phát hành phiếu
          </Button>
        ) : null}
      </SheetFooter>
    </>
  )
}

function Line({
  label,
  value,
  hint,
  strong,
}: {
  label: string
  value: number
  hint?: string
  strong?: boolean
}) {
  return (
    <div className="flex justify-between gap-3">
      <span className={strong ? "font-medium" : "text-muted-foreground"}>
        {label}
        {hint ? ` · ${hint}` : ""}
      </span>
      <Money value={value} className={strong ? "font-semibold" : ""} />
    </div>
  )
}

function MoneyField({
  label,
  value,
  onChange,
  plain,
}: {
  label: string
  value: number | string
  onChange: (value: number) => void
  plain?: boolean
}) {
  return (
    <div className="space-y-1">
      <Label>{label}</Label>
      <Input
        inputMode="numeric"
        value={
          plain
            ? String(value)
            : formatNumber(typeof value === "number" ? value : Number(value) || 0)
        }
        onChange={(e) => {
          if (plain) onChange(Number(e.target.value) || 0)
          else onChange(parseVndInput(e.target.value))
        }}
      />
    </div>
  )
}
