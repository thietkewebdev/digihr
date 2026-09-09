"use client"

import { useState } from "react"
import { toast } from "sonner"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { Money } from "@/components/money"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Progress } from "@/components/ui/progress"
import {
  CKS_TIERS,
  cksAttainment,
  cksBonus,
  cksCoefficient,
} from "@/lib/calc"
import { formatNumber, formatPercent, parseVndInput, periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"

export default function CksPage() {
  const { cks, setCksRevenue, employees, role, period } = useHr()
  const [draft, setDraft] = useState(String(cks.revenue))
  const pct = cksAttainment(cks)
  const coeff = cksCoefficient(pct)
  const eligible = employees.filter((e) => e.cksTarget > 0)
  const canEdit = role === "manager" || role === "admin"

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={periodLabel(period)}
        title="Doanh thu chữ ký số"
        description="Một số doanh thu cho cả team. Hệ số thưởng theo % đạt."
      />

      <Card>
        <CardHeader className="flex flex-row items-start justify-between">
          <div>
            <CardTitle>Tiến độ tháng</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Chỉ tiêu {formatNumber(cks.target)} ₫
            </p>
          </div>
          <Badge
            variant="secondary"
            className={
              coeff >= 1
                ? "border-0 bg-emerald-50 text-emerald-800"
                : coeff > 0
                  ? "border-0 bg-amber-50 text-amber-800"
                  : "border-0 bg-zinc-100 text-zinc-600"
            }
          >
            {formatPercent(pct)} · ×{coeff}
          </Badge>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="mb-2 flex justify-between text-sm">
              <Money value={cks.revenue} className="font-semibold" />
              <span className="text-muted-foreground">
                / {formatNumber(cks.target)} ₫
              </span>
            </div>
            <Progress value={Math.min(pct, 140)} />
          </div>

          {canEdit ? (
            <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1.5">
                <Label htmlFor="cks">Doanh thu CKS tháng này</Label>
                <Input
                  id="cks"
                  inputMode="numeric"
                  value={formatNumber(parseVndInput(draft) || 0)}
                  onChange={(e) => setDraft(e.target.value)}
                />
              </div>
              <Button
                onClick={() => {
                  const next = parseVndInput(draft)
                  setCksRevenue(next)
                  toast.success("Đã cập nhật doanh thu CKS")
                }}
              >
                Lưu số
              </Button>
            </div>
          ) : null}
        </CardContent>
      </Card>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {CKS_TIERS.map((tier) => (
          <div
            key={tier.label}
            className={`rounded-xl border px-3 py-2.5 text-sm ${
              pct >= tier.min && pct < tier.max
                ? "border-foreground bg-foreground text-background"
                : "bg-card"
            }`}
          >
            <div className="font-medium">{tier.label}</div>
            <div className="text-xs opacity-70">Hệ số ×{tier.coeff}</div>
          </div>
        ))}
      </div>

      <div className="space-y-3">
        <h2 className="text-sm font-medium">Người hưởng thưởng CKS</h2>
        {eligible.map((employee) => (
          <Card key={employee.id} size="sm">
            <CardContent className="flex items-center gap-3">
              <PersonAvatar name={employee.name} initials={employee.initials} />
              <div className="min-w-0 flex-1">
                <p className="font-medium">{employee.name}</p>
                <p className="text-xs text-muted-foreground">
                  Chỉ tiêu {formatNumber(employee.cksTarget)} ₫ × {coeff}
                </p>
              </div>
              <Money
                value={cksBonus(employee, cks)}
                className="text-sm font-semibold"
              />
            </CardContent>
          </Card>
        ))}
        {employees
          .filter((e) => e.cksTarget <= 0)
          .map((employee) => (
            <Card key={employee.id} size="sm" className="opacity-70">
              <CardContent className="flex items-center gap-3">
                <PersonAvatar
                  name={employee.name}
                  initials={employee.initials}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{employee.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Không có chỉ tiêu CKS
                  </p>
                </div>
                <Money value={0} className="text-sm" muted />
              </CardContent>
            </Card>
          ))}
      </div>
    </div>
  )
}
