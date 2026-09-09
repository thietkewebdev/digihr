export function formatVnd(amount: number): string {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(Math.round(amount))
}

export function formatVndCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000) {
    const trieu = amount / 1_000_000
    const digits = Number.isInteger(trieu) ? 0 : 1
    return `${trieu.toLocaleString("vi-VN", { maximumFractionDigits: digits })} tr`
  }
  return formatVnd(amount)
}

export function formatNumber(amount: number): string {
  return new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 0 }).format(
    Math.round(amount)
  )
}

export function formatPercent(value: number, digits = 1): string {
  return `${value.toLocaleString("vi-VN", {
    maximumFractionDigits: digits,
    minimumFractionDigits: digits,
  })}%`
}

export function formatCoeff(value: number): string {
  return `×${value.toLocaleString("vi-VN", {
    minimumFractionDigits: value % 1 === 0 ? 0 : 1,
    maximumFractionDigits: 1,
  })}`
}

export function periodLabel(period: string): string {
  const [year, month] = period.split("-")
  return `Tháng ${Number(month)}/${year}`
}

export function parseVndInput(raw: string): number {
  const digits = raw.replace(/[^\d]/g, "")
  if (!digits) return 0
  return Number(digits)
}
