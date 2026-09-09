import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Pencil, Plus, Printer, Send, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DataTable } from "@/components/common/DataTable";
import {
  FormModal,
  PageHeader,
  Panel,
  SelectField,
  TextField,
  useConfirm,
} from "@/components/common/Ui";
import { A4Document, DocToolbar } from "@/components/common/A4Document";
import { Badge, feeSummary } from "@/modules/shared";
import { fmtDate, inr, today } from "@/utils/helpers";

const AUDIENCES = ["All", "Parents", "Students", "Teachers", "Staff"];

const emptyNotice = {
  title: "",
  description: "",
  date: today(),
  audience: "All",
  status: "Draft",
};

export function Notices() {
  const { notices, settings, add, update, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptyNotice);
  const [preview, setPreview] = useState<any>(null);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const start = (row?: any) => {
    setForm(row ? { ...row } : { ...emptyNotice });
    setOpen(true);
  };

  const save = () => {
    if (!form.title.trim()) return toast.error("Notice title is required");
    if (form.id) {
      update("notices", form.id, form);
      toast.success("Notice updated");
    } else {
      add("notices", form, "not");
      toast.success("Notice created");
    }
    setOpen(false);
  };

  if (preview) {
    return (
      <div>
        <PageHeader
          title="Notice Preview"
          subtitle={preview.title}
          actions={
            <Button variant="outline" onClick={() => setPreview(null)}>
              Back to notices
            </Button>
          }
        />
        <DocToolbar docId="notice-doc" />
        <A4Document id="notice-doc" title="Notice">
          <div className="flex justify-between text-[11px] font-semibold">
            <span>Notice No: {String(preview.id).toUpperCase()}</span>
            <span>Date: {fmtDate(preview.date)}</span>
          </div>
          <h2 className="mt-8 text-center text-lg font-bold uppercase">{preview.title}</h2>
          <p className="mt-2 text-center text-[11px] font-semibold uppercase">
            To: {preview.audience}
          </p>
          <p className="mt-8 whitespace-pre-line text-justify leading-7">{preview.description}</p>
          <div className="mt-24 text-right">
            <p className="border-t border-slate-800 pt-1 text-[11px] font-semibold uppercase">
              {settings.principal}, Principal
            </p>
          </div>
        </A4Document>
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title="Notices"
        subtitle="Create, publish and print school notices and circulars."
        actions={
          <Button onClick={() => start()}>
            <Plus className="size-4" /> Create Notice
          </Button>
        }
      />
      <DataTable
        exportName="notices"
        rows={notices}
        searchKeys={["title", "audience", "status"]}
        columns={[
          { key: "title", label: "Title" },
          { key: "audience", label: "Audience" },
          { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
          {
            key: "status",
            label: "Status",
            render: (r) => (
              <Badge tone={r.status === "Published" ? "green" : "amber"}>{r.status}</Badge>
            ),
          },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (r) => (
              <div className="flex flex-wrap gap-1">
                <Button variant="ghost" size="icon" onClick={() => setPreview(r)} title="Preview / Print">
                  <Printer className="size-4" />
                </Button>
                {r.status !== "Published" && (
                  <Button
                    variant="ghost"
                    size="icon"
                    title="Publish"
                    onClick={() => {
                      update("notices", r.id, { status: "Published" });
                      toast.success("Notice published");
                    }}
                  >
                    <Send className="size-4" />
                  </Button>
                )}
                <Button variant="ghost" size="icon" onClick={() => start(r)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    confirm(`Delete notice "${r.title}"?`, () => {
                      remove("notices", r.id);
                      toast.success("Notice deleted");
                    })
                  }
                >
                  <Trash2 className="size-4 text-destructive" />
                </Button>
              </div>
            ),
          },
        ]}
      />

      <FormModal open={open} onOpenChange={setOpen} title={form.id ? "Edit Notice" : "Create Notice"} onSubmit={save}>
        <TextField label="Notice Title" value={form.title} onChange={(v) => set("title", v)} required />
        <TextField label="Date" type="date" value={form.date} onChange={(v) => set("date", v)} />
        <SelectField label="Target Audience" value={form.audience} onChange={(v) => set("audience", v)} options={AUDIENCES} />
        <SelectField label="Status" value={form.status} onChange={(v) => set("status", v)} options={["Draft", "Published"]} />
        <div className="space-y-1.5 sm:col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Description</p>
          <Textarea
            rows={5}
            value={form.description}
            onChange={(e) => set("description", e.target.value)}
            placeholder="Write the full notice text…"
          />
        </div>
      </FormModal>
      {dialog}
    </div>
  );
}

/* ---------------------------- Parent Messages ---------------------------- */

const TEMPLATES = [
  { value: "fee", label: "Fee Reminder" },
  { value: "attendance", label: "Low Attendance Alert" },
  { value: "ptm", label: "PTM Invitation" },
  { value: "result", label: "Result Announcement" },
];

export function ParentMessages() {
  const { students, invoices, attendance, settings, classes } = useApp();
  const [template, setTemplate] = useState("fee");
  const [className, setClassName] = useState("All");
  const [studentId, setStudentId] = useState("");

  const filtered = useMemo(
    () => (className === "All" ? students : students.filter((s: any) => s.className === className)),
    [students, className],
  );

  const student = filtered.find((s: any) => s.id === studentId) || filtered[0];

  const message = useMemo(() => {
    if (!student) return "";
    const fee = feeSummary(invoices, student.id);
    const rows = attendance.filter((a: any) => a.studentId === student.id);
    const present = rows.filter((r: any) => r.status === "Present" || r.status === "Late").length;
    const pct = rows.length ? Math.round((present / rows.length) * 100) : 0;
    const head = `Dear ${student.father},`;
    const tail = `\n\nRegards,\n${settings.name}\n${settings.phone}`;
    if (template === "fee")
      return `${head}\n\nThis is a gentle reminder that fees of ${inr(fee.pending)} are pending for ${student.name} (Class ${student.className}-${student.section}, Adm. No ${student.admissionNo}). Kindly clear the dues at the school fee counter or via UPI to avoid late fee charges.${tail}`;
    if (template === "attendance")
      return `${head}\n\nThe attendance of ${student.name} (Class ${student.className}-${student.section}) is currently ${pct}%. Regular attendance is required to appear in examinations. Please ensure your child attends school daily.${tail}`;
    if (template === "ptm")
      return `${head}\n\nYou are cordially invited to the Parent Teacher Meeting for ${student.name} (Class ${student.className}-${student.section}) this Saturday between 9:00 AM and 12:00 noon. Please meet the class teacher to discuss progress.${tail}`;
    return `${head}\n\nThe examination result of ${student.name} (Class ${student.className}-${student.section}) has been declared. Report cards can be collected from the class teacher during school hours.${tail}`;
  }, [student, template, invoices, attendance, settings]);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(message);
      toast.success("Message copied — paste into WhatsApp or SMS");
    } catch {
      toast.error("Could not copy. Select the text and copy manually.");
    }
  };

  return (
    <div>
      <PageHeader
        title="Parent Communication"
        subtitle="Generate WhatsApp / SMS-ready messages from live student data."
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <Panel title="Message Setup">
          <div className="grid gap-4">
            <SelectField label="Template" value={template} onChange={setTemplate} options={TEMPLATES} />
            <SelectField label="Class" value={className} onChange={setClassName} options={["All", ...classes]} />
            <SelectField
              label="Student"
              value={student?.id || ""}
              onChange={setStudentId}
              options={filtered.map((s: any) => ({
                value: s.id,
                label: `${s.name} — ${s.className}-${s.section}`,
              }))}
            />
            {student && (
              <div className="rounded-lg border border-border bg-muted/40 p-3 text-sm">
                <p className="font-semibold">{student.name}</p>
                <p className="text-xs text-muted-foreground">
                  Parent: {student.father} • Mobile: {student.mobile}
                </p>
              </div>
            )}
          </div>
        </Panel>

        <Panel
          title="Generated Message"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={copy}>
                <Copy className="size-4" /> Copy
              </Button>
              {student && (
                <Button size="sm" asChild>
                  <a
                    href={`https://wa.me/91${String(student.mobile).replace(/\D/g, "").slice(-10)}?text=${encodeURIComponent(message)}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <Send className="size-4" /> Send on WhatsApp
                  </a>
                </Button>
              )}
            </div>
          }
        >
          <Textarea rows={14} value={message} readOnly className="font-mono text-[13px]" />
        </Panel>
      </div>
    </div>
  );
}

export function Announcements() {
  const { notices, update, settings } = useApp();
  const [audience, setAudience] = useState("All");
  const list = useMemo(
    () =>
      notices
        .filter((n: any) => audience === "All" || n.audience === audience || n.audience === "All")
        .sort((a: any, b: any) => String(b.date).localeCompare(String(a.date))),
    [notices, audience],
  );

  return (
    <div>
      <PageHeader
        title="Announcements"
        subtitle="Everything currently published to the school noticeboard."
        actions={<Button variant="outline" onClick={() => window.print()}><Printer className="size-4" /> Print Board</Button>}
      />
      <Panel title="Filter">
        <div className="grid gap-4 sm:grid-cols-3">
          <SelectField label="Audience" value={audience} onChange={setAudience} options={AUDIENCES} />
        </div>
      </Panel>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {list.length === 0 && (
          <Panel><p className="text-sm text-muted-foreground">No announcements for this audience.</p></Panel>
        )}
        {list.map((n: any) => (
          <article key={n.id} className="rounded-xl border border-border bg-card p-5 shadow-sm">
            <div className="flex items-start justify-between gap-3">
              <h3 className="text-base font-semibold">{n.title}</h3>
              <Badge tone={n.status === "Published" ? "green" : "amber"}>{n.status}</Badge>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">
              {fmtDate(n.date)} • For {n.audience} • {settings['name']}
            </p>
            <p className="mt-3 whitespace-pre-line text-sm leading-6">{n.description}</p>
            <div className="mt-4 flex gap-2 print:hidden">
              <Button
                size="sm"
                variant={n.status === "Published" ? "outline" : "default"}
                onClick={() => {
                  update("notices", n.id, { status: n.status === "Published" ? "Draft" : "Published" });
                  toast.success(n.status === "Published" ? "Moved back to draft" : "Announcement published");
                }}
              >
                {n.status === "Published" ? "Unpublish" : "Publish"}
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => {
                  navigator.clipboard?.writeText(`${n.title}\n\n${n.description}\n\n— ${settings['name']}`);
                  toast.success("Announcement copied");
                }}
              >
                <Copy className="size-4" /> Copy
              </Button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
