"use client";

import { useState } from "react";
import { Building2, Moon, RotateCcw, Sun, UserRound } from "lucide-react";
import { DEFAULT_SETTINGS, useApp, type Theme } from "@/lib/store";
import { PageHeader } from "@/components/layout/page-header";
import { Button } from "@/components/ui/button";
import { Select, TextInput } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import type { Currency } from "@/lib/types";
import { cn } from "@/lib/utils";

const TIMEZONES = ["Asia/Tehran", "Europe/Berlin", "Europe/London", "America/New_York", "Asia/Dubai"];
const FISCAL = ["January", "April", "July", "October"];

export default function SettingsPage() {
  const { profile, updateProfile, settings, updateSettings, theme, setTheme, pushToast } =
    useApp();

  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [role, setRole] = useState(profile.role);

  const [companyName, setCompanyName] = useState(settings.companyName);
  const [currency, setCurrency] = useState<Currency>(settings.currency);
  const [timezone, setTimezone] = useState(settings.timezone);
  const [fiscalYearStart, setFiscalYearStart] = useState(settings.fiscalYearStart);

  const saveProfile = () => {
    if (!name.trim() || !email.trim()) {
      pushToast("Profile incomplete", { desc: "Name and email are required.", variant: "danger" });
      return;
    }
    updateProfile({ name: name.trim(), email: email.trim(), role: role.trim() || "Team member" });
    pushToast("Profile saved", { desc: name.trim() });
  };

  const saveWorkspace = () => {
    if (!companyName.trim()) {
      pushToast("Company name required", { variant: "danger" });
      return;
    }
    updateSettings({ companyName: companyName.trim(), currency, timezone, fiscalYearStart });
    pushToast("Workspace saved", { desc: companyName.trim() });
  };

  const resetAll = () => {
    updateSettings({ ...DEFAULT_SETTINGS });
    updateProfile({ name: "Ali Rezaei", email: "ali.rezaei@nexa.io", role: "Operations Lead" });
    setTheme("dark");
    setName("Ali Rezaei");
    setEmail("ali.rezaei@nexa.io");
    setRole("Operations Lead");
    setCompanyName(DEFAULT_SETTINGS.companyName);
    setCurrency(DEFAULT_SETTINGS.currency);
    setTimezone(DEFAULT_SETTINGS.timezone);
    setFiscalYearStart(DEFAULT_SETTINGS.fiscalYearStart);
    pushToast("Workspace reset", { desc: "Defaults restored." });
  };

  const themeBtn = (t: Theme) =>
    cn(
      "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-[12.5px] font-medium transition-colors",
      theme === t ? "bg-surface-2 text-ink" : "text-ink-3 hover:text-ink-2"
    );

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Settings"
        subtitle="Profile, workspace, appearance and notifications — every control works"
      />

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <UserRound className="size-4 text-ink-3" /> Profile
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
              Full name
              <TextInput value={name} onChange={(e) => setName(e.target.value)} />
            </label>
            <div className="grid gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
                Email
                <TextInput value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
                Role
                <TextInput value={role} onChange={(e) => setRole(e.target.value)} />
              </label>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={saveProfile}>
                Save profile
              </Button>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="flex items-center gap-2 font-display text-[15px] font-semibold text-ink">
            <Building2 className="size-4 text-ink-3" /> Workspace
          </h2>
          <div className="mt-3 flex flex-col gap-3">
            <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
              Company name
              <TextInput value={companyName} onChange={(e) => setCompanyName(e.target.value)} />
            </label>
            <div className="grid gap-3 sm:grid-cols-3">
              <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
                Currency
                <Select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)}>
                  {(["USD", "EUR", "GBP"] as Currency[]).map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
                Timezone
                <Select value={timezone} onChange={(e) => setTimezone(e.target.value)}>
                  {TIMEZONES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </Select>
              </label>
              <label className="flex flex-col gap-1.5 text-[12px] font-medium text-ink-2">
                Fiscal start
                <Select value={fiscalYearStart} onChange={(e) => setFiscalYearStart(e.target.value)}>
                  {FISCAL.map((f) => (
                    <option key={f} value={f}>
                      {f}
                    </option>
                  ))}
                </Select>
              </label>
            </div>
            <div className="flex justify-end">
              <Button size="sm" onClick={saveWorkspace}>
                Save workspace
              </Button>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Appearance</h2>
          <div className="mt-3 flex flex-col gap-3">
            <div className="flex gap-1 rounded-xl border border-edge bg-surface-2/40 p-1">
              <button type="button" onClick={() => setTheme("dark")} className={themeBtn("dark")}>
                <Moon className="size-3.5" /> Dark
              </button>
              <button type="button" onClick={() => setTheme("light")} className={themeBtn("light")}>
                <Sun className="size-3.5" /> Light
              </button>
            </div>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 px-3.5 py-3">
              <span>
                <span className="block text-[13px] font-medium text-ink">Compact density</span>
                <span className="block text-[11.5px] text-ink-3">Tighter cards and panels</span>
              </span>
              <Toggle
                checked={settings.density}
                onToggle={(v) => updateSettings({ density: v })}
                label="Compact density"
              />
            </label>
            <label className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 px-3.5 py-3">
              <span>
                <span className="block text-[13px] font-medium text-ink">Reduce motion</span>
                <span className="block text-[11.5px] text-ink-3">Minimize animations</span>
              </span>
              <Toggle
                checked={settings.reduceMotion}
                onToggle={(v) => updateSettings({ reduceMotion: v })}
                label="Reduce motion"
              />
            </label>
          </div>
        </div>

        <div className="card p-4 sm:p-5">
          <h2 className="font-display text-[15px] font-semibold text-ink">Notifications</h2>
          <div className="mt-3 flex flex-col gap-2.5">
            {(
              [
                ["notifInvoices", "Invoices", "Paid, overdue and pending alerts"],
                ["notifInventory", "Inventory", "Low-stock and out-of-stock alerts"],
                ["notifProjects", "Projects", "Deadline slips and status changes"],
                ["notifTeam", "Team", "Hires, leave and probation updates"],
              ] as const
            ).map(([key, label, desc]) => (
              <label
                key={key}
                className="flex items-center justify-between gap-3 rounded-xl bg-surface-2/50 px-3.5 py-3"
              >
                <span>
                  <span className="block text-[13px] font-medium text-ink">{label}</span>
                  <span className="block text-[11.5px] text-ink-3">{desc}</span>
                </span>
                <Toggle
                  checked={settings[key]}
                  onToggle={(v) => updateSettings({ [key]: v })}
                  label={label}
                />
              </label>
            ))}
          </div>
        </div>
      </div>

      <div className="card flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between sm:p-5">
        <div>
          <h2 className="font-display text-[15px] font-semibold text-ink">Reset demo workspace</h2>
          <p className="mt-0.5 text-[12px] text-ink-3">
            Restore the default profile, workspace, appearance and notification settings.
          </p>
        </div>
        <Button size="sm" variant="secondary" onClick={resetAll} className="shrink-0">
          <RotateCcw className="size-3.5" /> Reset to defaults
        </Button>
      </div>
    </div>
  );
}