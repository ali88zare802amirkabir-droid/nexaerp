"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus, Search, SearchX } from "lucide-react";
import { useApp } from "@/lib/store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar } from "@/components/ui/avatar";
import { Select, TextInput } from "@/components/ui/input";
import { EmptyState } from "@/components/ui/empty-state";
import { Modal } from "@/components/ui/modal";
import { DEPT_COLOR, EMPLOYEE_STATUS_TONE } from "@/components/erp/meta";
import { EmployeeForm, type EmployeeFormValues } from "@/components/erp/employee-form";
import { DEPARTMENTS } from "@/data/reports";
import { cn, tenureLabel } from "@/lib/utils";

const PAGE_SIZE = 10;

type SortKey = "name-asc" | "name-desc" | "perf-desc" | "perf-asc" | "tenure";

export default function EmployeesPage() {
  const { employees, addEmployee, pushToast } = useApp();
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [dept, setDept] = useState("All");
  const [status, setStatus] = useState("All");
  const [sort, setSort] = useState<SortKey>("name-asc");
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let rows = employees.filter(
      (e) =>
        (dept === "All" || e.department === dept) &&
        (status === "All" || e.status === status) &&
        (!q ||
          `${e.name} ${e.email} ${e.role} ${e.department}`.toLowerCase().includes(q))
    );
    rows = [...rows].sort((a, b) => {
      switch (sort) {
        case "name-desc":
          return b.name.localeCompare(a.name);
        case "perf-desc":
          return b.performance - a.performance;
        case "perf-asc":
          return a.performance - b.performance;
        case "tenure":
          return b.joinedDaysAgo - a.joinedDaysAgo;
        default:
          return a.name.localeCompare(b.name);
      }
    });
    return rows;
  }, [employees, query, dept, status, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, pages);
  const pageRows = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  const reset = () => {
    setQuery("");
    setDept("All");
    setStatus("All");
    setSort("name-asc");
    setPage(1);
  };

  const create = (values: EmployeeFormValues) => {
    addEmployee(values);
    pushToast("Employee added", { desc: `${values.name} · ${values.role}` });
    setModalOpen(false);
    setPage(1);
  };

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Employees"
        subtitle={`${employees.length} people across ${DEPARTMENTS.length} departments`}
        actions={
          <Button size="sm" onClick={() => setModalOpen(true)}>
            <Plus className="size-4" /> Add employee
          </Button>
        }
      />

      <div className="card flex flex-col gap-3 p-4 sm:p-5">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-3" />
            <TextInput
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search name, role, email…"
              className="pl-9"
              aria-label="Search employees"
            />
          </div>
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:w-auto lg:flex">
            <Select
              value={dept}
              onChange={(e) => {
                setDept(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by department"
              className="lg:w-40"
            >
              <option value="All">All departments</option>
              {DEPARTMENTS.map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </Select>
            <Select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              aria-label="Filter by status"
              className="lg:w-36"
            >
              {["All", "Active", "On Leave", "Contract", "Probation"].map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </Select>
            <Select
              value={sort}
              onChange={(e) => setSort(e.target.value as SortKey)}
              aria-label="Sort employees"
              className="col-span-2 sm:col-span-1 lg:w-44"
            >
              <option value="name-asc">Name A–Z</option>
              <option value="name-desc">Name Z–A</option>
              <option value="perf-desc">Performance ↓</option>
              <option value="perf-asc">Performance ↑</option>
              <option value="tenure">Longest tenure</option>
            </Select>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-edge">
          <table className="w-full min-w-[920px] border-collapse text-left text-[13px]">
            <thead>
              <tr className="border-b border-edge bg-surface-2/60 text-[11px] uppercase tracking-wider text-ink-3">
                <th className="px-4 py-3 font-semibold">Employee</th>
                <th className="px-4 py-3 font-semibold">Department</th>
                <th className="px-4 py-3 font-semibold">Role</th>
                <th className="px-4 py-3 font-semibold">Status</th>
                <th className="px-4 py-3 font-semibold">Tenure</th>
                <th className="px-4 py-3 font-semibold">Performance</th>
                <th className="px-4 py-3 font-semibold" aria-label="Open" />
              </tr>
            </thead>
            <tbody>
              {pageRows.map((e) => (
                <tr
                  key={e.id}
                  onClick={() => router.push(`/employees/${e.id}`)}
                  className="cursor-pointer border-b border-edge/60 transition-colors last:border-0 hover:bg-surface-2/50 odd:bg-surface-2/25"
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <Avatar name={e.name} color={e.avatarColor} size="sm" />
                      <span className="min-w-0">
                        <span className="block truncate font-medium text-ink">{e.name}</span>
                        <span className="block truncate text-[11.5px] text-ink-3">{e.email}</span>
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="flex items-center gap-1.5 text-ink-2">
                      <span className="size-2 shrink-0 rounded-full" style={{ background: DEPT_COLOR[e.department] }} />
                      {e.department}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-ink-2">{e.role}</td>
                  <td className="px-4 py-3">
                    <Badge tone={EMPLOYEE_STATUS_TONE[e.status]}>{e.status}</Badge>
                  </td>
                  <td className="whitespace-nowrap px-4 py-3 tabular-nums text-ink-2">
                    {tenureLabel(e.joinedDaysAgo)}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="h-1.5 w-20 overflow-hidden rounded-full bg-surface-3">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${e.performance}%`,
                            background: e.performance >= 90 ? "#34d399" : e.performance >= 78 ? "#55a1ff" : "#fbbf24",
                          }}
                        />
                      </div>
                      <span className="text-[12px] font-semibold tabular-nums text-ink">{e.performance}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <ChevronRight className="ml-auto size-4 text-ink-3" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? (
          <EmptyState
            icon={<SearchX className="size-5" />}
            title="No employees match these filters"
            desc="Try a different search term or department."
            action={
              <Button size="sm" variant="secondary" onClick={reset}>
                Clear filters
              </Button>
            }
          />
        ) : (
          <div className="flex items-center justify-between text-[12px] text-ink-3">
            <span>
              Showing {(safePage - 1) * PAGE_SIZE + 1}–{Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
            </span>
            <div className="flex items-center gap-1.5">
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Prev
              </Button>
              <span className={cn("px-2 tabular-nums")}>
                {safePage} / {pages}
              </span>
              <Button
                size="sm"
                variant="secondary"
                disabled={safePage >= pages}
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </div>

      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title="Add employee" width="max-w-xl">
        <EmployeeForm onSubmit={create} />
      </Modal>
    </div>
  );
}