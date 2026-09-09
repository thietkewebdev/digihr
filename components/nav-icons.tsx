import {
  ClipboardCheck,
  FileText,
  FolderKanban,
  Home,
  PenLine,
  Signature,
  Wallet,
} from "lucide-react"
import type { NavItem } from "@/lib/nav"

const ICONS = {
  home: Home,
  review: PenLine,
  approve: ClipboardCheck,
  cks: Signature,
  project: FolderKanban,
  payroll: Wallet,
  payslip: FileText,
}

export function NavIcon({
  name,
  className,
}: {
  name: NavItem["icon"]
  className?: string
}) {
  const Icon = ICONS[name]
  return <Icon className={className} />
}
