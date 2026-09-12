"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/DataTable";
import { PageHeader, Panel, SelectField, TextField, FormModal, useConfirm } from "@/components/common/Ui";
import { A4Document, DocToolbar, Field, SignRow } from "@/components/common/A4Document";
import { Badge } from "@/modules/shared";
import { CLASSES, SECTIONS, SUBJECTS } from "@/data/seed";
import { fmtDate, inr, today } from "@/utils/helpers";

const emptyTeacher = {
  empId: "", name: "", father: "", dob: "", mobile: "", email: "", address: "",
  qualification: "", subject: SUBJECTS[0]?.name || "", classTeacherOf: "", joiningDate: today(), salary: 30000,
};

import { ImageUpload } from "@/components/common/ImageUpload";

function TeacherForm({ form, set }: { form: any; set: (k: string, v: any) => void }) {
  return (
    <>
      <TextField label="Employee ID" value={form.empId} onChange={(v) => set("empId", v)} required />
      <TextField label="Full Name" value={form.name} onChange={(v) => set("name", v)} required />
      <TextField label="Father's / Husband's Name" value={form.father} onChange={(v) => set("father", v)} />
      <TextField label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
      <TextField label="Mobile" value={form.mobile} onChange={(v) => set("mobile", v)} />
      <TextField label="Email" value={form.email} onChange={(v) => set("email", v)} />
      <TextField label="Address" value={form.address} onChange={(v) => set("address", v)} />
      <TextField label="Qualification" value={form.qualification} onChange={(v) => set("qualification", v)} />
      <SelectField
        label="Main Subject"
        value={form.subject}
        onChange={(v) => set("subject", v)}
        options={SUBJECTS.map((s) => s.name)}
      />
      <TextField label="Class Teacher Of" value={form.classTeacherOf} onChange={(v) => set("classTeacherOf", v)} />
      <TextField label="Joining Date" type="date" value={form.joiningDate} onChange={(v) => set("joiningDate", v)} />
      <TextField label="Monthly Salary" type="number" value={form.salary} onChange={(v) => set("salary", Number(v))} />
      <div className="sm:col-span-2">
        <ImageUpload
          label="Teacher Photo (Cloudinary)"
          value={form.photo}
          onChange={(url) => set("photo", url)}
          folder="teachers"
        />
      </div>
    </>
  );
}

function useTeacherEditor() {
  const { add, update } = useApp();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyTeacher);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const start = (row?: any) => {
    setForm(row ? { ...row } : { ...emptyTeacher, empId: `EMP-T${Math.floor(Math.random() * 900 + 100)}` });
    setOpen(true);
  };
  const save = () => {
    if (!form.name.trim()) return toast.error("Teacher name is required");
    if (form.id) {
      update("teachers", form.id, form);
      toast.success("Teacher updated");
    } else {
      add("teachers", form, "tch");
      toast.success("Teacher added");
    }
    setOpen(false);
  };
  const modal = (
    <FormModal open={open} onOpenChange={setOpen} title={form.id ? "Edit Teacher" : "Add Teacher"} onSubmit={save}>
      <TeacherForm form={form} set={set} />
    </FormModal>
  );
  return { start, modal };
}

export function AddTeacher() {
  const { add } = useApp();
  const [form, setForm] = useState<any>({
    ...emptyTeacher,
    empId: `EMP-T${Math.floor(Math.random() * 900 + 100)}`,
  });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));
  const save = () => {
    if (!form.name.trim()) return toast.error("Teacher name is required");
    add("teachers", form, "tch");
    toast.success("Teacher added successfully");
    setForm({ ...emptyTeacher, empId: `EMP-T${Math.floor(Math.random() * 900 + 100)}` });
  };
  return (
    <>
      <PageHeader title="Add Teacher" subtitle="Create a new teaching staff record." />
      <Panel title="Teacher details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <TeacherForm form={form} set={set} />
        </div>
        <div className="mt-5 flex gap-2">
          <Button onClick={save}>Save Teacher</Button>
          <Button variant="outline" onClick={() => setForm({ ...emptyTeacher })}>
            Reset
          </Button>
        </div>
      </Panel>
    </>
  );
}

export function TeacherList() {
  const { teachers, remove, timetable } = useApp();
  const { start, modal } = useTeacherEditor();
  const { confirm, dialog } = useConfirm();
  const [view, setView] = useState<any>(null);

  const columns = [
    { key: "empId", label: "Emp ID" },
    { key: "name", label: "Teacher" },
    { key: "subject", label: "Subject" },
    { key: "qualification", label: "Qualification" },
    { key: "mobile", label: "Mobile" },
    { key: "classTeacherOf", label: "Class Teacher" },
    { key: "salary", label: "Salary", render: (r: any) => inr(r.salary) },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r: any) => (
        <div className="flex gap-1">
          <Button size="icon" variant="ghost" onClick={() => setView(r)} aria-label="View">
            <Eye className="size-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => start(r)} aria-label="Edit">
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Delete"
            onClick={() =>
              confirm(`Delete teacher ${r.name}? This cannot be undone.`, () => {
                remove("teachers", r.id);
                toast.success("Teacher deleted");
              })
            }
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Teacher List"
        subtitle={`${teachers.length} teaching staff members`}
        actions={
          <Button onClick={() => start()}>
            <Plus className="size-4" /> Add Teacher
          </Button>
        }
      />
      <DataTable
        columns={columns}
        rows={teachers}
        searchKeys={["name", "empId", "subject", "mobile"]}
        exportName="teachers"
      />
      {view && (
        <div className="mt-6 grid gap-6 lg:grid-cols-2">
          <Panel title={`Profile — ${view.name}`}>
            <div className="space-y-1 text-sm">
              <Field label="Employee ID" value={view.empId} />
              <Field label="Father's Name" value={view.father} />
              <Field label="Date of Birth" value={fmtDate(view.dob)} />
              <Field label="Email" value={view.email} />
              <Field label="Address" value={view.address} />
              <Field label="Joining Date" value={fmtDate(view.joiningDate)} />
              <Field label="Monthly Salary" value={inr(view.salary)} />
            </div>
          </Panel>
          <Panel title="Assigned periods">
            <ul className="space-y-2 text-sm">
              {timetable
                .filter((t: any) => t.teacher === view.name)
                .slice(0, 10)
                .map((t: any) => (
                  <li key={t.id} className="flex justify-between rounded-lg bg-muted/50 px-3 py-2">
                    <span>
                      {t.day} • Period {t.period}
                    </span>
                    <span className="font-medium">
                      {t.subject} ({t.className}-{t.section})
                    </span>
                  </li>
                ))}
              {timetable.filter((t: any) => t.teacher === view.name).length === 0 && (
                <li className="text-muted-foreground">No periods assigned yet.</li>
              )}
            </ul>
          </Panel>
        </div>
      )}
      {modal}
      {dialog}
    </>
  );
}

const emptyStaff = {
  empId: "", name: "", designation: "", department: "", joiningDate: today(),
  salary: 18000, bank: "", mobile: "", email: "",
};

export function StaffList() {
  const { staff, add, update, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyStaff);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = () => {
    if (!form.name.trim()) return toast.error("Staff name is required");
    if (form.id) {
      update("staff", form.id, form);
      toast.success("Staff member updated");
    } else {
      add("staff", form, "stf");
      toast.success("Staff member added");
    }
    setOpen(false);
  };

  const columns = [
    { key: "empId", label: "Emp ID" },
    { key: "name", label: "Name" },
    { key: "designation", label: "Designation" },
    { key: "department", label: "Department" },
    { key: "mobile", label: "Mobile" },
    { key: "joiningDate", label: "Joined", render: (r: any) => fmtDate(r.joiningDate) },
    { key: "salary", label: "Salary", render: (r: any) => inr(r.salary) },
    {
      key: "actions",
      label: "Actions",
      sortable: false,
      render: (r: any) => (
        <div className="flex gap-1">
          <Button
            size="icon"
            variant="ghost"
            aria-label="Edit"
            onClick={() => {
              setForm({ ...r });
              setOpen(true);
            }}
          >
            <Pencil className="size-4" />
          </Button>
          <Button
            size="icon"
            variant="ghost"
            aria-label="Delete"
            onClick={() =>
              confirm(`Remove ${r.name} from staff records?`, () => {
                remove("staff", r.id);
                toast.success("Staff member removed");
              })
            }
          >
            <Trash2 className="size-4 text-destructive" />
          </Button>
        </div>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Staff List"
        subtitle={`${staff.length} non-teaching staff members`}
        actions={
          <Button
            onClick={() => {
              setForm({ ...emptyStaff, empId: `EMP-S${Math.floor(Math.random() * 900 + 100)}` });
              setOpen(true);
            }}
          >
            <Plus className="size-4" /> Add Staff
          </Button>
        }
      />
      <DataTable columns={columns} rows={staff} searchKeys={["name", "empId", "designation", "department"]} exportName="staff" />
      <FormModal open={open} onOpenChange={setOpen} title={form.id ? "Edit Staff" : "Add Staff"} onSubmit={save}>
        <TextField label="Employee ID" value={form.empId} onChange={(v) => set("empId", v)} />
        <TextField label="Name" value={form.name} onChange={(v) => set("name", v)} required />
        <TextField label="Designation" value={form.designation} onChange={(v) => set("designation", v)} />
        <TextField label="Department" value={form.department} onChange={(v) => set("department", v)} />
        <TextField label="Joining Date" type="date" value={form.joiningDate} onChange={(v) => set("joiningDate", v)} />
        <TextField label="Monthly Salary" type="number" value={form.salary} onChange={(v) => set("salary", Number(v))} />
        <TextField label="Bank Details" value={form.bank} onChange={(v) => set("bank", v)} />
        <TextField label="Mobile" value={form.mobile} onChange={(v) => set("mobile", v)} />
        <TextField label="Email" value={form.email} onChange={(v) => set("email", v)} />
      </FormModal>
      {dialog}
    </>
  );
}

export function TeacherAttendance() {
  const { teachers, staff } = useApp();
  const [date, setDate] = useState(today());
  const [group, setGroup] = useState("Teachers");
  const people = group === "Teachers" ? teachers : staff;
  const [status, setStatus] = useState<Record<string, string>>({});

  const counts = useMemo(() => {
    const present = people.filter((p: any) => (status[p.id] || "Present") === "Present").length;
    return { present, absent: people.length - present };
  }, [people, status]);

  return (
    <>
      <PageHeader
        title="Teacher & Staff Attendance"
        subtitle="Mark daily attendance for employees."
        actions={<Button onClick={() => toast.success(`Attendance saved for ${fmtDate(date)}`)}>Save Attendance</Button>}
      />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Group" value={group} onChange={setGroup} options={["Teachers", "Staff"]} />
          <TextField label="Date" type="date" value={date} onChange={setDate} />
          <div className="flex items-end gap-2 text-sm">
            <Badge tone="green">Present {counts.present}</Badge>
            <Badge tone="red">Absent {counts.absent}</Badge>
          </div>
        </div>
        <div className="mt-5 space-y-2">
          {people.map((p: any) => {
            const value = status[p.id] || "Present";
            return (
              <div key={p.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-border p-3">
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {p.empId} • {p.designation || p.subject}
                  </p>
                </div>
                {["Present", "Absent", "Leave"].map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => setStatus((st) => ({ ...st, [p.id]: s }))}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors ${
                      value === s ? "bg-primary text-primary-foreground" : "bg-muted hover:bg-muted/70"
                    }`}
                  >
                    {s}
                  </button>
                ))}
              </div>
            );
          })}
        </div>
      </Panel>
    </>
  );
}

export function Payroll() {
  const { teachers, staff, salaries, add, settings } = useApp();
  const people = useMemo(
    () => [
      ...teachers.map((t: any) => ({ ...t, designation: `Teacher — ${t.subject}` })),
      ...staff,
    ],
    [teachers, staff],
  );
  const [empId, setEmpId] = useState(people[0]?.id || "");
  const emp = people.find((p: any) => p.id === empId);
  const [month, setMonth] = useState("September");
  const [allowances, setAllowances] = useState(2500);
  const [deductions, setDeductions] = useState(1200);
  const [advance, setAdvance] = useState(0);
  const [payDate, setPayDate] = useState(today());
  const [slip, setSlip] = useState<any>(null);

  const basic = Number(emp?.salary || 0);
  const net = basic + Number(allowances) - Number(deductions) - Number(advance);

  const savePayroll = () => {
    if (!emp) return toast.error("Select an employee");
    const row = {
      empId: emp.empId, name: emp.name, designation: emp.designation, month,
      basic, allowances, deductions, advance, net, date: payDate,
    };
    add("salaries", row, "sal");
    setSlip(row);
    toast.success(`Salary of ${emp.name} recorded for ${month}`);
  };

  return (
    <>
      <PageHeader title="Salary / Payroll" subtitle="Generate salary slips with automatic net salary." />
      <div className="space-y-6">
        <Panel title="Salary calculation">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <SelectField
              label="Employee"
              value={empId}
              onChange={setEmpId}
              options={people.map((p: any) => ({ value: p.id, label: `${p.name} — ${p.designation}` }))}
            />
            <SelectField
              label="Salary Month"
              value={month}
              onChange={setMonth}
              options={["April", "May", "June", "July", "August", "September", "October", "November", "December", "January", "February", "March"]}
            />
            <TextField label="Basic Salary" value={inr(basic)} onChange={() => {}} />
            <TextField label="Allowances" type="number" value={allowances} onChange={(v) => setAllowances(Number(v))} />
            <TextField label="Deductions" type="number" value={deductions} onChange={(v) => setDeductions(Number(v))} />
            <TextField label="Advance" type="number" value={advance} onChange={(v) => setAdvance(Number(v))} />
            <TextField label="Payment Date" type="date" value={payDate} onChange={setPayDate} />
            <div className="flex items-end">
              <div className="w-full rounded-lg bg-primary/10 p-3">
                <p className="text-xs font-semibold uppercase text-muted-foreground">Net Salary</p>
                <p className="text-xl font-bold text-primary">{inr(net)}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-2">
            <Button onClick={savePayroll}>Save & Generate Slip</Button>
            <Button
              variant="outline"
              onClick={() => {
                setAllowances(0);
                setDeductions(0);
                setAdvance(0);
                setSlip(null);
              }}
            >
              Reset
            </Button>
          </div>
        </Panel>

        {slip && (
          <>
            <DocToolbar docId="doc-slip" />
            <A4Document id="doc-slip" title={`Salary Slip — ${slip.month}`}>
              <div className="mt-4 space-y-1">
                <Field label="Employee Name" value={slip.name} />
                <Field label="Employee ID" value={slip.empId} />
                <Field label="Designation" value={slip.designation} />
                <Field label="Salary Month" value={`${slip.month} ${settings.session}`} />
                <Field label="Payment Date" value={fmtDate(slip.date)} />
              </div>
              <table className="mt-6 w-full border-collapse text-[12px]">
                <tbody>
                  {[
                    ["Basic Salary", slip.basic],
                    ["Allowances", slip.allowances],
                    ["Deductions", -slip.deductions],
                    ["Advance", -slip.advance],
                  ].map(([l, v]: any) => (
                    <tr key={l}>
                      <td className="border border-slate-800 px-2 py-1">{l}</td>
                      <td className="border border-slate-800 px-2 py-1 text-right">{inr(Math.abs(v))}</td>
                    </tr>
                  ))}
                  <tr className="font-bold">
                    <td className="border border-slate-800 px-2 py-1">Net Salary Payable</td>
                    <td className="border border-slate-800 px-2 py-1 text-right">{inr(slip.net)}</td>
                  </tr>
                </tbody>
              </table>
              <SignRow items={["Accountant", "School Stamp", "Principal"]} />
            </A4Document>
          </>
        )}

        <Panel title="Salary payment history">
          <DataTable
            columns={[
              { key: "name", label: "Employee" },
              { key: "designation", label: "Designation" },
              { key: "month", label: "Month" },
              { key: "basic", label: "Basic", render: (r: any) => inr(r.basic) },
              { key: "net", label: "Net Paid", render: (r: any) => inr(r.net) },
              { key: "date", label: "Date", render: (r: any) => fmtDate(r.date) },
            ]}
            rows={salaries}
            searchKeys={["name", "month", "designation"]}
            exportName="payroll"
            emptyMessage="No salary payments recorded yet."
          />
        </Panel>
      </div>
    </>
  );
}

export { CLASSES, SECTIONS };
