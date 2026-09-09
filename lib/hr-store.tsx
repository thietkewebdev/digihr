"use client"

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import {
  CURRENT_PERIOD,
  demoUsers,
  employees,
  seedCks,
  seedPayrollInputs,
  seedProjects,
  seedPublishes,
  seedReviews,
} from "@/lib/mock-data"
import { buildPayroll, type PayrollLine } from "@/lib/calc"
import type {
  BonusProject,
  CksMonth,
  DemoUser,
  Employee,
  PayrollInput,
  Rating,
  Role,
  SelfReview,
} from "@/types/hr"

type HrContextValue = {
  period: string
  users: DemoUser[]
  employees: Employee[]
  currentUser: DemoUser
  role: Role
  actingEmployee: Employee | null
  reviews: SelfReview[]
  cks: CksMonth
  projects: BonusProject[]
  payrollInputs: PayrollInput[]
  publishedIds: string[]
  payrolls: PayrollLine[]
  switchUser: (userId: string) => void
  getEmployee: (id: string) => Employee | undefined
  getReview: (employeeId: string) => SelfReview | undefined
  getPayroll: (employeeId: string) => PayrollLine | undefined
  saveReview: (review: SelfReview) => void
  submitReview: (employeeId: string) => void
  approveReview: (
    employeeId: string,
    rating: Rating,
    note: string,
    adjusted: boolean
  ) => void
  setCksRevenue: (revenue: number) => void
  updateProject: (project: BonusProject) => void
  updatePayrollInput: (
    employeeId: string,
    patch: Partial<PayrollInput>
  ) => void
  publishPayslip: (employeeId: string) => void
  publishAll: () => void
}

const HrContext = createContext<HrContextValue | null>(null)

function emptyReview(employeeId: string, period: string): SelfReview {
  return {
    employeeId,
    period,
    highlights: ["", "", ""],
    issues: "",
    evidenceLinks: [],
    projects: [],
    selfRating: null,
    managerRating: null,
    managerNote: "",
    status: "draft",
  }
}

export function HrProvider({ children }: { children: ReactNode }) {
  const [userId, setUserId] = useState("NS01")
  const [reviews, setReviews] = useState<SelfReview[]>(seedReviews)
  const [cks, setCks] = useState<CksMonth>(seedCks)
  const [projects, setProjects] = useState<BonusProject[]>(seedProjects)
  const [payrollInputs, setPayrollInputs] =
    useState<PayrollInput[]>(seedPayrollInputs)
  const [publishedIds, setPublishedIds] = useState<string[]>(
    seedPublishes.filter((p) => p.published).map((p) => p.employeeId)
  )

  const currentUser = demoUsers.find((u) => u.id === userId) ?? demoUsers[0]
  const actingEmployee =
    employees.find((e) => e.id === (currentUser.employeeId ?? currentUser.id)) ??
    null

  const payrolls = useMemo(
    () =>
      employees.map((employee) => {
        const review = reviews.find(
          (r) => r.employeeId === employee.id && r.period === CURRENT_PERIOD
        )
        const input =
          payrollInputs.find(
            (p) => p.employeeId === employee.id && p.period === CURRENT_PERIOD
          ) ?? {
            employeeId: employee.id,
            period: CURRENT_PERIOD,
            workDays: 26,
            overtime: 0,
            allowances: 0,
            otherBonus: 0,
            otherBonusLabel: "",
            advance: 0,
            otherDeduction: 0,
            otherDeductionLabel: "",
          }
        return buildPayroll({
          employee,
          review,
          cks,
          projects,
          input,
          published: publishedIds.includes(employee.id),
        })
      }),
    [reviews, cks, projects, payrollInputs, publishedIds]
  )

  const value: HrContextValue = {
    period: CURRENT_PERIOD,
    users: demoUsers,
    employees,
    currentUser,
    role: currentUser.role,
    actingEmployee,
    reviews,
    cks,
    projects,
    payrollInputs,
    publishedIds,
    payrolls,
    switchUser: setUserId,
    getEmployee: (id) => employees.find((e) => e.id === id),
    getReview: (employeeId) =>
      reviews.find(
        (r) => r.employeeId === employeeId && r.period === CURRENT_PERIOD
      ),
    getPayroll: (employeeId) =>
      payrolls.find((p) => p.employee.id === employeeId),
    saveReview: (review) => {
      setReviews((prev) => {
        const idx = prev.findIndex(
          (r) => r.employeeId === review.employeeId && r.period === review.period
        )
        if (idx === -1) return [...prev, review]
        const next = [...prev]
        next[idx] = review
        return next
      })
    },
    submitReview: (employeeId) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.employeeId === employeeId && r.period === CURRENT_PERIOD
            ? {
                ...r,
                status: "pending",
                submittedAt: new Date().toISOString(),
              }
            : r
        )
      )
    },
    approveReview: (employeeId, rating, note, adjusted) => {
      setReviews((prev) =>
        prev.map((r) =>
          r.employeeId === employeeId && r.period === CURRENT_PERIOD
            ? {
                ...r,
                managerRating: rating,
                managerNote: note,
                status: adjusted ? "adjusted" : "approved",
                decidedAt: new Date().toISOString(),
              }
            : r
        )
      )
    },
    setCksRevenue: (revenue) => {
      setCks((prev) => ({ ...prev, revenue }))
    },
    updateProject: (project) => {
      setProjects((prev) =>
        prev.map((p) => (p.id === project.id ? project : p))
      )
    },
    updatePayrollInput: (employeeId, patch) => {
      setPayrollInputs((prev) =>
        prev.map((p) =>
          p.employeeId === employeeId && p.period === CURRENT_PERIOD
            ? { ...p, ...patch }
            : p
        )
      )
    },
    publishPayslip: (employeeId) => {
      setPublishedIds((prev) =>
        prev.includes(employeeId) ? prev : [...prev, employeeId]
      )
    },
    publishAll: () => {
      setPublishedIds(employees.map((e) => e.id))
    },
  }

  return <HrContext.Provider value={value}>{children}</HrContext.Provider>
}

export function useHr() {
  const ctx = useContext(HrContext)
  if (!ctx) throw new Error("useHr must be used within HrProvider")
  return ctx
}

export function reviewOrEmpty(
  reviews: SelfReview[],
  employeeId: string,
  period: string
): SelfReview {
  return (
    reviews.find((r) => r.employeeId === employeeId && r.period === period) ??
    emptyReview(employeeId, period)
  )
}
