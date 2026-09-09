import { useMemo } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  BadgeIndianRupee,
  CalendarCheck,
  GraduationCap,
  Layers,
  TrendingDown,
  TrendingUp,
  UserCog,
  Users,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { PageHeader, Panel } from "@/components/common/Ui";
import { fmtDate, inr, invoiceTotal } from "@/utils/helpers";

function Stat({
  label,
  value,
  icon: Icon,
  trend,
  tone = "primary",
}: {
  label: string;
  value: string;
  icon: any;
  trend?: number;
  tone?: "primary" | "success" | "warning" | "destructive";
}) {
  const tones: Record<string, string> = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/20 text-warning-foreground",
    destructive: "bg-destructive/10 text-destructive",
  };
  return (
    <div className="rounded-xl border border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-2 text-2xl font-bold tracking-tight">{value}</p>
        </div>
        <span className={`flex size-10 items-center justify-center rounded-lg ${tones[tone]}`}>
          <Icon className="size-5" />
        </span>
      </div>
      {trend !== undefined && (
        <p
          className={`mt-3 inline-flex items-center gap-1 text-xs font-medium ${
            trend >= 0 ? "text-success" : "text-destructive"
          }`}
        >
          {trend >= 0 ? <TrendingUp className="size-3.5" /> : <TrendingDown className="size-3.5" />}
          {Math.abs(trend)}% vs last month
        </p>
      )}
    </div>
  );
}

export function Dashboard() {
  const { students, teachers, staff, invoices, payments, attendance, exams, admissions, notices, marks } =
    useApp();

  const stats = useMemo(() => {
    const collected = payments.reduce((a: number, p: any) => a + Number(p.amount || 0), 0);
    const pending = invoices
      .filter((i: any) => i.status !== "Paid")
      .reduce((a: number, i: any) => a + (invoiceTotal(i) - Number(i.paid || 0)), 0);
    const dates = [...new Set(attendance.map((a: any) => a.date))].sort();
    const last = dates[dates.length - 1];
    const day = attendance.filter((a: any) => a.date === last);
    const present = day.filter((a: any) => a.status === "Present").length;
    const pct = day.length ? Math.round((present / day.length) * 100) : 0;
    return { collected, pending, pct, last, classes: new Set(students.map((s: any) => s.className)).size };
  }, [payments, invoices, attendance, students]);

  const monthly = useMemo(() => {
    const order = ["April", "May", "June", "July", "August"];
    return order.map((m) => {
      const ids = invoices.filter((i: any) => i.month === m).map((i: any) => i.id);
      const collected = payments
        .filter((p: any) => ids.includes(p.invoiceId))
        .reduce((a: number, p: any) => a + p.amount, 0);
      const due = invoices
        .filter((i: any) => i.month === m)
        .reduce((a: number, i: any) => a + invoiceTotal(i), 0);
      return { month: m.slice(0, 3), Collected: collected, Due: due };
    });
  }, [invoices, payments]);

  const attendanceTrend = useMemo(() => {
    const dates = [...new Set(attendance.map((a: any) => a.date))].sort().slice(-10);
    return dates.map((d) => {
      const day = attendance.filter((a: any) => a.date === d);
      const present = day.filter((a: any) => a.status === "Present").length;
      return {
        day: d.slice(-2),
        Attendance: day.length ? Math.round((present / day.length) * 100) : 0,
      };
    });
  }, [attendance]);

  const strength = useMemo(() => {
    const map: Record<string, number> = {};
    students.forEach((s: any) => {
      map[s.className] = (map[s.className] || 0) + 1;
    });
    return Object.entries(map).map(([name, value]) => ({ name, value }));
  }, [students]);

  const performance = useMemo(() => {
    const buckets = [
      { name: "90-100", value: 0 },
      { name: "75-89", value: 0 },
      { name: "60-74", value: 0 },
      { name: "40-59", value: 0 },
      { name: "Below 40", value: 0 },
    ];
    students.forEach((s: any) => {
      const rows = marks.filter((m: any) => m.studentId === s.id);
      if (!rows.length) return;
      const total = rows.reduce((a: number, m: any) => a + m.marks, 0);
      const max = rows.reduce((a: number, m: any) => a + m.maxMarks, 0);
      const pct = (total / max) * 100;
      const idx = pct >= 90 ? 0 : pct >= 75 ? 1 : pct >= 60 ? 2 : pct >= 40 ? 3 : 4;
      buckets[idx].value += 1;
    });
    return buckets;
  }, [students, marks]);

  const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];
  const upcoming = exams.filter((e: any) => e.status !== "Completed");

  return (
    <>
      <PageHeader
        title="Dashboard"
        subtitle={`Overview for academic session ${students[0]?.session || "2025-26"}`}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Total Students" value={String(students.length)} icon={Users} trend={4} />
        <Stat label="Total Teachers" value={String(teachers.length)} icon={GraduationCap} trend={2} tone="success" />
        <Stat label="Total Staff" value={String(staff.length)} icon={UserCog} />
        <Stat label="Total Classes" value={String(stats.classes)} icon={Layers} />
        <Stat
          label="Today's Attendance"
          value={`${stats.pct}%`}
          icon={CalendarCheck}
          trend={1}
          tone="success"
        />
        <Stat label="Fees Collected" value={inr(stats.collected)} icon={BadgeIndianRupee} trend={7} tone="success" />
        <Stat label="Pending Fees" value={inr(stats.pending)} icon={BadgeIndianRupee} trend={-3} tone="destructive" />
        <Stat label="Upcoming Exams" value={String(upcoming.length)} icon={GraduationCap} tone="warning" />
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Panel title="Monthly Fee Collection">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthly}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Legend />
                <Bar dataKey="Collected" fill="var(--chart-1)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="Due" fill="var(--chart-3)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Student Attendance %">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={attendanceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="day" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis domain={[60, 100]} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Line type="monotone" dataKey="Attendance" stroke="var(--chart-2)" strokeWidth={3} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Class-wise Student Strength">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={strength}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={12} />
                <YAxis allowDecimals={false} stroke="var(--muted-foreground)" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
                <Bar dataKey="value" name="Students" fill="var(--chart-4)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Panel>

        <Panel title="Exam Performance Spread">
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={performance} dataKey="value" nameKey="name" innerRadius={50} outerRadius={90} paddingAngle={3}>
                  {performance.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Legend />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 8 }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </Panel>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-3">
        <Panel title="Recent Admissions">
          <ul className="space-y-3">
            {admissions.slice(0, 5).map((a: any) => (
              <li key={a.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{a.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {a.regNo} • Class {a.applyingClass}
                  </p>
                </div>
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-semibold ${
                    a.status === "Approved" ? "bg-success/15 text-success" : "bg-warning/20 text-warning-foreground"
                  }`}
                >
                  {a.status}
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Recent Payments">
          <ul className="space-y-3">
            {payments.slice(-5).reverse().map((p: any) => {
              const st = students.find((s: any) => s.id === p.studentId);
              return (
                <li key={p.id} className="flex items-center justify-between gap-3 text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-medium">{st?.name || "—"}</p>
                    <p className="text-xs text-muted-foreground">
                      {p.receiptNo} • {fmtDate(p.date)} • {p.mode}
                    </p>
                  </div>
                  <span className="font-semibold text-success">{inr(p.amount)}</span>
                </li>
              );
            })}
          </ul>
        </Panel>

        <Panel title="Notices">
          <ul className="space-y-3">
            {notices.slice(0, 5).map((n: any) => (
              <li key={n.id} className="text-sm">
                <p className="font-medium">{n.title}</p>
                <p className="line-clamp-2 text-xs text-muted-foreground">{n.description}</p>
                <p className="mt-1 text-[11px] uppercase tracking-wide text-muted-foreground">
                  {fmtDate(n.date)} • {n.audience}
                </p>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </>
  );
}
