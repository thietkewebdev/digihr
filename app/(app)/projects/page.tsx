"use client"

import Link from "next/link"
import { PageHeader } from "@/components/page-header"
import { PersonAvatar } from "@/components/person-avatar"
import { Money } from "@/components/money"
import { AvatarGroup } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { allocateProject } from "@/lib/calc"
import { periodLabel } from "@/lib/format"
import { useHr } from "@/lib/hr-store"

export default function ProjectsPage() {
  const { projects, getEmployee, period } = useHr()

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Network / Camera"
        title="Thưởng dự án"
        description="Chia quỹ theo ngày công × hệ số vai trò."
      />

      <div className="grid gap-4 md:grid-cols-2">
        {projects.map((project) => {
          const rows = allocateProject(project)
          const current = project.period === period
          return (
            <Link key={project.id} href={`/projects/${project.id}`}>
              <Card className="h-full transition-colors hover:bg-muted/30">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-xs text-muted-foreground">
                        {project.code}
                      </p>
                      <CardTitle>{project.name}</CardTitle>
                    </div>
                    <Badge variant={current ? "default" : "secondary"}>
                      {periodLabel(project.period)}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <p className="text-xs text-muted-foreground">Quỹ thưởng</p>
                    <Money
                      value={project.pool}
                      className="text-xl font-semibold"
                    />
                  </div>
                  <AvatarGroup>
                    {rows.map((row) => {
                      const emp = getEmployee(row.employeeId)
                      if (!emp) return null
                      return (
                        <PersonAvatar
                          key={row.employeeId}
                          name={emp.name}
                          initials={emp.initials}
                        />
                      )
                    })}
                  </AvatarGroup>
                  <p className="text-sm text-muted-foreground">
                    {rows.length} người · bấm để xem cách chia
                  </p>
                </CardContent>
              </Card>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
