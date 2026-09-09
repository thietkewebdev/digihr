import type {
  BonusProject,
  CksMonth,
  Employee,
  PayrollInput,
  ProjectParticipant,
  ProjectRole,
  Rating,
  SelfReview,
} from "@/types/hr"

export const STANDARD_DAYS = 26
export const PERSONAL_DEDUCTION = 11_000_000

export const KPI_COEFF: Record<Rating, number> = {
  "xuat-sac": 1.2,
  tot: 1.0,
  dat: 0.8,
  "can-cai-thien": 0.5,
  "khong-dat": 0,
}

export const RATING_LABEL: Record<Rating, string> = {
  "xuat-sac": "Xuất sắc",
  tot: "Tốt",
  dat: "Đạt",
  "can-cai-thien": "Cần cải thiện",
  "khong-dat": "Không đạt",
}

export const PROJECT_ROLE_COEFF: Record<ProjectRole, number> = {
  "truong-nhom": 1.2,
  "ky-thuat-chinh": 1.0,
  "ho-tro": 0.6,
}

export const PROJECT_ROLE_LABEL: Record<ProjectRole, string> = {
  "truong-nhom": "Trưởng nhóm",
  "ky-thuat-chinh": "Kỹ thuật chính",
  "ho-tro": "Hỗ trợ",
}

export const CKS_TIERS = [
  { min: 0, max: 70, coeff: 0, label: "<70%" },
  { min: 70, max: 90, coeff: 0.5, label: "70–<90%" },
  { min: 90, max: 100, coeff: 0.8, label: "90–<100%" },
  { min: 100, max: 110, coeff: 1.0, label: "100–<110%" },
  { min: 110, max: 120, coeff: 1.2, label: "110–<120%" },
  { min: 120, max: Infinity, coeff: 1.5, label: "≥120%" },
] as const

export function finalRating(review: SelfReview | undefined): Rating | null {
  if (!review) return null
  if (review.status === "approved" || review.status === "adjusted") {
    return review.managerRating ?? review.selfRating
  }
  return null
}

export function kpiCoefficient(review: SelfReview | undefined): number {
  const rating = finalRating(review)
  if (!rating) return 0
  return KPI_COEFF[rating]
}

export function kpiMoney(employee: Employee, review: SelfReview | undefined) {
  return Math.round(employee.kpiTarget * kpiCoefficient(review))
}

export function cksAttainment(cks: CksMonth): number {
  if (cks.target <= 0) return 0
  return (cks.revenue / cks.target) * 100
}

export function cksCoefficient(percent: number): number {
  if (percent < 70) return 0
  if (percent < 90) return 0.5
  if (percent < 100) return 0.8
  if (percent < 110) return 1.0
  if (percent < 120) return 1.2
  return 1.5
}

export function cksBonus(
  employee: Employee,
  cks: CksMonth
): number {
  if (employee.cksTarget <= 0) return 0
  const coeff = cksCoefficient(cksAttainment(cks))
  return Math.round(employee.cksTarget * coeff)
}

export function participantPoints(p: ProjectParticipant): number {
  return p.days * PROJECT_ROLE_COEFF[p.role]
}

export function allocateProject(project: BonusProject) {
  const rows = project.participants.map((p) => ({
    ...p,
    points: participantPoints(p),
  }))
  const totalPoints = rows.reduce((sum, row) => sum + row.points, 0)

  if (totalPoints <= 0 || project.pool <= 0) {
    return rows.map((row) => ({ ...row, amount: 0, share: 0 }))
  }

  const raw = rows.map((row) => {
    const exact = (row.points / totalPoints) * project.pool
    return { ...row, exact, amount: Math.floor(exact), share: row.points / totalPoints }
  })

  let remainder = project.pool - raw.reduce((sum, row) => sum + row.amount, 0)
  const order = [...raw].sort((a, b) => (b.exact - b.amount) - (a.exact - a.amount))
  for (const row of order) {
    if (remainder <= 0) break
    row.amount += 1
    remainder -= 1
  }

  return raw
}

export function projectBonusFor(
  employeeId: string,
  period: string,
  projects: BonusProject[]
): number {
  return projects
    .filter((project) => project.period === period)
    .reduce((sum, project) => {
      const row = allocateProject(project).find((p) => p.employeeId === employeeId)
      return sum + (row?.amount ?? 0)
    }, 0)
}

export function socialInsurance(baseSalary: number) {
  const bhxh = Math.round(baseSalary * 0.08)
  const bhyt = Math.round(baseSalary * 0.015)
  const bhtn = Math.round(baseSalary * 0.01)
  return { bhxh, bhyt, bhtn, total: bhxh + bhyt + bhtn }
}

function personalIncomeTax(taxable: number): number {
  if (taxable <= 0) return 0
  const brackets = [
    { cap: 5_000_000, rate: 0.05 },
    { cap: 10_000_000, rate: 0.1 },
    { cap: 18_000_000, rate: 0.15 },
    { cap: 32_000_000, rate: 0.2 },
    { cap: 52_000_000, rate: 0.25 },
    { cap: 80_000_000, rate: 0.3 },
    { cap: Infinity, rate: 0.35 },
  ]

  let tax = 0
  let prev = 0
  let remain = taxable
  for (const bracket of brackets) {
    const slice = Math.min(remain, bracket.cap - prev)
    if (slice <= 0) break
    tax += slice * bracket.rate
    remain -= slice
    prev = bracket.cap
    if (remain <= 0) break
  }
  return Math.round(tax)
}

export type PayrollLine = {
  employee: Employee
  period: string
  workDays: number
  proratedBase: number
  kpi: number
  kpiCoeff: number
  cks: number
  cksCoeff: number
  project: number
  overtime: number
  allowances: number
  otherBonus: number
  otherBonusLabel: string
  income: number
  bhxh: number
  bhyt: number
  bhtn: number
  tncn: number
  advance: number
  otherDeduction: number
  otherDeductionLabel: string
  deductions: number
  net: number
  published: boolean
}

export function buildPayroll(args: {
  employee: Employee
  review: SelfReview | undefined
  cks: CksMonth
  projects: BonusProject[]
  input: PayrollInput
  published: boolean
}): PayrollLine {
  const { employee, review, cks, projects, input, published } = args
  const proratedBase = Math.round(
    (employee.baseSalary * input.workDays) / STANDARD_DAYS
  )
  const coeff = kpiCoefficient(review)
  const kpi = kpiMoney(employee, review)
  const teamCksCoeff = cksCoefficient(cksAttainment(cks))
  const cksAmount = cksBonus(employee, cks)
  const project = projectBonusFor(employee.id, input.period, projects)
  const income =
    proratedBase +
    kpi +
    cksAmount +
    project +
    input.overtime +
    input.allowances +
    input.otherBonus

  const { bhxh, bhyt, bhtn, total: insurance } = socialInsurance(employee.baseSalary)
  const taxable = income - insurance - PERSONAL_DEDUCTION
  const tncn = personalIncomeTax(taxable)
  const deductions = insurance + tncn + input.advance + input.otherDeduction

  return {
    employee,
    period: input.period,
    workDays: input.workDays,
    proratedBase,
    kpi,
    kpiCoeff: coeff,
    cks: cksAmount,
    cksCoeff: teamCksCoeff,
    project,
    overtime: input.overtime,
    allowances: input.allowances,
    otherBonus: input.otherBonus,
    otherBonusLabel: input.otherBonusLabel,
    income,
    bhxh,
    bhyt,
    bhtn,
    tncn,
    advance: input.advance,
    otherDeduction: input.otherDeduction,
    otherDeductionLabel: input.otherDeductionLabel,
    deductions,
    net: income - deductions,
    published,
  }
}
