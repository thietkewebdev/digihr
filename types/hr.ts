export type Role = "employee" | "manager" | "admin"

export type ReviewStatus = "draft" | "pending" | "approved" | "adjusted"

export type Rating =
  | "xuat-sac"
  | "tot"
  | "dat"
  | "can-cai-thien"
  | "khong-dat"

export type ProjectRole = "truong-nhom" | "ky-thuat-chinh" | "ho-tro"

export type Employee = {
  id: string
  name: string
  group: string
  title: string
  baseSalary: number
  kpiTarget: number
  cksTarget: number
  networkEligible: boolean
  initials: string
}

export type DemoUser = {
  id: string
  name: string
  title: string
  role: Role
  employeeId?: string
  initials: string
}

export type ReviewProject = {
  code: string
  days: number
  role: string
}

export type SelfReview = {
  employeeId: string
  period: string
  highlights: [string, string, string]
  issues: string
  evidenceLinks: string[]
  projects: ReviewProject[]
  selfRating: Rating | null
  managerRating: Rating | null
  managerNote: string
  status: ReviewStatus
  submittedAt?: string
  decidedAt?: string
}

export type CksMonth = {
  period: string
  target: number
  revenue: number
}

export type ProjectParticipant = {
  employeeId: string
  days: number
  role: ProjectRole
}

export type BonusProject = {
  id: string
  code: string
  name: string
  period: string
  pool: number
  participants: ProjectParticipant[]
}

export type PayrollInput = {
  employeeId: string
  period: string
  workDays: number
  overtime: number
  allowances: number
  otherBonus: number
  otherBonusLabel: string
  advance: number
  otherDeduction: number
  otherDeductionLabel: string
}

export type PayslipPublish = {
  employeeId: string
  period: string
  published: boolean
}
