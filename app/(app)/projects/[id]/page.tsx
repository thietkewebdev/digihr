"use client"

import { use, useMemo, useState } from "react"
import Link from "next/link"
import { toast } from "sonner"
import { ArrowLeft } from "lucide-react"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { EmptyState } from "@/components/empty-state"
import { Money } from "@/components/money"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { allocateProject, PROJECT_ROLE_LABEL } from "@/lib/calc"
import { formatNumber, parseVndInput, periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"
import type { BonusProject, ProjectRole } from "@/types/hr"
import { cn } from "@/lib/utils"

const ROLES: ProjectRole[] = ["truong-nhom", "ky-thuat-chinh", "ho-tro"]

export default function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const { projects, getEmployee, updateProject, employees, role } = useHr()
  const project = projects.find((p) => p.id === id)

  if (!project) {
    return (
      <EmptyState
        title="Không thấy dự án"
        action={
          <Link href="/projects" className={cn(buttonVariants())}>
            Quay lại
          </Link>
        }
      />
    )
  }

  return (
    <ProjectEditor
      project={project}
      canEdit={role === "manager" || role === "admin"}
      employees={employees}
      getEmployee={getEmployee}
      updateProject={updateProject}
    />
  )
}

function ProjectEditor({
  project,
  canEdit,
  employees,
  getEmployee,
  updateProject,
}: {
  project: BonusProject
  canEdit: boolean
  employees: ReturnType<typeof useHr>["employees"]
  getEmployee: ReturnType<typeof useHr>["getEmployee"]
  updateProject: (project: BonusProject) => void
}) {
  const [poolDraft, setPoolDraft] = useState(String(project.pool))
  const rows = useMemo(() => allocateProject(project), [project])

  return (
    <div className="space-y-6">
      <Link
        href="/projects"
        className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="size-3.5" /> Dự án
      </Link>
      <PageHeader
        eyebrow={project.code}
        title={project.name}
        description={periodLabel(project.period)}
      />

      {canEdit ? (
        <Card>
          <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-end">
            <div className="flex-1 space-y-1.5">
              <Label>Quỹ thưởng đã duyệt</Label>
              <Input
                inputMode="numeric"
                value={formatNumber(parseVndInput(poolDraft) || 0)}
                onChange={(e) => setPoolDraft(e.target.value)}
              />
            </div>
            <Button
              onClick={() => {
                updateProject({ ...project, pool: parseVndInput(poolDraft) })
                toast.success("Đã cập nhật quỹ. Hệ thống chia lại.")
              }}
            >
              Cập nhật quỹ
            </Button>
          </CardContent>
        </Card>
      ) : null}

      <div className="space-y-3">
        {rows.map((row) => {
          const emp = getEmployee(row.employeeId)
          if (!emp) return null
          return (
            <Card key={row.employeeId}>
              <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <PersonAvatar name={emp.name} initials={emp.initials} />
                <div className="min-w-0 flex-1">
                  <p className="font-medium">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {row.days} ngày × {PROJECT_ROLE_LABEL[row.role]} (
                    {row.points} điểm) · {Math.round(row.share * 100)}%
                  </p>
                </div>
                <Money value={row.amount} className="text-lg font-semibold" />
              </CardContent>
              {canEdit ? (
                <div className="grid grid-cols-2 gap-2 px-4 pb-4">
                  <div className="space-y-1">
                    <Label className="text-xs">Ngày</Label>
                    <Input
                      type="number"
                      min={0}
                      value={row.days}
                      onChange={(e) => {
                        const days = Number(e.target.value) || 0
                        updateProject({
                          ...project,
                          participants: project.participants.map((p) =>
                            p.employeeId === row.employeeId ? { ...p, days } : p
                          ),
                        })
                      }}
                    />
                  </div>
                  <div className="space-y-1">
                    <Label className="text-xs">Vai trò</Label>
                    <Select
                      value={row.role}
                      onValueChange={(value) => {
                        if (!value) return
                        updateProject({
                          ...project,
                          participants: project.participants.map((p) =>
                            p.employeeId === row.employeeId
                              ? { ...p, role: value as ProjectRole }
                              : p
                          ),
                        })
                      }}
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {ROLES.map((role) => (
                          <SelectItem key={role} value={role}>
                            {PROJECT_ROLE_LABEL[role]}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              ) : null}
            </Card>
          )
        })}
      </div>

      {canEdit ? (
        <AddParticipant
          project={project}
          employees={employees}
          updateProject={updateProject}
        />
      ) : null}

      <p className="text-xs text-muted-foreground">
        Điểm = ngày × hệ số (Trưởng nhóm 1.2, Kỹ thuật chính 1.0, Hỗ trợ 0.6).
        Quỹ chia theo tỷ lệ điểm.
      </p>
    </div>
  )
}

function AddParticipant({
  project,
  employees,
  updateProject,
}: {
  project: BonusProject
  employees: ReturnType<typeof useHr>["employees"]
  updateProject: (project: BonusProject) => void
}) {
  const taken = new Set(project.participants.map((p) => p.employeeId))
  const leftover = employees.filter((e) => e.networkEligible && !taken.has(e.id))
  const [employeeId, setEmployeeId] = useState(leftover[0]?.id ?? "")

  if (!leftover.length) return null

  return (
    <Card>
      <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <div className="flex-1 space-y-1.5">
          <Label>Thêm người (đủ điều kiện Network)</Label>
          <Select
            value={employeeId}
            onValueChange={(v) => v && setEmployeeId(v)}
          >
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {leftover.map((e) => (
                <SelectItem key={e.id} value={e.id}>
                  {e.id} · {e.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <Button
          variant="outline"
          onClick={() => {
            if (!employeeId) return
            updateProject({
              ...project,
              participants: [
                ...project.participants,
                { employeeId, days: 1, role: "ho-tro" },
              ],
            })
            toast.success("Đã thêm người. Quỹ chia lại.")
          }}
        >
          Thêm
        </Button>
      </CardContent>
    </Card>
  )
}
