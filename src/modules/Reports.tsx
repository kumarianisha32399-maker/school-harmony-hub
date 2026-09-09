import { useMemo, useState } from "react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader, SelectField, TextField } from "@/components/common/Ui";
import { Badge, feeSummary } from "@/modules/shared";
import { useResults } from "@/modules/Exams";
import { fmtDate, inr, invoiceTotal } from "@/utils/helpers";

function StatStrip({ items }: { items: { label: string; value: string }[] }) {
  return (
    <div className="mb-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {items.map((i) => (
        <div key={i.label} className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{i.label}</p>
          <p className="mt-1 text-xl font-bold">{i.value}</p>
        </div>
      ))}
    </div>
  );
}

export function StudentReport() {
  const { students, classes, sections } = useApp();
  const [className, setClassName] = useState("All");
  const [section, setSection] = useState("All");

  const rows = useMemo(
    () =>
      students.filter(
        (s: any) =>
          (className === "All" || s.className === className) &&
          (section === "All" || s.section === section),
      ),
    [students, className, section],
  );

  return (
    <div>
      <PageHeader title="Student Report" subtitle="Class-wise student list, printable and exportable." />
      <StatStrip
        items={[
          { label: "Students in view", value: String(rows.length) },
          { label: "Boys", value: String(rows.filter((s: any) => s.gender === "Male").length) },
          { label: "Girls", value: String(rows.filter((s: any) => s.gender === "Female").length) },
          { label: "Classes", value: String(new Set(rows.map((s: any) => s.className)).size) },
        ]}
      />
      <DataTable
        exportName="student-report"
        rows={rows}
        searchKeys={["name", "admissionNo", "father", "mobile"]}
        filters={
          <div className="flex flex-wrap gap-3">
            <div className="w-36">
              <SelectField label="Class" value={className} onChange={setClassName} options={["All", ...classes]} />
            </div>
            <div className="w-32">
              <SelectField label="Section" value={section} onChange={setSection} options={["All", ...sections]} />
            </div>
          </div>
        }
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "father", label: "Father" },
          { key: "className", label: "Class", render: (r) => `${r.className}-${r.section}` },
          { key: "rollNo", label: "Roll" },
          { key: "gender", label: "Gender" },
          { key: "mobile", label: "Mobile" },
          { key: "category", label: "Category" },
        ]}
      />
    </div>
  );
}

export function AttendanceReport() {
  const { students, attendance, classes } = useApp();
  const [className, setClassName] = useState("All");
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");

  const rows = useMemo(() => {
    const inRange = (d: string) => (!from || d >= from) && (!to || d <= to);
    return students
      .filter((s: any) => className === "All" || s.className === className)
      .map((s: any) => {
        const recs = attendance.filter((a: any) => a.studentId === s.id && inRange(a.date));
        const present = recs.filter((r: any) => r.status === "Present").length;
        const late = recs.filter((r: any) => r.status === "Late").length;
        const leave = recs.filter((r: any) => r.status === "Leave").length;
        const absent = recs.length - present - late - leave;
        return {
          id: s.id,
          name: s.name,
          admissionNo: s.admissionNo,
          className: `${s.className}-${s.section}`,
          days: recs.length,
          present,
          late,
          leave,
          absent,
          pct: recs.length ? Math.round(((present + late) / recs.length) * 100) : 0,
        };
      });
  }, [students, attendance, className, from, to]);

  const avg = rows.length ? Math.round(rows.reduce((a, b) => a + b.pct, 0) / rows.length) : 0;

  return (
    <div>
      <PageHeader title="Attendance Report" subtitle="Attendance percentage per student with date range filter." />
      <StatStrip
        items={[
          { label: "Students", value: String(rows.length) },
          { label: "Average attendance", value: `${avg}%` },
          { label: "Below 75%", value: String(rows.filter((r) => r.pct < 75).length) },
          { label: "Records counted", value: String(rows.reduce((a, b) => a + b.days, 0)) },
        ]}
      />
      <DataTable
        exportName="attendance-report"
        rows={rows}
        searchKeys={["name", "admissionNo"]}
        filters={
          <div className="flex flex-wrap gap-3">
            <div className="w-36">
              <SelectField label="Class" value={className} onChange={setClassName} options={["All", ...classes]} />
            </div>
            <div className="w-40">
              <TextField label="From" type="date" value={from} onChange={setFrom} />
            </div>
            <div className="w-40">
              <TextField label="To" type="date" value={to} onChange={setTo} />
            </div>
          </div>
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
          {
            key: "pct",
            label: "Attendance %",
            render: (r) => <Badge tone={r.pct >= 75 ? "green" : "red"}>{r.pct}%</Badge>,
          },
        ]}
      />
    </div>
  );
}

export function FeeReport() {
  const { students, invoices, payments, classes } = useApp();
  const [className, setClassName] = useState("All");
  const [status, setStatus] = useState("All");

  const rows = useMemo(
    () =>
      students
        .filter((s: any) => className === "All" || s.className === className)
        .map((s: any) => {
          const f = feeSummary(invoices, s.id);
          return {
            id: s.id,
            name: s.name,
            admissionNo: s.admissionNo,
            className: `${s.className}-${s.section}`,
            father: s.father,
            mobile: s.mobile,
            total: f.total,
            paid: f.paid,
            pending: f.pending,
            status: f.pending === 0 ? "Cleared" : f.paid === 0 ? "Unpaid" : "Partial",
          };
        })
        .filter((r) => status === "All" || r.status === status),
    [students, invoices, className, status],
  );

  const collected = payments.reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  const billed = invoices.reduce((a: number, b: any) => a + invoiceTotal(b), 0);

  return (
    <div>
      <PageHeader title="Fee Report" subtitle="Billed, collected and outstanding fees across the school." />
      <StatStrip
        items={[
          { label: "Total billed", value: inr(billed) },
          { label: "Total collected", value: inr(collected) },
          { label: "Outstanding", value: inr(rows.reduce((a, b) => a + b.pending, 0)) },
          { label: "Students in view", value: String(rows.length) },
        ]}
      />
      <DataTable
        exportName="fee-report"
        rows={rows}
        searchKeys={["name", "admissionNo", "father", "mobile"]}
        filters={
          <div className="flex flex-wrap gap-3">
            <div className="w-36">
              <SelectField label="Class" value={className} onChange={setClassName} options={["All", ...classes]} />
            </div>
            <div className="w-40">
              <SelectField
                label="Status"
                value={status}
                onChange={setStatus}
                options={["All", "Cleared", "Partial", "Unpaid"]}
              />
            </div>
          </div>
        }
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "total", label: "Total", render: (r) => inr(r.total) },
          { key: "paid", label: "Paid", render: (r) => inr(r.paid) },
          { key: "pending", label: "Pending", render: (r) => inr(r.pending) },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge tone={r.status === "Cleared" ? "green" : r.status === "Partial" ? "amber" : "red"}>
                {r.status}
              </Badge>
            ),
          },
        ]}
      />
    </div>
  );
}

export function ResultReport() {
  const { exams } = useApp();
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const { rows } = useResults(examId);

  const passed = rows.filter((r: any) => r.result === "PASS").length;

  return (
    <div>
      <PageHeader title="Result Report" subtitle="Exam-wise performance with grades, ranks and pass percentage." />
      <div className="mb-5 w-full sm:w-80">
        <SelectField
          label="Examination"
          value={examId}
          onChange={setExamId}
          options={exams.map((e: any) => ({ value: e.id, label: `${e.name} (${e.type})` }))}
        />
      </div>
      <StatStrip
        items={[
          { label: "Students appeared", value: String(rows.length) },
          { label: "Passed", value: String(passed) },
          { label: "Failed", value: String(rows.length - passed) },
          {
            label: "Pass percentage",
            value: rows.length ? `${Math.round((passed / rows.length) * 100)}%` : "—",
          },
        ]}
      />
      <DataTable
        exportName="result-report"
        rows={rows.map((r: any) => ({
          admissionNo: r.admissionNo,
          name: r.name,
          className: r.className,
          obtained: r.obtained,
          totalMax: r.totalMax,
          pct: r.pct,
          grade: r.grade,
          result: r.result,
          rank: r.rank,
        }))}
        searchKeys={["name", "admissionNo"]}
        columns={[
          { key: "rank", label: "Rank" },
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "obtained", label: "Obtained" },
          { key: "totalMax", label: "Max" },
          { key: "pct", label: "%" },
          { key: "grade", label: "Grade" },
          {
            key: "result",
            label: "Result",
            render: (r) => <Badge tone={r.result === "PASS" ? "green" : "red"}>{r.result}</Badge>,
          },
        ]}
      />
    </div>
  );
}

export function AdmissionReport() {
  const { admissions, classes } = useApp();
  const [className, setClassName] = useState("All");
  const [status, setStatus] = useState("All");

  const rows = useMemo(
    () =>
      admissions.filter(
        (a: any) =>
          (className === "All" || a.applyingClass === className) &&
          (status === "All" || a.status === status),
      ),
    [admissions, className, status],
  );

  return (
    <div>
      <PageHeader title="Admission Report" subtitle="Registration and admission enquiries with status." />
      <StatStrip
        items={[
          { label: "Applications", value: String(rows.length) },
          { label: "Approved", value: String(rows.filter((r: any) => r.status === "Approved").length) },
          { label: "Pending", value: String(rows.filter((r: any) => r.status === "Pending").length) },
          { label: "Fee collected", value: inr(rows.reduce((a: number, b: any) => a + Number(b.fee || 0), 0)) },
        ]}
      />
      <DataTable
        exportName="admission-report"
        rows={rows}
        searchKeys={["name", "regNo", "father", "mobile"]}
        filters={
          <div className="flex flex-wrap gap-3">
            <div className="w-36">
              <SelectField label="Class" value={className} onChange={setClassName} options={["All", ...classes]} />
            </div>
            <div className="w-40">
              <SelectField label="Status" value={status} onChange={setStatus} options={["All", "Approved", "Pending"]} />
            </div>
          </div>
        }
        columns={[
          { key: "regNo", label: "Reg. No" },
          { key: "name", label: "Applicant" },
          { key: "father", label: "Father" },
          { key: "applyingClass", label: "Class" },
          { key: "mobile", label: "Mobile" },
          { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
          {
            key: "status",
            label: "Status",
            render: (r) => <Badge tone={r.status === "Approved" ? "green" : "amber"}>{r.status}</Badge>,
          },
        ]}
      />
    </div>
  );
}

export function TeacherReport() {
  const { teachers } = useApp();

  const rows = teachers.map((t: any) => ({
    ...t,
    assigned: (t.assignments || []).length,
  }));

  return (
    <div>
      <PageHeader title="Teacher Report" subtitle="Staff strength, qualifications and class allocations." />
      <StatStrip
        items={[
          { label: "Teachers", value: String(rows.length) },
          { label: "Subjects covered", value: String(new Set(rows.map((t: any) => t.subject)).size) },
          {
            label: "Monthly salary outgo",
            value: inr(rows.reduce((a: number, b: any) => a + Number(b.salary || 0), 0)),
          },
          { label: "Class allocations", value: String(rows.reduce((a: number, b: any) => a + b.assigned, 0)) },
        ]}
      />
      <DataTable
        exportName="teacher-report"
        rows={rows}
        searchKeys={["name", "empId", "subject", "qualification"]}
        columns={[
          { key: "empId", label: "Emp ID" },
          { key: "name", label: "Teacher" },
          { key: "qualification", label: "Qualification" },
          { key: "subject", label: "Subject" },
          { key: "mobile", label: "Mobile" },
          { key: "joiningDate", label: "Joined", render: (r) => fmtDate(r.joiningDate) },
          { key: "salary", label: "Salary", render: (r) => inr(r.salary) },
          { key: "assigned", label: "Classes" },
        ]}
      />
    </div>
  );
}
