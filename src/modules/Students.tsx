"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import {
  EmptyState, FormModal, PageHeader, Panel, SelectField, TextField, useConfirm,
} from "@/components/common/Ui";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { A4Document, DocToolbar, Field } from "@/components/common/A4Document";
import { fmtDate, initials, inr, invoiceTotal, qrMatrix, today } from "@/utils/helpers";
import { BLOOD, CATEGORY } from "@/data/seed";
import { Badge, attendanceSummary, feeSummary, useGoto } from "@/modules/shared";

const BLANK = {
  admissionNo: "", name: "", father: "", mother: "", dob: "", gender: "Male",
  mobile: "", email: "", address: "", city: "Indore", state: "Madhya Pradesh", pin: "",
  className: "V", section: "A", rollNo: 1, admissionDate: today(), session: "2025-26",
  category: "General", bloodGroup: "O+", photo: "", guardian: "", occupation: "",
  previousSchool: "", status: "Active",
};

import { ImageUpload } from "@/components/common/ImageUpload";

function StudentFormFields({ form, set, classes, sections }: any) {
  return (
    <>
      <TextField label="Admission Number" value={form.admissionNo} onChange={(v) => set("admissionNo", v)} required />
      <TextField label="Student Name" value={form.name} onChange={(v) => set("name", v)} required />
      <TextField label="Father's Name" value={form.father} onChange={(v) => set("father", v)} />
      <TextField label="Mother's Name" value={form.mother} onChange={(v) => set("mother", v)} />
      <TextField label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
      <SelectField label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={["Male", "Female", "Other"]} />
      <TextField label="Mobile Number" value={form.mobile} onChange={(v) => set("mobile", v)} />
      <TextField label="Email" value={form.email} onChange={(v) => set("email", v)} />
      <TextField label="Address" value={form.address} onChange={(v) => set("address", v)} />
      <TextField label="City" value={form.city} onChange={(v) => set("city", v)} />
      <TextField label="State" value={form.state} onChange={(v) => set("state", v)} />
      <TextField label="PIN Code" value={form.pin} onChange={(v) => set("pin", v)} />
      <SelectField label="Class" value={form.className} onChange={(v) => set("className", v)} options={classes} />
      <SelectField label="Section" value={form.section} onChange={(v) => set("section", v)} options={sections} />
      <TextField label="Roll Number" type="number" value={form.rollNo} onChange={(v) => set("rollNo", Number(v))} />
      <TextField label="Admission Date" type="date" value={form.admissionDate} onChange={(v) => set("admissionDate", v)} />
      <SelectField label="Category" value={form.category} onChange={(v) => set("category", v)} options={CATEGORY} />
      <SelectField label="Blood Group" value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)} options={BLOOD} />
      <TextField label="Guardian Name" value={form.guardian} onChange={(v) => set("guardian", v)} />
      <TextField label="Guardian Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
      <TextField label="Previous School" value={form.previousSchool} onChange={(v) => set("previousSchool", v)} />
      <SelectField label="Status" value={form.status} onChange={(v) => set("status", v)} options={["Active", "Inactive", "Transferred"]} />
      <div className="sm:col-span-2 lg:col-span-3">
        <ImageUpload
          label="Student Photo (Cloudinary Upload)"
          value={form.photo}
          onChange={(url) => set("photo", url)}
          folder="students"
        />
      </div>
    </>
  );
}

export function StudentList() {
  const { students, classes, sections, add, update, remove, invoices } = useApp();
  const goto = useGoto();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(BLANK);
  const [cls, setCls] = useState("All");
  const [sec, setSec] = useState("All");
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const rows = useMemo(
    () =>
      students.filter(
        (s: any) => (cls === "All" || s.className === cls) && (sec === "All" || s.section === sec),
      ),
    [students, cls, sec],
  );

  const openAdd = () => {
    setEditId(null);
    setForm({ ...BLANK, admissionNo: `ADM${2025100 + students.length + 1}` });
    setOpen(true);
  };
  const openEdit = (row: any) => {
    setEditId(row.id);
    setForm(row);
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim() || !form.admissionNo.trim()) {
      toast.error("Student name and admission number are required.");
      return;
    }
    if (editId) {
      update("students", editId, form);
      toast.success("Student updated.");
    } else {
      add("students", form, "stu");
      toast.success("Student added.");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Student List"
        subtitle={`${rows.length} of ${students.length} students`}
        actions={<Button onClick={openAdd}><Plus className="size-4" /> Add Student</Button>}
      />
      <DataTable
        exportName="students"
        rows={rows}
        searchKeys={["name", "admissionNo", "father", "mobile", "className"]}
        filters={
          <>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={cls} onChange={(e) => setCls(e.target.value)}>
              {["All", ...classes].map((c) => <option key={c}>{c}</option>)}
            </select>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={sec} onChange={(e) => setSec(e.target.value)}>
              {["All", ...sections].map((c) => <option key={c}>{c}</option>)}
            </select>
          </>
        }
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          {
            key: "name",
            label: "Student",
            render: (r) => (
              <div className="flex items-center gap-2">
                <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary">
                  {initials(r.name)}
                </span>
                <span>
                  <span className="block font-medium">{r.name}</span>
                  <span className="block text-xs text-muted-foreground">{r.father}</span>
                </span>
              </div>
            ),
          },
          { key: "className", label: "Class", render: (r) => `${r.className}-${r.section}` },
          { key: "rollNo", label: "Roll" },
          { key: "mobile", label: "Mobile" },
          {
            key: "pending",
            label: "Dues",
            render: (r) => {
              const { pending } = feeSummary(invoices, r.id);
              return pending > 0 ? <Badge tone="red">{inr(pending)}</Badge> : <Badge tone="green">Clear</Badge>;
            },
          },
          { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Active" ? "green" : "amber"}>{r.status}</Badge> },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (r) => (
              <div className="flex gap-1">
                <Button size="icon" variant="ghost" onClick={() => goto(`students/profile/${r.id}`)} aria-label="View"><Eye className="size-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => openEdit(r)} aria-label="Edit"><Pencil className="size-4" /></Button>
                <Button size="icon" variant="ghost" onClick={() => confirm(`Delete ${r.name}?`, () => { remove("students", r.id); toast.success("Student deleted."); })} aria-label="Delete"><Trash2 className="size-4 text-destructive" /></Button>
              </div>
            ),
          },
        ]}
      />
      <FormModal open={open} onOpenChange={setOpen} title={editId ? "Edit Student" : "Add Student"} onSubmit={save}>
        <StudentFormFields form={form} set={set} classes={classes} sections={sections} />
      </FormModal>
      {dialog}
    </div>
  );
}

export function AddStudent() {
  const { classes, sections, students, add } = useApp();
  const goto = useGoto();
  const [form, setForm] = useState<any>({ ...BLANK, admissionNo: `ADM${2025100 + students.length + 1}` });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const save = async () => {
    if (!form.name.trim()) {
      toast.error("Student name is required.");
      return;
    }
    const created = await add("students", form, "stu");
    toast.success("Student admitted successfully.");
    const targetId = created?.id || (created as any)?._id;
    if (targetId) {
      goto(`students/profile/${targetId}`);
    } else {
      goto("students");
    }
  };
  return (
    <div>
      <PageHeader title="Add Student" subtitle="Register a new student into the current academic session." />
      <Panel title="Student Details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StudentFormFields form={form} set={set} classes={classes} sections={sections} />
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={save}>Save Student</Button>
          <Button variant="outline" onClick={() => setForm(BLANK)}>Reset</Button>
          <Button variant="ghost" onClick={() => goto("students")}>Cancel</Button>
        </div>
      </Panel>
    </div>
  );
}

export function StudentProfile({ id }: { id: string }) {
  const { students, invoices, payments, attendance, marks, exams, subjects } = useApp();
  const goto = useGoto();
  const student = students.find((s: any) => s.id === id);
  if (!student) return <EmptyState message="Student not found." />;

  const fees = feeSummary(invoices, id);
  const att = attendanceSummary(attendance, id);
  const myPayments = payments.filter((p: any) => p.studentId === id);
  const myMarks = marks.filter((m: any) => m.studentId === id);

  return (
    <div>
      <PageHeader
        title={student.name}
        subtitle={`${student.admissionNo} • Class ${student.className}-${student.section} • Roll ${student.rollNo}`}
        actions={
          <>
            <Button variant="outline" onClick={() => goto("students/id-card")}>ID Card</Button>
            <Button variant="outline" onClick={() => goto("exams/report-card")}>Report Card</Button>
            <Button onClick={() => goto("fees/collect")}>Collect Fee</Button>
          </>
        }
      />
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <Panel title="Attendance"><p className="text-2xl font-bold">{att.pct}%</p><p className="text-xs text-muted-foreground">{att.present} of {att.total} days</p></Panel>
        <Panel title="Fees Paid"><p className="text-2xl font-bold">{inr(fees.paid)}</p><p className="text-xs text-muted-foreground">of {inr(fees.total)} billed</p></Panel>
        <Panel title="Pending"><p className="text-2xl font-bold text-destructive">{inr(fees.pending)}</p><p className="text-xs text-muted-foreground">{fees.rows.filter((r) => r.status !== "Paid").length} open invoices</p></Panel>
      </div>

      <Tabs defaultValue="personal">
        <TabsList className="flex w-full flex-wrap justify-start">
          {["personal", "parents", "attendance", "fees", "results", "payments"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal">
          <Panel>
            <div className="grid gap-x-8 sm:grid-cols-2">
              <Field label="Admission Number" value={student.admissionNo} />
              <Field label="Date of Birth" value={fmtDate(student.dob)} />
              <Field label="Gender" value={student.gender} />
              <Field label="Blood Group" value={student.bloodGroup} />
              <Field label="Category" value={student.category} />
              <Field label="Admission Date" value={fmtDate(student.admissionDate)} />
              <Field label="Mobile" value={student.mobile} />
              <Field label="Email" value={student.email} />
              <Field label="Address" value={`${student.address}, ${student.city}, ${student.state} ${student.pin}`} />
              <Field label="Previous School" value={student.previousSchool} />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="parents">
          <Panel>
            <div className="grid gap-x-8 sm:grid-cols-2">
              <Field label="Father's Name" value={student.father} />
              <Field label="Mother's Name" value={student.mother} />
              <Field label="Guardian" value={student.guardian} />
              <Field label="Occupation" value={student.occupation} />
              <Field label="Contact" value={student.mobile} />
              <Field label="Email" value={student.email} />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="attendance">
          <DataTable exportName="attendance" rows={att.rows} pageSize={8}
            columns={[
              { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Present" ? "green" : r.status === "Absent" ? "red" : "amber"}>{r.status}</Badge> },
            ]}
          />
        </TabsContent>

        <TabsContent value="fees">
          <DataTable exportName="fees" rows={fees.rows} pageSize={8}
            columns={[
              { key: "month", label: "Month" },
              { key: "total", label: "Total", render: (r) => inr(invoiceTotal(r)) },
              { key: "paid", label: "Paid", render: (r) => inr(r.paid) },
              { key: "balance", label: "Balance", render: (r) => inr(invoiceTotal(r) - r.paid) },
              { key: "status", label: "Status", render: (r) => <Badge tone={r.status === "Paid" ? "green" : "red"}>{r.status}</Badge> },
            ]}
          />
        </TabsContent>

        <TabsContent value="results">
          <DataTable exportName="results" rows={myMarks} pageSize={10}
            columns={[
              { key: "examId", label: "Exam", render: (r) => exams.find((e: any) => e.id === r.examId)?.name || r.examId },
              { key: "subjectId", label: "Subject", render: (r) => subjects.find((s: any) => s.id === r.subjectId)?.name || r.subjectId },
              { key: "maxMarks", label: "Max" },
              { key: "marks", label: "Obtained" },
            ]}
          />
        </TabsContent>

        <TabsContent value="payments">
          <DataTable exportName="payments" rows={myPayments} pageSize={8}
            columns={[
              { key: "receiptNo", label: "Receipt" },
              { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
              { key: "amount", label: "Amount", render: (r) => inr(r.amount) },
              { key: "mode", label: "Mode" },
              { key: "receivedBy", label: "Received By" },
            ]}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}

export function PromoteStudent() {
  const { students, classes, sections, update } = useApp();
  const [from, setFrom] = useState(classes[0] || "V");
  const [to, setTo] = useState(classes[1] || "VI");
  const [section, setSection] = useState("A");
  const [picked, setPicked] = useState<string[]>([]);
  const list = students.filter((s: any) => s.className === from);

  const promote = () => {
    if (!picked.length) {
      toast.error("Select at least one student.");
      return;
    }
    picked.forEach((id) => update("students", id, { className: to, section }));
    toast.success(`${picked.length} student(s) promoted to ${to}-${section}.`);
    setPicked([]);
  };

  return (
    <div>
      <PageHeader title="Promote Student" subtitle="Move students to the next class for the new session." />
      <Panel title="Promotion Settings">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="From Class" value={from} onChange={setFrom} options={classes} />
          <SelectField label="To Class" value={to} onChange={setTo} options={classes} />
          <SelectField label="To Section" value={section} onChange={setSection} options={sections} />
        </div>
      </Panel>
      <div className="mt-6">
        <DataTable exportName="promote" rows={list} searchKeys={["name", "admissionNo"]}
          toolbar={<Button onClick={promote}>Promote Selected ({picked.length})</Button>}
          columns={[
            {
              key: "pick", label: "", sortable: false,
              render: (r) => (
                <input type="checkbox" checked={picked.includes(r.id)}
                  onChange={(e) => setPicked((p) => (e.target.checked ? [...p, r.id] : p.filter((x) => x !== r.id)))} />
              ),
            },
            { key: "admissionNo", label: "Adm. No" },
            { key: "name", label: "Student" },
            { key: "section", label: "Section" },
            { key: "rollNo", label: "Roll" },
          ]}
        />
      </div>
    </div>
  );
}

export function TransferStudent() {
  const { students, update } = useApp();
  const { confirm, dialog } = useConfirm();
  const active = students.filter((s: any) => s.status !== "Transferred");
  return (
    <div>
      <PageHeader title="Transfer Student" subtitle="Mark a student as transferred and issue a transfer certificate." />
      <DataTable exportName="transfer" rows={active} searchKeys={["name", "admissionNo", "className"]}
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class", render: (r) => `${r.className}-${r.section}` },
          { key: "father", label: "Father" },
          {
            key: "actions", label: "Action", sortable: false,
            render: (r) => (
              <Button size="sm" variant="outline"
                onClick={() => confirm(`Mark ${r.name} as transferred?`, () => {
                  update("students", r.id, { status: "Transferred" });
                  toast.success("Student marked as transferred.");
                })}>
                Transfer
              </Button>
            ),
          },
        ]}
      />
      {dialog}
    </div>
  );
}

function Qr({ text }: { text: string }) {
  const size = 21;
  const cells = qrMatrix(text, size);
  return (
    <div className="grid size-16 bg-white" style={{ gridTemplateColumns: `repeat(${size}, 1fr)` }}>
      {cells.map((on, i) => <div key={i} style={{ background: on ? "#0f172a" : "#fff" }} />)}
    </div>
  );
}

export function IdCard() {
  const { students, settings } = useApp();
  const [id, setId] = useState(students[0]?.id || "");
  const s = students.find((x: any) => x.id === id);

  return (
    <div>
      <PageHeader title="Student ID Card" subtitle="Generate a print-ready school identity card." />
      <Panel title="Select Student">
        <SelectField label="Student" value={id} onChange={setId}
          options={students.map((x: any) => ({ value: x.id, label: `${x.name} — ${x.className}-${x.section}` }))} />
      </Panel>
      {!s ? <div className="mt-6"><EmptyState message="Select a student to generate the ID card." /></div> : (
        <div className="mt-6">
          <DocToolbar docId="id-card-sheet" />
          <div id="id-card-sheet" className="a4-sheet mx-auto flex w-fit flex-wrap gap-6 bg-white p-6 shadow-lg">
            {/* Front */}
            <div className="w-[54mm] overflow-hidden rounded-xl border-2 border-slate-800">
              <div className="bg-slate-800 px-3 py-2 text-center text-white">
                <p className="text-[10px] font-black uppercase leading-tight">{settings.name}</p>
                <p className="text-[7px] leading-tight">{settings.address}</p>
              </div>
              <div className="flex flex-col items-center gap-1 p-3">
                <div className="flex size-16 items-center justify-center rounded-full border-2 border-slate-800 text-lg font-black">
                  {initials(s.name)}
                </div>
                <p className="text-[12px] font-bold uppercase">{s.name}</p>
                <p className="text-[9px]">S/D of {s.father}</p>
                <div className="mt-1 w-full space-y-0.5 text-[8px]">
                  {[["Adm. No", s.admissionNo], ["Class", `${s.className} - ${s.section}`], ["Roll No", s.rollNo],
                    ["DOB", fmtDate(s.dob)], ["Blood", s.bloodGroup], ["Contact", s.mobile]].map(([k, v]) => (
                    <div key={String(k)} className="flex justify-between border-b border-dotted border-slate-400">
                      <span className="font-semibold">{k}</span><span>{String(v)}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-slate-800 py-1 text-center text-[8px] font-semibold text-white">
                Session {settings.session}
              </div>
            </div>
            {/* Back */}
            <div className="flex w-[54mm] flex-col overflow-hidden rounded-xl border-2 border-slate-800">
              <div className="bg-slate-800 py-1 text-center text-[9px] font-bold uppercase text-white">Identity Details</div>
              <div className="flex-1 space-y-1 p-3 text-[8px]">
                <p><b>Address:</b> {s.address}, {s.city}</p>
                <p><b>Guardian:</b> {s.guardian}</p>
                <p><b>Emergency:</b> {s.mobile}</p>
                <p><b>School Code:</b> {settings.code}</p>
                <div className="flex items-center justify-between pt-2">
                  <Qr text={`${s.admissionNo}|${s.name}`} />
                  <div className="text-center">
                    <div className="h-6" />
                    <p className="border-t border-slate-800 pt-0.5 font-semibold">Principal</p>
                  </div>
                </div>
                <p className="pt-2 text-[7px] italic">If found, please return to the school office.</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
