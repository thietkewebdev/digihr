import { COMPANY } from "@/lib/mock-data"
import { formatNumber, periodLabel } from "@/lib/format"
import { STANDARD_DAYS } from "@/lib/calc"
import type { PayrollLine } from "@/lib/calc"

function Row({
  label,
  value,
  note,
  strong,
}: {
  label: string
  value: number
  note?: string
  strong?: boolean
}) {
  if (!value && !strong) return null
  return (
    <div className="flex items-start justify-between gap-4 py-1.5 text-sm">
      <div>
        <div className={strong ? "font-medium" : ""}>{label}</div>
        {note ? (
          <div className="text-xs text-muted-foreground">{note}</div>
        ) : null}
      </div>
      <div className={`tabular-nums ${strong ? "font-semibold" : ""}`}>
        {formatNumber(value)}
      </div>
    </div>
  )
}

export function PayslipDocument({ line }: { line: PayrollLine }) {
  const { employee } = line

  return (
    <article className="payslip-sheet mx-auto w-full max-w-2xl overflow-hidden rounded-2xl bg-white ring-1 ring-foreground/10">
      <header className="border-b bg-[#153d2e] px-6 py-5 text-white sm:px-8">
        <p className="text-[11px] tracking-[0.18em] text-white/70 uppercase">
          Phiếu lương
        </p>
        <h2 className="mt-1 text-lg font-semibold leading-snug">{COMPANY.name}</h2>
        <p className="mt-1 text-sm text-emerald-100">{periodLabel(line.period)}</p>
      </header>

      <div className="grid gap-4 border-b px-6 py-5 sm:grid-cols-2 sm:px-8">
        <div>
          <p className="text-xs text-muted-foreground">Nhân viên</p>
          <p className="font-medium">{employee.name}</p>
          <p className="text-sm text-muted-foreground">
            {employee.id} · {employee.title}
          </p>
        </div>
        <div className="sm:text-right">
          <p className="text-xs text-muted-foreground">Nhóm</p>
          <p className="font-medium">{employee.group}</p>
          <p className="text-sm text-muted-foreground">
            Công {line.workDays}/{STANDARD_DAYS} ngày
          </p>
        </div>
      </div>

      <div className="grid gap-8 px-6 py-6 sm:grid-cols-2 sm:px-8">
        <section>
          <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Thu nhập
          </h3>
          <Row
            label="Lương cứng"
            value={line.proratedBase}
            note={`Theo ${line.workDays}/${STANDARD_DAYS} ngày`}
          />
          <Row
            label="KPI cá nhân"
            value={line.kpi}
            note={
              line.kpiCoeff
                ? `Hệ số ${line.kpiCoeff}`
                : "Chưa duyệt đánh giá"
            }
          />
          <Row
            label="Thưởng CKS"
            value={line.cks}
            note={
              employee.cksTarget > 0
                ? `Hệ số team ${line.cksCoeff}`
                : "Không thuộc chỉ tiêu CKS"
            }
          />
          <Row label="Thưởng dự án" value={line.project} />
          <Row label="Tăng ca" value={line.overtime} />
          <Row label="Phụ cấp" value={line.allowances} />
          <Row
            label={line.otherBonusLabel || "Thưởng khác"}
            value={line.otherBonus}
          />
          <div className="mt-2 border-t pt-2">
            <Row label="Tổng thu nhập" value={line.income} strong />
          </div>
        </section>

        <section>
          <h3 className="mb-2 text-xs font-medium tracking-wide text-muted-foreground uppercase">
            Khấu trừ
          </h3>
          <Row label="BHXH (8%)" value={line.bhxh} />
          <Row label="BHYT (1,5%)" value={line.bhyt} />
          <Row label="BHTN (1%)" value={line.bhtn} />
          <Row label="Thuế TNCN" value={line.tncn} />
          <Row label="Tạm ứng" value={line.advance} />
          <Row
            label={line.otherDeductionLabel || "Khấu trừ khác"}
            value={line.otherDeduction}
          />
          <div className="mt-2 border-t pt-2">
            <Row label="Tổng khấu trừ" value={line.deductions} strong />
          </div>
        </section>
      </div>

      <div className="flex items-end justify-between gap-4 bg-[#f3f7f4] px-6 py-5 sm:px-8">
        <div>
          <p className="text-xs text-muted-foreground">Thực nhận</p>
          <p className="text-2xl font-semibold tracking-tight tabular-nums">
            {formatNumber(line.net)} ₫
          </p>
        </div>
        <p className="max-w-[240px] text-right text-[11px] leading-relaxed text-muted-foreground">
          Thông tin cá nhân. Có thắc mắc vui lòng phản hồi trong 2 ngày làm việc
          sau khi phát hành.
        </p>
      </div>
    </article>
  )
}
