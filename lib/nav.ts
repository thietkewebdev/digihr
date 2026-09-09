import type { Role } from "@/types/hr"

export type NavItem = {
  href: string
  label: string
  short: string
  icon: "home" | "review" | "approve" | "cks" | "project" | "payroll" | "payslip"
  roles: Role[]
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: "/dashboard",
    label: "Trang chủ",
    short: "Home",
    icon: "home",
    roles: ["employee", "manager", "admin"],
  },
  {
    href: "/self-review",
    label: "Tự đánh giá",
    short: "Đánh giá",
    icon: "review",
    roles: ["employee"],
  },
  {
    href: "/approvals",
    label: "Duyệt đánh giá",
    short: "Duyệt",
    icon: "approve",
    roles: ["manager"],
  },
  {
    href: "/cks",
    label: "Doanh thu CKS",
    short: "CKS",
    icon: "cks",
    roles: ["manager", "admin"],
  },
  {
    href: "/projects",
    label: "Thưởng dự án",
    short: "Dự án",
    icon: "project",
    roles: ["manager", "admin"],
  },
  {
    href: "/payroll",
    label: "Bảng lương",
    short: "Lương",
    icon: "payroll",
    roles: ["manager", "admin"],
  },
  {
    href: "/payslip",
    label: "Phiếu lương",
    short: "Phiếu",
    icon: "payslip",
    roles: ["employee", "admin"],
  },
]

export function navFor(role: Role) {
  return NAV_ITEMS.filter((item) => item.roles.includes(role))
}

export function canAccess(role: Role, href: string) {
  if (href.startsWith("/payslip/") && role === "manager") return true
  const item = NAV_ITEMS.find(
    (n) => href === n.href || href.startsWith(`${n.href}/`)
  )
  if (!item) return true
  return item.roles.includes(role)
}
