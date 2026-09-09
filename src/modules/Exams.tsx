import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Save, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState, FormModal, PageHeader, Panel, SelectField, TextField, useConfirm } from "@/components/common/Ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { A4Document, DocToolbar, SignRow } from "@/components/common/A4Document";
import { fmtDate, gradeFor, today } from "@/utils/helpers";
import { Badge, attendanceSummary } from "@/modules/shared";

const EXAM_TYPES = ["Unit Test", "Periodic Test", "Half Yearly", "Pre-Board", "Annual Examination", "Custom Examination"];

const BLANK = {
  name: "", type: "Unit Test", session: "2025-26", startDate: today(), endDate: today(),
  maxMarks: 100, passMarks: 33, status: "Scheduled",
};

function ExamFields({ form, set }: any) {
  return (
    <>
      <TextField label="Exam Name" value={form.name} onChange={(v) => set("name", v)} required />
      <SelectField label="Exam Type" value={form.type} onChange={(v) => set("type", v)} options={EXAM_TYPES} />
      <TextField label="Academic Session" value={form.session} onChange={(v) => set("session", v)} />
      <TextField label="Start Date" type="date" value={form.startDate} onChange={(v) => set("startDate", v)} />
      <TextField label="End Date" type="date" value={form.endDate} onChange={(v) => set("endDate", v)} />
      <TextField label="Maximum Marks" type="number" value={form.maxMarks} onChange={(v) => set("maxMarks", Number(v))} />
      <TextField label="Passing Marks" type="number" value={form.passMarks} onChange={(v) => set("passMarks", Number(v))} />
      <SelectField label="Status" value={form.status} onChange={(v) => set("status", v)} options={["Scheduled", "Ongoing", "Completed"]} />
    </>
  );
}

export function CreateExam() {
  const { add } = useApp();
  const [form, setForm] = useState<any>(BLANK);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return toast.error("Exam name is required.");
    add("exams", form, "exm");
    toast.success("Examination created.");
    setForm(BLANK);
  };

  return (
    <div>
      <PageHeader
        title="Create Examination"
        subtitle="Set up a new exam with maximum and passing marks"
        actions={
          <>
            <Button variant="outline" onClick={() => setForm(BLANK)}>Reset</Button>
            <Button onClick={save}><Plus className="size-4" /> Create Exam</Button>
          </>
        }
      />
      <Panel title="Examination details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <ExamFields form={form} set={set} />
        </div>
      </Panel>
    </div>
  );
}

export function ExamSchedule() {
  const { exams, update, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(BLANK);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  return (
    <div>
      <PageHeader title="Exam Schedule" subtitle={`${exams.length} examinations this session`} />
      <DataTable
        exportName="exams"
        rows={exams}
        searchKeys={["name", "type", "status"]}
        columns={[
          { key: "name", label: "Examination" },
          { key: "type", label: "Type" },
          { key: "startDate", label: "Start", render: (r) => fmtDate(r.startDate) },
          { key: "endDate", label: "End", render: (r) => fmtDate(r.endDate) },
          { key: "maxMarks", label: "Max" },
          { key: "passMarks", label: "Pass" },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Completed" ? "green" : "amber"}>{r.status}</Badge> },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { setForm(r); setOpen(true); }}>Edit</Button>
                <Button size="sm" variant="ghost" onClick={() => confirm(`Delete ${r.name}?`, () => { remove("exams", r.id); toast.success("Exam deleted."); })}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />
      <FormModal open={open} onOpenChange={setOpen} title="Edit Examination" onSubmit={() => { update("exams", form.id, form); toast.success("Exam updated."); setOpen(false); }}>
        <ExamFields form={form} set={set} />
      </FormModal>
      {dialog}
    </div>
  );
}

export function EnterMarks() {
  const { exams, students, subjects, marks, classes, sections, replace } = useApp();
  const [examId, setExamId] = useState(exams[0]?.id || "");
  const [cls, setCls] = useState(classes[7] || classes[0]);
  const [sec, setSec] = useState(sections[0]);
  const [draft, setDraft] = useState<Record<string, number>>({});

  const exam = exams.find((e: any) => e.id === examId);
  const list = useMemo(
    () => students.filter((s: any) => s.className === cls && s.section === sec),
    [students, cls, sec],
  );

  const key = (sid: string, subId: string) => `${sid}|${subId}`;
  const valueOf = (sid: string, subId: string) => {
    const k = key(sid, subId);
    if (k in draft) return draft[k];
    return marks.find((m: any) => m.examId === examId && m.studentId === sid && m.subjectId === subId)?.marks ?? "";
  };

  const save = () => {
    if (!exam) return toast.error("Select an examination first.");
    const max = Number(exam.maxMarks || 100);
    const rest = marks.filter(
      (m: any) => !(m.examId === examId && list.some((s: any) => s.id === m.studentId)),
    );
    const rows: any[] = [];
    list.forEach((s: any) => {
      subjects.forEach((sub: any) => {
        const raw = valueOf(s.id, sub.id);
        if (raw === "" || raw === null || Number.isNaN(Number(raw))) return;
        rows.push({
          id: `mrk-${examId}-${s.id}-${sub.id}`,
          examId, studentId: s.id, subjectId: sub.id,
          maxMarks: max,
          marks: Math.min(max, Math.max(0, Number(raw))),
        });
      });
    });
    replace("marks", [...rest, ...rows]);
    setDraft({});
    toast.success(`Marks saved for ${list.length} students.`);
  };

  return (
    <div>
      <PageHeader
        title="Enter Marks"
        subtitle={exam ? `${exam.name} • max ${exam.maxMarks} • pass ${exam.passMarks}` : "Select an examination"}
        actions={<Button onClick={save}><Save className="size-4" /> Save Marks</Button>}
      />
      <Panel title="Selection">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Examination" value={examId} onChange={setExamId} options={exams.map((e: any) => ({ value: e.id, label: e.name }))} />
          <SelectField label="Class" value={cls} onChange={setCls} options={classes} />
          <SelectField label="Section" value={sec} onChange={setSec} options={sections} />
        </div>
      </Panel>
      <div className="mt-6 overflow-x-auto rounded-xl border border-border bg-card">
        {!list.length ? (
          <div className="p-6"><EmptyState message="No students in this class and section." /></div>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead className="bg-muted/60">
              <tr>
                <th className="p-3 text-left font-semibold">Student</th>
                {subjects.map((s: any) => <th key={s.id} className="p-3 text-left font-semibold">{s.name}</th>)}
                <th className="p-3 text-left font-semibold">Total</th>
              </tr>
            </thead>
            <tbody>
              {list.map((s: any) => {
                const total = subjects.reduce((a: number, sub: any) => a + (Number(valueOf(s.id, sub.id)) || 0), 0);
                return (
                  <tr key={s.id} className="border-t border-border">
                    <td className="p-3">
                      <p className="font-medium">{s.name}</p>
                      <p className="text-xs text-muted-foreground">Roll {s.rollNo}</p>
                    </td>
                    {subjects.map((sub: any) => (
                      <td key={sub.id} className="p-2">
                        <Input
                          type="number"
                          className="h-9 w-20"
                          value={valueOf(s.id, sub.id)}
                          onChange={(e) => setDraft((d) => ({ ...d, [key(s.id, sub.id)]: Number(e.target.value) }))}
                        />
                      </td>
                    ))}
                    <td className="p-3 font-semibold">{total}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

/** Result rows for one exam, with rank. */
export function useResults(examId: string) {
  const { students, subjects, marks, exams } = useApp();
  return useMemo(() => {
    const exam = exams.find((e: any) => e.id === examId);
    const max = Number(exam?.maxMarks || 100);
    const pass = Number(exam?.passMarks || 33);
    const rows = students
      .map((s: any) => {
        const per = subjects.map((sub: any) => {
          const m = marks.find((x: any) => x.examId === examId && x.studentId === s.id && x.subjectId === sub.id);
          return { subject: sub.name, subjectId: sub.id, max, marks: m ? Number(m.marks) : null };
        });
        const attempted = per.filter((p) => p.marks !== null);
        const obtained = attempted.reduce((a, b) => a + (b.marks || 0), 0);
        const totalMax = attempted.length * max;
        const pct = totalMax ? Math.round((obtained / totalMax) * 1000) / 10 : 0;
        const failed = attempted.some((p) => (p.marks || 0) < pass);
        return {
          id: s.id, student: s, name: s.name, admissionNo: s.admissionNo,
          className: `${s.className}-${s.section}`, rollNo: s.rollNo,
          per, obtained, totalMax, pct,
          grade: gradeFor(pct),
          result: !attempted.length ? "—" : failed ? "FAIL" : "PASS",
          hasMarks: attempted.length > 0,
          rank: 0,
        };
      })
      .filter((r) => r.hasMarks);
    const ranked = [...rows].sort((a, b) => b.obtained - a.obtained);
    ranked.forEach((r: any, i) => { r.rank = i + 1; });
    return { rows, exam, pass, max };
  }, [students, subjects, marks, exams, examId]);
}

export function MarksList() {
  const { exams } = useApp();
  const [examId, setExamId] = useState(exams.find((e: any) => e.status === "Completed")?.id || exams[0]?.id || "");
  const { rows, exam } = useResults(examId);

  return (
    <div>
      <PageHeader title="Marks List" subtitle={exam ? exam.name : "Select an examination"} />
      <DataTable
        exportName="marks-list"
        rows={rows}
        searchKeys={["name", "admissionNo", "className"]}
        filters={
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={examId} onChange={(e) => setExamId(e.target.value)}>
            {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        }
        emptyMessage="No marks entered for this examination yet."
        columns={[
          { key: "rank", label: "Rank" },
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "obtained", label: "Obtained" },
          { key: "totalMax", label: "Total" },
          { key: "pct", label: "Percent", render: (r) => `${r.pct}%` },
          { key: "grade", label: "Grade" },
          { key: "result", label: "Result", render: (r) => <Badge tone={r.result === "PASS" ? "green" : "red"}>{r.result}</Badge> },
        ]}
      />
    </div>
  );
}

export function ReportCard() {
  const { exams, students, attendance, settings } = useApp();
  const [examId, setExamId] = useState(exams.find((e: any) => e.status === "Completed")?.id || exams[0]?.id || "");
  const { rows, exam, pass } = useResults(examId);
  const [studentId, setStudentId] = useState(rows[0]?.id || "");
  const row = rows.find((r: any) => r.id === studentId) || rows[0];
  const s = row?.student;
  const att = attendanceSummary(attendance, row?.id || "");

  return (
    <div>
      <PageHeader title="Report Card / Marksheet" subtitle="Print-ready A4 report card with automatic grades" />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField label="Examination" value={examId} onChange={setExamId} options={exams.map((e: any) => ({ value: e.id, label: e.name }))} />
          <SelectField
            label="Student"
            value={row?.id || ""}
            onChange={setStudentId}
            options={rows.map((r: any) => ({ value: r.id, label: `${r.name} — ${r.className}` }))}
          />
        </div>
      </Panel>

      {!row || !s ? (
        <div className="mt-6"><EmptyState message="No marks available. Enter marks for this examination first." /></div>
      ) : (
        <div className="mt-6">
          <DocToolbar docId="doc-reportcard" />
          <A4Document id="doc-reportcard" title={`Report Card — ${exam?.name}`}>
            <p className="mb-3 text-center text-[11px] font-semibold">Academic Session {settings.session}</p>
            <div className="flex gap-4">
              <div className="flex-1 text-[11px]">
                {[
                  ["Student Name", s.name],
                  ["Father's Name", s.father],
                  ["Mother's Name", s.mother],
                  ["Admission No", s.admissionNo],
                  ["Class / Section", `${s.className} - ${s.section}`],
                  ["Roll Number", s.rollNo],
                  ["Date of Birth", fmtDate(s.dob)],
                ].map(([l, v]) => (
                  <div key={String(l)} className="flex border-b border-dotted border-slate-400 py-0.5">
                    <span className="w-36 font-semibold">{l}</span>
                    <span>{v as any}</span>
                  </div>
                ))}
              </div>
              <div className="flex size-[100px] shrink-0 items-center justify-center border border-slate-800 text-[10px]">
                {s.photo ? <img src={s.photo} alt={s.name} className="size-full object-cover" /> : "PHOTO"}
              </div>
            </div>

            <table className="mt-4 w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-500 p-1 text-left">Subject</th>
                  <th className="border border-slate-500 p-1">Max Marks</th>
                  <th className="border border-slate-500 p-1">Marks Obtained</th>
                  <th className="border border-slate-500 p-1">Grade</th>
                </tr>
              </thead>
              <tbody>
                {row.per.filter((p: any) => p.marks !== null).map((p: any) => (
                  <tr key={p.subjectId}>
                    <td className="border border-slate-500 p-1">{p.subject}</td>
                    <td className="border border-slate-500 p-1 text-center">{p.max}</td>
                    <td className="border border-slate-500 p-1 text-center">{p.marks}</td>
                    <td className="border border-slate-500 p-1 text-center">{gradeFor((p.marks / p.max) * 100)}</td>
                  </tr>
                ))}
                <tr className="font-bold">
                  <td className="border border-slate-500 p-1">Total</td>
                  <td className="border border-slate-500 p-1 text-center">{row.totalMax}</td>
                  <td className="border border-slate-500 p-1 text-center">{row.obtained}</td>
                  <td className="border border-slate-500 p-1 text-center">{row.grade}</td>
                </tr>
              </tbody>
            </table>

            <div className="mt-3 grid grid-cols-4 gap-2 text-center text-[11px]">
              {[
                ["Percentage", `${row.pct}%`],
                ["Grade", row.grade],
                ["Result", row.result],
                ["Position", `#${row.rank}`],
              ].map(([l, v]) => (
                <div key={String(l)} className="border border-slate-500 p-2">
                  <p className="font-semibold uppercase">{l}</p>
                  <p className="text-sm font-bold">{v as any}</p>
                </div>
              ))}
            </div>

            <p className="mt-3 text-[11px]">
              <b>Attendance:</b> {att.present} of {att.total} days ({att.pct}%) • <b>Passing marks:</b> {pass}
            </p>
            <p className="mt-3 text-[11px]"><b>Class Teacher Remarks:</b> {row.pct >= 75 ? "Excellent performance, keep it up." : row.pct >= 50 ? "Good effort, needs consistency." : "Requires more attention and regular practice."}</p>
            <p className="mt-1 text-[11px]"><b>Principal Remarks:</b> Promoted with encouragement for the next session.</p>

            <SignRow items={["Class Teacher", "Principal", "Parent", "School Stamp"]} />
          </A4Document>
        </div>
      )}
    </div>
  );
}

export function ClassResult() {
  const { exams, classes } = useApp();
  const [examId, setExamId] = useState(exams.find((e: any) => e.status === "Completed")?.id || exams[0]?.id || "");
  const [cls, setCls] = useState("All");
  const { rows, exam } = useResults(examId);
  const filtered = rows.filter((r: any) => cls === "All" || r.student.className === cls);
  const avg = filtered.length ? Math.round((filtered.reduce((a: number, b: any) => a + b.pct, 0) / filtered.length) * 10) / 10 : 0;
  const passed = filtered.filter((r: any) => r.result === "PASS").length;

  return (
    <div>
      <PageHeader
        title="Class Result"
        subtitle={exam ? `${exam.name} • average ${avg}% • ${passed}/${filtered.length} passed` : "Select an examination"}
      />
      <DataTable
        exportName="class-result"
        rows={filtered}
        searchKeys={["name", "admissionNo", "className"]}
        filters={
          <>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={examId} onChange={(e) => setExamId(e.target.value)}>
              {exams.map((e: any) => <option key={e.id} value={e.id}>{e.name}</option>)}
            </select>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={cls} onChange={(e) => setCls(e.target.value)}>
              {["All", ...classes].map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        }
        emptyMessage="No results for this selection."
        columns={[
          { key: "rank", label: "Rank" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "obtained", label: "Obtained" },
          { key: "pct", label: "Percent", render: (r) => `${r.pct}%` },
          { key: "grade", label: "Grade" },
          { key: "result", label: "Result", render: (r) => <Badge tone={r.result === "PASS" ? "green" : "red"}>{r.result}</Badge> },
        ]}
      />
    </div>
  );
}

export function StudentResult() {
  const { exams, students, attendance, settings } = useApp();
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const { marks, subjects } = useApp();
  const s = students.find((x: any) => x.id === studentId);
  const att = attendanceSummary(attendance, studentId);

  const rows = useMemo(() => {
    return exams
      .map((e: any) => {
        const max = Number(e.maxMarks || 100);
        const pass = Number(e.passMarks || 33);
        const mine = subjects
          .map((sub: any) => marks.find((m: any) => m.examId === e.id && m.studentId === studentId && m.subjectId === sub.id))
          .filter(Boolean) as any[];
        if (!mine.length) return null;
        const obtained = mine.reduce((a, b) => a + Number(b.marks || 0), 0);
        const totalMax = mine.length * max;
        const pct = Math.round((obtained / totalMax) * 1000) / 10;
        return {
          id: e.id, exam: e.name, type: e.type, totalMax, obtained, pct,
          grade: gradeFor(pct),
          result: mine.some((m) => Number(m.marks) < pass) ? "FAIL" : "PASS",
        };
      })
      .filter(Boolean) as any[];
  }, [exams, subjects, marks, studentId]);

  const overall = rows.length
    ? Math.round((rows.reduce((a, b) => a + b.pct, 0) / rows.length) * 10) / 10
    : 0;

  return (
    <div>
      <PageHeader title="Student Result" subtitle="All examination results for one student, session-wide." />
      <Panel>
        <SelectField
          label="Student"
          value={studentId}
          onChange={setStudentId}
          options={students.map((x: any) => ({ value: x.id, label: `${x.name} — ${x.className}-${x.section}` }))}
        />
      </Panel>

      {!s || !rows.length ? (
        <div className="mt-6"><EmptyState message="No marks recorded for this student yet." /></div>
      ) : (
        <div className="mt-6">
          <DocToolbar docId="doc-student-result" fileName={`result-${s.admissionNo}`} />
          <A4Document id="doc-student-result" title="Consolidated Result">
            <p className="mb-3 text-center text-[11px] font-semibold">Academic Session {settings['session']}</p>
            <div className="text-[11px]">
              {[
                ["Student Name", s.name],
                ["Father's Name", s.father],
                ["Admission No", s.admissionNo],
                ["Class / Section", `${s.className} - ${s.section}`],
                ["Roll Number", s.rollNo],
                    ["Attendance", `${att.present}/${att.total} (${att.pct}%)`],
              ].map(([l, v]) => (
                <div key={String(l)} className="flex border-b border-dotted border-slate-400 py-0.5">
                  <span className="w-36 font-semibold">{l}</span>
                  <span>{v as any}</span>
                </div>
              ))}
            </div>
            <table className="mt-4 w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-500 p-1 text-left">Examination</th>
                  <th className="border border-slate-500 p-1">Type</th>
                  <th className="border border-slate-500 p-1">Max</th>
                  <th className="border border-slate-500 p-1">Obtained</th>
                  <th className="border border-slate-500 p-1">%</th>
                  <th className="border border-slate-500 p-1">Grade</th>
                  <th className="border border-slate-500 p-1">Result</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id}>
                    <td className="border border-slate-500 p-1">{r.exam}</td>
                    <td className="border border-slate-500 p-1 text-center">{r.type}</td>
                    <td className="border border-slate-500 p-1 text-center">{r.totalMax}</td>
                    <td className="border border-slate-500 p-1 text-center">{r.obtained}</td>
                    <td className="border border-slate-500 p-1 text-center">{r.pct}</td>
                    <td className="border border-slate-500 p-1 text-center">{r.grade}</td>
                    <td className="border border-slate-500 p-1 text-center font-semibold">{r.result}</td>
                  </tr>
                ))}
                <tr className="bg-slate-100 font-bold">
                  <td className="border border-slate-500 p-1" colSpan={4}>Overall Percentage</td>
                  <td className="border border-slate-500 p-1 text-center">{overall}</td>
                  <td className="border border-slate-500 p-1 text-center">{gradeFor(overall)}</td>
                  <td className="border border-slate-500 p-1 text-center">
                    {rows.some((r) => r.result === "FAIL") ? "FAIL" : "PASS"}
                  </td>
                </tr>
              </tbody>
            </table>
            <SignRow items={["Class Teacher", "School Stamp", "Principal"]} />
          </A4Document>
        </div>
      )}
    </div>
  );
}
