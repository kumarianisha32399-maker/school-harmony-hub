import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Plus, Trash2, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState, FormModal, PageHeader, Panel, SelectField, TextField, useConfirm } from "@/components/common/Ui";
import { Button } from "@/components/ui/button";
import { A4Document, DocToolbar, Field, SignRow } from "@/components/common/A4Document";
import { fmtDate, inr, today } from "@/utils/helpers";
import { Badge } from "@/modules/shared";

const BLANK = {
  regNo: "", name: "", father: "", mother: "", guardian: "", dob: "", gender: "Male",
  bloodGroup: "O+", mobile: "", email: "", occupation: "", address: "", city: "Indore",
  state: "Madhya Pradesh", pin: "", applyingClass: "V", previousClass: "", previousSchool: "",
  session: "2025-26", date: today(), status: "Pending", fee: 5000,
};

function AdmissionFields({ form, set, classes }: any) {
  return (
    <>
      <TextField label="Registration Number" value={form.regNo} onChange={(v) => set("regNo", v)} required />
      <TextField label="Student Name" value={form.name} onChange={(v) => set("name", v)} required />
      <TextField label="Father's Name" value={form.father} onChange={(v) => set("father", v)} />
      <TextField label="Mother's Name" value={form.mother} onChange={(v) => set("mother", v)} />
      <TextField label="Guardian Name" value={form.guardian} onChange={(v) => set("guardian", v)} />
      <TextField label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
      <SelectField label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={["Male", "Female", "Other"]} />
      <TextField label="Mobile" value={form.mobile} onChange={(v) => set("mobile", v)} />
      <TextField label="Email" value={form.email} onChange={(v) => set("email", v)} />
      <TextField label="Parent Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
      <TextField label="Address" value={form.address} onChange={(v) => set("address", v)} />
      <TextField label="City" value={form.city} onChange={(v) => set("city", v)} />
      <TextField label="State" value={form.state} onChange={(v) => set("state", v)} />
      <TextField label="PIN Code" value={form.pin} onChange={(v) => set("pin", v)} />
      <SelectField label="Applying For Class" value={form.applyingClass} onChange={(v) => set("applyingClass", v)} options={classes} />
      <TextField label="Previous Class" value={form.previousClass} onChange={(v) => set("previousClass", v)} />
      <TextField label="Previous School" value={form.previousSchool} onChange={(v) => set("previousSchool", v)} />
      <TextField label="Admission Date" type="date" value={form.date} onChange={(v) => set("date", v)} />
      <TextField label="Admission Fee" type="number" value={form.fee} onChange={(v) => set("fee", Number(v))} />
      <SelectField label="Status" value={form.status} onChange={(v) => set("status", v)} options={["Pending", "Approved", "Rejected"]} />
    </>
  );
}

export function NewAdmission() {
  const { admissions, classes, add, update } = useApp();
  const [form, setForm] = useState<any>({ ...BLANK, regNo: `REG${5100 + admissions.length}` });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const save = (alsoEnroll: boolean) => {
    if (!form.name.trim()) return toast.error("Student name is required.");
    const row = add("admissions", form, "adm");
    if (alsoEnroll) {
      add(
        "students",
        {
          admissionNo: `ADM${Date.now().toString().slice(-7)}`,
          name: form.name, father: form.father, mother: form.mother, dob: form.dob,
          gender: form.gender, mobile: form.mobile, email: form.email, address: form.address,
          city: form.city, state: form.state, pin: form.pin, className: form.applyingClass,
          section: "A", rollNo: 1, admissionDate: form.date, session: form.session,
          category: "General", bloodGroup: form.bloodGroup, photo: "", guardian: form.guardian || form.father,
          occupation: form.occupation, previousSchool: form.previousSchool, status: "Active",
        },
        "stu",
      );
      update("admissions", row.id, { status: "Approved" });
      toast.success("Admission saved and student enrolled.");
    } else {
      toast.success("Admission application saved.");
    }
    setForm({ ...BLANK, regNo: `REG${5100 + admissions.length + 1}` });
  };

  return (
    <div>
      <PageHeader
        title="New Admission"
        subtitle="Register a new applicant and optionally enroll them as a student"
        actions={
          <>
            <Button variant="outline" onClick={() => setForm({ ...BLANK, regNo: form.regNo })}>Reset</Button>
            <Button variant="outline" onClick={() => save(false)}>Save Application</Button>
            <Button onClick={() => save(true)}><Check className="size-4" /> Save &amp; Enroll</Button>
          </>
        }
      />
      <Panel title="Applicant details">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <AdmissionFields form={form} set={set} classes={classes} />
        </div>
      </Panel>
    </div>
  );
}

export function AdmissionList() {
  const { admissions, classes, update, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(BLANK);
  const [status, setStatus] = useState("All");
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const rows = useMemo(
    () => admissions.filter((a: any) => status === "All" || a.status === status),
    [admissions, status],
  );

  return (
    <div>
      <PageHeader title="Admission List" subtitle={`${rows.length} applications`} />
      <DataTable
        exportName="admissions"
        rows={rows}
        searchKeys={["regNo", "name", "father", "mobile", "applyingClass"]}
        filters={
          <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={status} onChange={(e) => setStatus(e.target.value)}>
            {["All", "Pending", "Approved", "Rejected"].map((s) => <option key={s}>{s}</option>)}
          </select>
        }
        columns={[
          { key: "regNo", label: "Reg. No" },
          { key: "name", label: "Applicant" },
          { key: "father", label: "Father" },
          { key: "applyingClass", label: "Class" },
          { key: "mobile", label: "Mobile" },
          { key: "date", label: "Applied", render: (r) => fmtDate(r.date) },
          { key: "fee", label: "Fee", render: (r) => inr(r.fee) },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge tone={r.status === "Approved" ? "green" : r.status === "Rejected" ? "red" : "amber"}>{r.status}</Badge>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            render: (r) => (
              <div className="flex gap-1">
                <Button size="sm" variant="outline" onClick={() => { setForm(r); setOpen(true); }}>Edit</Button>
                {r.status !== "Approved" && (
                  <Button size="sm" variant="outline" onClick={() => { update("admissions", r.id, { status: "Approved" }); toast.success("Application approved."); }}>
                    Approve
                  </Button>
                )}
                <Button size="sm" variant="ghost" onClick={() => confirm(`Delete application of ${r.name}?`, () => { remove("admissions", r.id); toast.success("Application deleted."); })}>
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />
      <FormModal
        open={open}
        onOpenChange={setOpen}
        title="Edit Admission"
        onSubmit={() => { update("admissions", form.id, form); toast.success("Application updated."); setOpen(false); }}
      >
        <AdmissionFields form={form} set={set} classes={classes} />
      </FormModal>
      {dialog}
    </div>
  );
}

export function RegistrationForm() {
  const { admissions } = useApp();
  const [id, setId] = useState(admissions[0]?.id || "");
  const a = admissions.find((x: any) => x.id === id);

  return (
    <div>
      <PageHeader title="Registration Form" subtitle="Printable A4 admission / registration form" />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Application"
            value={id}
            onChange={setId}
            options={admissions.map((x: any) => ({ value: x.id, label: `${x.regNo} — ${x.name}` }))}
          />
        </div>
      </Panel>
      {!a ? (
        <div className="mt-6"><EmptyState message="Create an admission application first." /></div>
      ) : (
        <div className="mt-6">
          <DocToolbar docId="doc-regform" />
          <A4Document id="doc-regform" title="Admission / Registration Form">
            <p className="mb-3 text-right text-[11px]">Reg. No: <b>{a.regNo}</b> • Date: <b>{fmtDate(a.date)}</b></p>
            <h3 className="mb-1 bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">Student Details</h3>
            <Field label="Student Name" value={a.name} />
            <Field label="Date of Birth" value={fmtDate(a.dob)} />
            <Field label="Gender" value={a.gender} />
            <Field label="Blood Group" value={a.bloodGroup || "—"} />
            <Field label="Previous School" value={a.previousSchool || "—"} />
            <h3 className="mb-1 mt-4 bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">Parent / Guardian Details</h3>
            <Field label="Father's Name" value={a.father} />
            <Field label="Mother's Name" value={a.mother} />
            <Field label="Guardian" value={a.guardian || a.father} />
            <Field label="Mobile" value={a.mobile} />
            <Field label="Email" value={a.email} />
            <Field label="Occupation" value={a.occupation || "—"} />
            <h3 className="mb-1 mt-4 bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">Address</h3>
            <Field label="Address" value={`${a.address}, ${a.city || ""} ${a.state || ""} ${a.pin || ""}`} />
            <h3 className="mb-1 mt-4 bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">Academic Details</h3>
            <Field label="Applying For Class" value={a.applyingClass} />
            <Field label="Previous Class" value={a.previousClass || "—"} />
            <Field label="Academic Session" value={a.session} />
            <h3 className="mb-1 mt-4 bg-slate-100 px-2 py-1 text-[11px] font-bold uppercase">Document Checklist</h3>
            <div className="grid grid-cols-2 gap-1 text-[11px]">
              {["Birth Certificate", "Address Proof", "Previous School Certificate", "Photograph", "ID Proof", "Other"].map((d) => (
                <p key={d}>☐ {d}</p>
              ))}
            </div>
            <SignRow items={["Parent / Guardian", "Office Use", "Principal"]} />
          </A4Document>
        </div>
      )}
    </div>
  );
}

export function AdmissionReceipt() {
  const { admissions } = useApp();
  const [id, setId] = useState(admissions[0]?.id || "");
  const a = admissions.find((x: any) => x.id === id);

  return (
    <div>
      <PageHeader title="Admission Receipt" subtitle="Receipt for the admission / registration fee" />
      <Panel>
        <div className="grid gap-4 sm:grid-cols-2">
          <SelectField
            label="Application"
            value={id}
            onChange={setId}
            options={admissions.map((x: any) => ({ value: x.id, label: `${x.regNo} — ${x.name}` }))}
          />
        </div>
      </Panel>
      {!a ? (
        <div className="mt-6"><EmptyState message="No admission applications yet." /></div>
      ) : (
        <div className="mt-6">
          <DocToolbar docId="doc-admreceipt" />
          <A4Document id="doc-admreceipt" title="Admission Fee Receipt">
            <p className="mb-3 flex justify-between text-[11px]">
              <span>Receipt No: <b>ADM-{a.regNo}</b></span>
              <span>Date: <b>{fmtDate(a.date)}</b></span>
            </p>
            <Field label="Applicant Name" value={a.name} />
            <Field label="Father's Name" value={a.father} />
            <Field label="Registration No" value={a.regNo} />
            <Field label="Class Applied" value={a.applyingClass} />
            <Field label="Academic Session" value={a.session} />
            <table className="mt-4 w-full border-collapse text-[11px]">
              <thead>
                <tr className="bg-slate-100">
                  <th className="border border-slate-500 p-1 text-left">Particulars</th>
                  <th className="border border-slate-500 p-1 text-right">Amount</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="border border-slate-500 p-1">Admission / Registration Fee</td>
                  <td className="border border-slate-500 p-1 text-right">{inr(a.fee)}</td>
                </tr>
                <tr className="font-bold">
                  <td className="border border-slate-500 p-1 text-right">Total</td>
                  <td className="border border-slate-500 p-1 text-right">{inr(a.fee)}</td>
                </tr>
              </tbody>
            </table>
            <SignRow items={["Received By", "Principal", "School Stamp"]} />
          </A4Document>
        </div>
      )}
    </div>
  );
}
