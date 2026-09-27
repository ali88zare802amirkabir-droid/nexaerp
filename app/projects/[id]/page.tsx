"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  CalendarDays,
  FolderKanban,
  ListTodo,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";
import { useApp } from "@/lib/store";
import { relAgoDays } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { PROJECT_STATUS_TONE, PROJECT_TONE_DOT, TASK_PRIORITY_TONE, TASK_STATUS_TONE } from "@/components/erp/meta";
import { ProjectForm, type ProjectFormValues } from "@/components/erp/project-form";
import type { ProjectStatus, Task, TaskPriority, TaskStatus } from "@/lib/types";
import { cn } from "@/lib/utils";

type Tab = "tasks" | "team" | "timeline" | "activity";

function offsetLabel(off: number): string {
  if (off < 0) return `${Math.abs(off)}d ago`;
  if (off === 0) return "today";
  return `in ${off}d`;
}

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>();
  const {
    projects,
    employees,
    tasks,
    money,
    updateProject,
    addTask,
    updateTaskStatus,
    deleteTask,
    pushToast,
  } = useApp();
  const [tab, setTab] = useState<Tab>("tasks");
  const [editOpen, setEditOpen] = useState(false);
  const [taskOpen, setTaskOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState("");
  const [taskAssignee, setTaskAssignee] = useState("");
  const [taskPriority, setTaskPriority] = useState<TaskPriority>("Medium");
  const [taskDue, setTaskDue] = useState(7);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const project = projects.find((p) => p.id === params.id);

  const mine = useMemo(
    () => (project ? tasks.filter((t) => t.projectId === project.id) : []),
    [project, tasks]
  );

  const milestones = useMemo(() => {
    if (!project) return [];
    const start = -project.startedDaysAgo;
    const end = project.dueOffset;
    const span = Math.max(1, end - start);
    const points = [
      { frac: 0, label: "Kickoff" },
      { frac: 0.25, label: "First milestone" },
      { frac: 0.5, label: "Midpoint review" },
      { frac: 0.75, label: "Pre-launch check" },
      { frac: 1, label: "Launch" },
    ];
    return points.map((m) => ({
      label: m.label,
      day: Math.round(start + span * m.frac),
      done: project.progress >= m.frac * 100,
    }));
  }, [project]);

  const activity = useMemo(() => {
    if (!project) return [];
    const items: Array<{ id: string; kind: string; title: string; desc: string; daysAgo: number }> = [
      {
        id: "joined",
        kind: "team",
        title: "Team assembled",
        desc: `${project.teamIds.length} members onboarded`,
        daysAgo: project.startedDaysAgo,
      },
      ...mine.map((t) => ({
        id: `t-${t.id}`,
        kind: "task",
        title: t.status === "Done" ? "Task completed" : "Task created",
        desc: t.title,
        daysAgo: t.createdDaysAgo,
      })),
    ];
    return items.sort((a, b) => a.daysAgo - b.daysAgo);
  }, [project, mine]);

  if (!project) {
    return (
      <div className="flex flex-col gap-5">
        <EmptyState
          icon={<FolderKanban className="size-5" />}
          title="Project not found"
          desc="This project may have been removed."
          action={
            <Link
              href="/projects"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-edge-strong px-3 text-[12.5px] font-medium text-ink hover:bg-surface-2"
            >
              <ArrowLeft className="size-3.5" /> Back to projects
            </Link>
          }
        />
      </div>
    );
  }

  const lead = employees.find((e) => e.id === project.leadId);
  const team = employees.filter((e) => project.teamIds.includes(e.id));
  const budgetPct = project.budget > 0 ? Math.min(100, Math.round((project.spent / project.budget) * 100)) : 0;
  const openCount = mine.filter((t) => t.status !== "Done").length;

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "tasks", label: `Tasks · ${mine.length}` },
    { key: "team", label: `Team · ${team.length}` },
    { key: "timeline", label: "Timeline" },
    { key: "activity", label: "Activity" },
  ];

  const save = (values: ProjectFormValues) => {
    updateProject(project.id, values);
    pushToast("Project updated", { desc: project.name });
    setEditOpen(false);
  };

  const createTask = () => {
    if (!taskTitle.trim() || !taskAssignee) return;
    addTask({
      title: taskTitle.trim(),
      projectId: project.id,
      assigneeId: taskAssignee,
      priority: taskPriority,
      dueOffset: Math.round(taskDue),
    });
    pushToast("Task added", { desc: taskTitle.trim() });
    setTaskTitle("");
    setTaskDue(7);
    setTaskOpen(false);
    setTab("tasks");
  };

  const advance = (t: Task) => {
    const next: TaskStatus =
      t.status === "Open" ? "In Progress" : t.status === "In Progress" ? "Done" : "Open";
    updateTaskStatus(t.id, next);
    pushToast("Task updated", { desc: `${t.title} → ${next}` });
  };

  const groups: Array<{ status: TaskStatus; title: string }> = [
    { status: "Open", title: "Open" },
    { status: "In Progress", title: "In progress" },
    { status: "Done", title: "Done" },
  ];

  return (
    <div className="flex flex-col gap-5">
      <Link
        href="/projects"
        className="flex w-fit items-center gap-1.5 text-[12.5px] font-medium text-ink-3 transition-colors hover:text-ink"
      >
        <ArrowLeft className="size-3.5" /> Projects
      </Link>

      <div className="card flex flex-col gap-4 p-4 sm:p-5">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="font-display text-xl font-bold tracking-tight text-ink">{project.name}</h1>
              <Badge tone="neutral">{project.code}</Badge>
              <Badge tone={PROJECT_STATUS_TONE[project.status]}>{project.status}</Badge>
            </div>
            <p className="mt-1.5 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12.5px] text-ink-3">
              <span className="flex items-center gap-1.5">
                <CalendarDays className="size-3.5" />
                {project.status === "Completed" ? "Delivered" : `Due ${offsetLabel(project.dueOffset)}`}
              </span>
              <span>
                Lead · <strong className="font-medium text-ink-2">{lead?.name}</strong>
              </span>
              <span>
                Budget · <strong className="tabular-nums text-ink-2">{money(project.spent)}</strong> of{" "}
                <strong className="tabular-nums text-ink-2">{money(project.budget)}</strong>
              </span>
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <Select
              value={project.status}
              onChange={(e) => {
                const next = e.target.value as ProjectStatus;
                updateProject(project.id, {
                  status: next,
                  progress: next === "Completed" ? 100 : project.progress,
                });
                pushToast("Project updated", { desc: `${project.name} → ${next}` });
              }}
              aria-label="Update project status"
              className="w-36 !py-2 text-[12.5px]"
            >
              {(["On Track", "At Risk", "On Hold", "Completed"] as ProjectStatus[]).map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Button size="sm" variant="secondary" onClick={() => setEditOpen(true)}>
              <Pencil className="size-3.5" /> Edit
            </Button>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="flex items-center justify-between text-[11.5px] text-ink-3">
              <span>Overall progress</span>
              <span className="font-semibold tabular-nums text-ink">{project.progress}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${project.progress}%`,
                  background: PROJECT_TONE_DOT[project.status],
                }}
              />
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between text-[11.5px] text-ink-3">
              <span>Budget used</span>
              <span className="font-semibold tabular-nums text-ink">{budgetPct}%</span>
            </div>
            <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-surface-3">
              <div
                className="h-full rounded-full bg-cyan transition-all"
                style={{ width: `${budgetPct}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between gap-2">
        <div className="flex flex-1 gap-1 overflow-x-auto rounded-xl border border-edge bg-surface p-1 sm:w-fit sm:flex-none">
          {tabs.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={cn(
                "flex-1 whitespace-nowrap rounded-lg px-4 py-1.5 text-[12.5px] font-medium transition-colors sm:flex-none",
                tab === t.key ? "bg-surface-2 text-ink" : "text-ink-3 hover:text-ink-2"
              )}
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={() => { setTaskAssignee(project.teamIds[0] ?? ""); setTaskOpen(true); }}>
          <Plus className="size-3.5" /> Add task
        </Button>
      </div>

      {tab === "tasks" && (
        <div className="grid gap-4 lg:grid-cols-3">
          {groups.map((g) => {
            const list = mine.filter((t) => t.status === g.status);
            return (
              <div key={g.status} className="card flex flex-col gap-2 p-4">
                <div className="flex items-center justify-between">
                  <h2 className="flex items-center gap-2 text-[13px] font-semibold text-ink">
                    <ListTodo className="size-4 text-ink-3" /> {g.title}
                  </h2>
                  <span className="rounded-full bg-surface-2 px-2 py-0.5 text-[11px] font-semibold tabular-nums text-ink-2">
                    {list.length}
                  </span>
                </div>
                {list.map((t) => {
                  const assignee = employees.find((e) => e.id === t.assigneeId);
                  return (
                    <div key={t.id} className="rounded-xl bg-surface-2/50 px-3 py-2.5">
                      <p className="text-[12.5px] font-medium leading-snug text-ink">{t.title}</p>
                      <div className="mt-2 flex flex-wrap items-center gap-1.5">
                        {assignee && <Avatar name={assignee.name} color={assignee.avatarColor} size="xs" />}
                        <Badge tone={TASK_PRIORITY_TONE[t.priority]}>{t.priority}</Badge>
                        <Badge tone={TASK_STATUS_TONE[t.status]}>{t.status}</Badge>
                      </div>
                      <div className="mt-2 flex items-center gap-1.5">
                        <Button
                          size="sm"
                          variant="soft"
                          onClick={() => advance(t)}
                          className="!h-7 !px-2.5 !text-[11.5px]"
                        >
                          {t.status === "Open" ? "Start" : t.status === "In Progress" ? "Complete" : "Reopen"}
                        </Button>
                        {deletingId === t.id ? (
                          <>
                            <Button
                              size="sm"
                              variant="danger"
                              className="!h-7 !px-2.5 !text-[11.5px]"
                              onClick={() => {
                                deleteTask(t.id);
                                pushToast("Task deleted", { desc: t.title, variant: "danger" });
                                setDeletingId(null);
                              }}
                            >
                              Confirm
                            </Button>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="!h-7 !px-2.5 !text-[11.5px]"
                              onClick={() => setDeletingId(null)}
                            >
                              Cancel
                            </Button>
                          </>
                        ) : (
                          <Button
                            size="sm"
                            variant="secondary"
                            className="!h-7 !px-2.5"
                            aria-label={`Delete ${t.title}`}
                            onClick={() => setDeletingId(t.id)}
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
                {list.length === 0 && (
                  <p className="rounded-xl border border-dashed border-edge-strong px-3 py-4 text-center text-[12px] text-ink-3">
                    No {g.title.toLowerCase()} tasks.
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}

      {tab === "team" && (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {team.map((m) => (
            <Link key={m.id} href={`/employees/${m.id}`} className="card flex items-center gap-3 p-4 transition-colors hover:border-edge-strong">
              <Avatar name={m.name} color={m.avatarColor} size="lg" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-[13.5px] font-semibold text-ink">{m.name}</span>
                <span className="block truncate text-[12px] text-ink-3">
                  {m.role} · {m.department}
                  {m.id === project.leadId ? " · Lead" : ""}
                </span>
              </span>
            </Link>
          ))}
        </div>
      )}

      {tab === "timeline" && (
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Plan timeline</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">
            Milestones interpolated from kickoff and launch · {openCount} tasks still open
          </p>
          <div className="mt-4 flex flex-col">
            {milestones.map((m) => (
              <div key={m.label} className="flex gap-3 pb-5 last:pb-0">
                <span
                  className={cn(
                    "mt-1 flex size-5 shrink-0 items-center justify-center rounded-full border text-[10px] font-bold",
                    m.done ? "border-ok bg-ok-soft text-ok" : "border-edge-strong text-ink-3"
                  )}
                >
                  {m.done ? "✓" : "·"}
                </span>
                <div className="min-w-0 flex-1">
                  <p className={cn("text-[13px] font-medium", m.done ? "text-ink" : "text-ink-2")}>
                    {m.label}
                  </p>
                  <p className="text-[11.5px] text-ink-3">{offsetLabel(m.day)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === "activity" && (
        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Project activity</h2>
          <div className="mt-4 flex flex-col">
            {activity.map((a) => (
              <div key={a.id} className="flex gap-3 pb-4 last:pb-0">
                <span className="mt-1 size-2 shrink-0 rounded-full bg-accent" aria-hidden />
                <div className="min-w-0 flex-1">
                  <p className="text-[12.5px] font-medium text-ink">{a.title}</p>
                  <p className="truncate text-[11.5px] text-ink-3">{a.desc}</p>
                </div>
                <span className="shrink-0 text-[10.5px] text-ink-3">{relAgoDays(a.daysAgo)}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit · ${project.name}`} width="max-w-xl">
        <ProjectForm employees={employees} initial={project} onSubmit={save} />
      </Modal>

      <Modal open={taskOpen} onClose={() => setTaskOpen(false)} title="Add task" width="max-w-lg">
        <div className="flex flex-col gap-3">
          <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
            Task title
            <TextInput
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              placeholder="Draft automation test plan"
            />
          </label>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
              Assignee
              <Select value={taskAssignee} onChange={(e) => setTaskAssignee(e.target.value)}>
                {team.map((m) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
              Priority
              <Select value={taskPriority} onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}>
                {(["High", "Medium", "Low"] as TaskPriority[]).map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </Select>
            </label>
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
              Due in (days)
              <TextInput type="number" value={taskDue} onChange={(e) => setTaskDue(Number(e.target.value) || 0)} />
            </label>
          </div>
          <div className="mt-1 flex justify-end">
            <Button size="sm" onClick={createTask} disabled={!taskTitle.trim() || !taskAssignee}>
              Add task
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}