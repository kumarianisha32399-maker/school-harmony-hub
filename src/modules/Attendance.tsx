import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Save } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState, PageHeader, Panel, SelectField, TextField } from "@/components/common/Ui";
import { Button } from "@/components/ui/button";
import { fmtDate, today } from "@/utils/helpers";
import { Badge, attendanceSummary, MONTHS } from "@/modules/shared";

const STATUSES = ["Present", "Absent", "Late", "Leave"];
const tone = (s: string) => (s === "Present" ? "green" : s === "Absent" ? "red" : s === "Late" ? "amber" : "blue");

export function MarkAttendance() {
  const { students, attendance, classes, sections, replace } = useApp();
  const [cls, setCls] = useState(classes[7] || classes[0]);
  const [sec, setSec] = useState(sections[0]);
  const [date, setDate] = useState(today());
  const [draft, setDraft] = useState<Record<string, string>>({});

  const list = useMemo(
    () => students.filter((s: any) => s.className === cls && s.section === sec),
    [students, cls, sec],
  );

  const statusOf = (sid: string) =>
    draft[sid] ?? attendance.find((a: any) => a.studentId === sid && a.date === date)?.status ?? "Present";

  const save = () => {
    if (!list.length) return toast.error("No students in this class and section.");
    const rest = attendance.filter((a: any) => !(a.date === date && list.some((s: any) => s.id === a.studentId)));
    const rows = list.map((s: any) => ({
      id: `att-${s.id}-${date}`,
      studentId: s.id,
      date,
      status: statusOf(s.id),
    }));
    replace("attendance", [...rest, ...rows]);
    setDraft({});
    toast.success(`Attendance saved for ${list.length} students.`);
  };

  const counts = STATUSES.map((st) => ({ st, n: list.filter((s: any) => statusOf(s.id) === st).length }));

  return (
    <div>
      <PageHeader
        title="Mark Attendance"
        subtitle={`${cls}-${sec} • ${fmtDate(date)}`}
        actions={<Button onClick={save}><Save className="size-4" /> Save Attendance</Button>}
      />
      <Panel title="Select class">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Class" value={cls} onChange={setCls} options={classes} />
          <SelectField label="Section" value={sec} onChange={setSec} options={sections} />
          <TextField label="Date" type="date" value={date} onChange={setDate} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {counts.map((c) => (
            <Badge key={c.st} tone={tone(c.st)}>{c.st}: {c.n}</Badge>
          ))}
          <Badge tone="blue">
            Attendance %: {list.length ? Math.round((counts.filter((c) => c.st !== "Absent").reduce((a, b) => a + b.n, 0) / list.length) * 100) : 0}%
          </Badge>
        </div>
      </Panel>

      <div className="mt-6 space-y-2">
        {!list.length && <EmptyState message="No students found for this class and section." />}
        {list.map((s: any) => (
          <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{s.name}</p>
              <p className="text-xs text-muted-foreground">{s.admissionNo} • Roll {s.rollNo}</p>
            </div>
            <div className="flex flex-wrap gap-1">
              {STATUSES.map((st) => (
                <button
                  key={st}
                  type="button"
                  onClick={() => setDraft((d) => ({ ...d, [s.id]: st }))}
                  className={`rounded-md border px-3 py-1.5 text-xs font-semibold transition-colors ${
                    statusOf(s.id) === st ? "border-primary bg-primary text-primary-foreground" : "border-border hover:border-primary/50"
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function DailyAttendance() {
  const { students, attendance, classes } = useApp();
  const [date, setDate] = useState("2025-08-12");
  const [cls, setCls] = useState("All");

  const rows = useMemo(() => {
    return students
      .filter((s: any) => cls === "All" || s.className === cls)
      .map((s: any) => {
        const rec = attendance.find((a: any) => a.studentId === s.id && a.date === date);
        return {
          id: s.id,
          name: s.name,
          admissionNo: s.admissionNo,
          className: `${s.className}-${s.section}`,
          rollNo: s.rollNo,
          status: rec?.status || "Not marked",
        };
      });
  }, [students, attendance, date, cls]);

  const present = rows.filter((r) => r.status === "Present" || r.status === "Late").length;

  return (
    <div>
      <PageHeader
        title="Daily Attendance"
        subtitle={`${present} present of ${rows.length} • ${fmtDate(date)}`}
      />
      <DataTable
        exportName={`attendance-${date}`}
        rows={rows}
        searchKeys={["name", "admissionNo", "className"]}
        filters={
          <>
            <input type="date" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={date} onChange={(e) => setDate(e.target.value)} />
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={cls} onChange={(e) => setCls(e.target.value)}>
              {["All", ...classes].map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        }
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "rollNo", label: "Roll" },
          { key: "status", label: "Status", render: (r) => <Badge tone={tone(r.status)}>{r.status}</Badge> },
        ]}
      />
    </div>
  );
}

export function MonthlyAttendance() {
  const { students, attendance, classes } = useApp();
  const [cls, setCls] = useState("All");
  const [month, setMonth] = useState("2025-08");

  const rows = useMemo(
    () =>
      students
        .filter((s: any) => cls === "All" || s.className === cls)
        .map((s: any) => {
          const recs = attendance.filter((a: any) => a.studentId === s.id && String(a.date).startsWith(month));
          const present = recs.filter((r: any) => r.status === "Present").length;
          const late = recs.filter((r: any) => r.status === "Late").length;
          const leave = recs.filter((r: any) => r.status === "Leave").length;
          const absent = recs.filter((r: any) => r.status === "Absent").length;
          return {
            id: s.id,
            name: s.name,
            admissionNo: s.admissionNo,
            className: `${s.className}-${s.section}`,
            days: recs.length,
            present, late, leave, absent,
            pct: recs.length ? Math.round(((present + late) / recs.length) * 100) : 0,
          };
        }),
    [students, attendance, cls, month],
  );

  return (
    <div>
      <PageHeader title="Monthly Attendance" subtitle={`Attendance summary for ${month}`} />
      <DataTable
        exportName={`monthly-attendance-${month}`}
        rows={rows}
        searchKeys={["name", "admissionNo", "className"]}
        filters={
          <>
            <input type="month" className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={month} onChange={(e) => setMonth(e.target.value)} />
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={cls} onChange={(e) => setCls(e.target.value)}>
              {["All", ...classes].map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        }
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "days", label: "Days" },
          { key: "present", label: "Present" },
          { key: "absent", label: "Absent" },
          { key: "late", label: "Late" },
          { key: "leave", label: "Leave" },
          { key: "pct", label: "Attendance %", render: (r) => <Badge tone={r.pct >= 75 ? "green" : "red"}>{r.pct}%</Badge> },
        ]}
      />
    </div>
  );
}

export function StudentAttendanceReport() {
  const { students, attendance } = useApp();
  const [id, setId] = useState(students[0]?.id || "");
  const student = students.find((s: any) => s.id === id);
  const summary = attendanceSummary(attendance, id);

  return (
    <div>
      <PageHeader title="Student Attendance Report" subtitle="Day-wise attendance for one student" />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Student"
            value={id}
            onChange={setId}
            options={students.map((s: any) => ({ value: s.id, label: `${s.name} — ${s.className}-${s.section}` }))}
          />
        </div>
      </Panel>
      {!student ? (
        <div className="mt-6"><EmptyState message="No students available." /></div>
      ) : (
        <>
          <div className="my-6 grid gap-4 sm:grid-cols-4">
            {[
              ["Total Days", summary.total],
              ["Present", summary.present],
              ["Absent", summary.absent],
              ["Attendance %", `${summary.pct}%`],
            ].map(([l, v]) => (
              <div key={String(l)} className="rounded-xl border border-border bg-card p-4">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{l}</p>
                <p className="mt-1 text-2xl font-bold">{v}</p>
              </div>
            ))}
          </div>
          <DataTable
            exportName={`attendance-${student.admissionNo}`}
            rows={summary.rows.map((r: any) => ({ ...r, dateLabel: fmtDate(r.date) }))}
            searchKeys={["date", "status"]}
            columns={[
              { key: "dateLabel", label: "Date" },
              { key: "status", label: "Status", render: (r) => <Badge tone={tone(r.status)}>{r.status}</Badge> },
            ]}
          />
        </>
      )}
    </div>
  );
}

export { MONTHS };
