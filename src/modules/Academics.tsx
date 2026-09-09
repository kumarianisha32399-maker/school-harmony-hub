import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Pencil, Plus, Printer, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/common/DataTable";
import {
  EmptyState,
  FormModal,
  PageHeader,
  Panel,
  SelectField,
  TextField,
  useConfirm,
} from "@/components/common/Ui";
import { Badge } from "@/modules/shared";
import { printArea } from "@/utils/helpers";

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
const PERIODS = [1, 2, 3, 4, 5, 6, 7, 8];

/* ------------------------------- Classes & Sections ------------------------------ */

export function ClassesSections() {
  const { classes, sections, students, replace } = useApp();
  const { confirm, dialog } = useConfirm();
  const [newClass, setNewClass] = useState("");
  const [newSection, setNewSection] = useState("");

  const addClass = () => {
    const v = newClass.trim();
    if (!v) return toast.error("Enter a class name");
    if (classes.includes(v)) return toast.error("Class already exists");
    replace("classes", [...classes, v] as any);
    setNewClass("");
    toast.success(`Class ${v} added`);
  };

  const addSection = () => {
    const v = newSection.trim().toUpperCase();
    if (!v) return toast.error("Enter a section name");
    if (sections.includes(v)) return toast.error("Section already exists");
    replace("sections", [...sections, v] as any);
    setNewSection("");
    toast.success(`Section ${v} added`);
  };

  const strength = (cls: string) => students.filter((s: any) => s.className === cls).length;

  return (
    <div>
      <PageHeader
        title="Classes & Sections"
        subtitle="Manage the academic structure used across admissions, fees and examinations."
        actions={
          <Button variant="outline" onClick={() => printArea("classes-print")}>
            <Printer className="size-4" /> Print
          </Button>
        }
      />
      <div id="classes-print" className="grid gap-6 lg:grid-cols-2">
        <Panel title="Classes">
          <div className="mb-4 flex gap-2 print:hidden">
            <Input
              value={newClass}
              onChange={(e) => setNewClass(e.target.value)}
              placeholder="e.g. XI"
            />
            <Button onClick={addClass}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {classes.map((c) => (
              <li key={c} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium">Class {c}</span>
                <span className="flex items-center gap-3">
                  <Badge tone="blue">{strength(c)} students</Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="print:hidden"
                    onClick={() =>
                      confirm(`Remove class ${c}? Existing student records keep their class label.`, () => {
                        replace("classes", classes.filter((x) => x !== c) as any);
                        toast.success("Class removed");
                      })
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>

        <Panel title="Sections">
          <div className="mb-4 flex gap-2 print:hidden">
            <Input
              value={newSection}
              onChange={(e) => setNewSection(e.target.value)}
              placeholder="e.g. D"
            />
            <Button onClick={addSection}>
              <Plus className="size-4" /> Add
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {sections.map((s) => (
              <li key={s} className="flex items-center justify-between py-2.5 text-sm">
                <span className="font-medium">Section {s}</span>
                <span className="flex items-center gap-3">
                  <Badge tone="green">
                    {students.filter((st: any) => st.section === s).length} students
                  </Badge>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="print:hidden"
                    onClick={() =>
                      confirm(`Remove section ${s}?`, () => {
                        replace("sections", sections.filter((x) => x !== s) as any);
                        toast.success("Section removed");
                      })
                    }
                  >
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
      {dialog}
    </div>
  );
}

/* ---------------------------------- Subjects ---------------------------------- */

const emptySubject = { name: "", code: "", maxMarks: 100, passMarks: 33, type: "Core" };

export function Subjects() {
  const { subjects, add, update, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptySubject);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const start = (row?: any) => {
    setForm(row ? { ...row } : { ...emptySubject });
    setOpen(true);
  };

  const save = () => {
    if (!form.name.trim()) return toast.error("Subject name is required");
    if (form.id) {
      update("subjects", form.id, form);
      toast.success("Subject updated");
    } else {
      add("subjects", form, "sub");
      toast.success("Subject added");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Subjects"
        subtitle="Subjects feed the marks entry, marksheet and timetable modules."
        actions={
          <Button onClick={() => start()}>
            <Plus className="size-4" /> Add Subject
          </Button>
        }
      />
      <DataTable
        exportName="subjects"
        rows={subjects}
        searchKeys={["name", "code", "type"]}
        columns={[
          { key: "name", label: "Subject" },
          { key: "code", label: "Code" },
          { key: "type", label: "Type", render: (r) => <Badge tone="blue">{r.type || "Core"}</Badge> },
          { key: "maxMarks", label: "Max Marks" },
          { key: "passMarks", label: "Pass Marks" },
          {
            key: "actions",
            label: "Actions",
            sortable: false,
            render: (r) => (
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" onClick={() => start(r)}>
                  <Pencil className="size-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() =>
                    confirm(`Delete subject ${r.name}?`, () => {
                      remove("subjects", r.id);
                      toast.success("Subject deleted");
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
      <FormModal
        open={open}
        onOpenChange={setOpen}
        title={form.id ? "Edit Subject" : "Add Subject"}
        onSubmit={save}
      >
        <TextField label="Subject Name" value={form.name} onChange={(v) => set("name", v)} required />
        <TextField label="Subject Code" value={form.code} onChange={(v) => set("code", v)} />
        <SelectField
          label="Type"
          value={form.type}
          onChange={(v) => set("type", v)}
          options={["Core", "Elective", "Language", "Activity"]}
        />
        <TextField
          label="Max Marks"
          type="number"
          value={form.maxMarks}
          onChange={(v) => set("maxMarks", Number(v))}
        />
        <TextField
          label="Pass Marks"
          type="number"
          value={form.passMarks}
          onChange={(v) => set("passMarks", Number(v))}
        />
      </FormModal>
      {dialog}
    </div>
  );
}

/* ------------------------------- Assign Teacher ------------------------------- */

export function AssignTeacher() {
  const { teachers, subjects, classes, sections, update } = useApp();
  const [teacherId, setTeacherId] = useState(teachers[0]?.id || "");
  const [className, setClassName] = useState(classes[0] || "");
  const [section, setSection] = useState(sections[0] || "");
  const [subject, setSubject] = useState(subjects[0]?.name || "");

  const teacher = teachers.find((t: any) => t.id === teacherId);

  const assign = () => {
    if (!teacher) return toast.error("Select a teacher first");
    const assignments = [
      ...(teacher.assignments || []),
      { className, section, subject },
    ];
    update("teachers", teacher.id, { assignments });
    toast.success(`${teacher.name} assigned to ${className}-${section} for ${subject}`);
  };

  const removeAssignment = (idx: number) => {
    if (!teacher) return;
    update("teachers", teacher.id, {
      assignments: (teacher.assignments || []).filter((_: any, i: number) => i !== idx),
    });
    toast.success("Assignment removed");
  };

  return (
    <div>
      <PageHeader title="Assign Teacher" subtitle="Map teachers to classes, sections and subjects." />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
        <Panel title="New Assignment">
          <div className="grid gap-4 sm:grid-cols-2">
            <SelectField
              label="Teacher"
              value={teacherId}
              onChange={setTeacherId}
              options={teachers.map((t: any) => ({ value: t.id, label: `${t.name} (${t.empId})` }))}
            />
            <SelectField label="Class" value={className} onChange={setClassName} options={classes} />
            <SelectField label="Section" value={section} onChange={setSection} options={sections} />
            <SelectField
              label="Subject"
              value={subject}
              onChange={setSubject}
              options={subjects.map((s: any) => s.name)}
            />
          </div>
          <Button className="mt-4" onClick={assign}>
            <Plus className="size-4" /> Assign
          </Button>
        </Panel>

        <Panel title={teacher ? `Assignments — ${teacher.name}` : "Assignments"}>
          {!teacher?.assignments?.length ? (
            <EmptyState message="No classes assigned to this teacher yet." />
          ) : (
            <ul className="divide-y divide-border">
              {teacher.assignments.map((a: any, i: number) => (
                <li key={`${a.className}-${a.section}-${a.subject}-${i}`} className="flex items-center justify-between py-2.5 text-sm">
                  <span>
                    <span className="font-semibold">
                      Class {a.className}-{a.section}
                    </span>{" "}
                    <span className="text-muted-foreground">• {a.subject}</span>
                  </span>
                  <Button variant="ghost" size="icon" onClick={() => removeAssignment(i)}>
                    <Trash2 className="size-4 text-destructive" />
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* --------------------------------- Timetable --------------------------------- */

const emptySlot = {
  className: "",
  section: "",
  day: "Monday",
  period: 1,
  subject: "",
  teacher: "",
  startTime: "09:00",
  endTime: "09:45",
};

export function Timetable() {
  const { timetable, classes, sections, subjects, teachers, add, update, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const [className, setClassName] = useState("X");
  const [section, setSection] = useState("A");
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState<any>(emptySlot);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const rows = useMemo(
    () => timetable.filter((t: any) => t.className === className && t.section === section),
    [timetable, className, section],
  );

  const grid = useMemo(() => {
    const map: Record<string, any> = {};
    rows.forEach((r: any) => {
      map[`${r.day}-${r.period}`] = r;
    });
    return map;
  }, [rows]);

  const start = (row?: any) => {
    setForm(
      row
        ? { ...row }
        : {
            ...emptySlot,
            className,
            section,
            subject: subjects[0]?.name || "",
            teacher: teachers[0]?.name || "",
          },
    );
    setOpen(true);
  };

  const save = () => {
    if (!form.subject) return toast.error("Select a subject");
    if (form.id) {
      update("timetable", form.id, form);
      toast.success("Period updated");
    } else {
      add("timetable", { ...form, period: Number(form.period) }, "tt");
      toast.success("Period added");
    }
    setOpen(false);
  };

  return (
    <div>
      <PageHeader
        title="Timetable"
        subtitle="Class-wise weekly period plan with subject and teacher allocation."
        actions={
          <>
            <Button variant="outline" onClick={() => printArea("timetable-print")}>
              <Printer className="size-4" /> Print
            </Button>
            <Button onClick={() => start()}>
              <Plus className="size-4" /> Add Period
            </Button>
          </>
        }
      />

      <div className="mb-5 grid gap-4 sm:grid-cols-2 lg:w-1/2 print:hidden">
        <SelectField label="Class" value={className} onChange={setClassName} options={classes} />
        <SelectField label="Section" value={section} onChange={setSection} options={sections} />
      </div>

      {!rows.length ? (
        <EmptyState message={`No timetable created for Class ${className}-${section} yet.`} />
      ) : (
        <div id="timetable-print" className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
          <h3 className="hidden p-4 text-center text-lg font-bold print:block">
            Timetable — Class {className}-{section}
          </h3>
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-muted/60 text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-3 py-3 text-left font-semibold">Day</th>
                {PERIODS.map((p) => (
                  <th key={p} className="px-3 py-3 text-left font-semibold">
                    Period {p}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {DAYS.map((d) => (
                <tr key={d}>
                  <td className="px-3 py-3 font-semibold">{d}</td>
                  {PERIODS.map((p) => {
                    const slot = grid[`${d}-${p}`];
                    return (
                      <td key={p} className="px-3 py-2 align-top">
                        {slot ? (
                          <div className="group rounded-lg border border-border bg-background p-2">
                            <p className="text-xs font-semibold">{slot.subject}</p>
                            <p className="text-[11px] text-muted-foreground">{slot.teacher}</p>
                            <p className="text-[11px] text-muted-foreground">
                              {slot.startTime}–{slot.endTime}
                            </p>
                            <div className="mt-1 flex gap-1 print:hidden">
                              <button
                                className="text-[11px] font-medium text-primary hover:underline"
                                onClick={() => start(slot)}
                              >
                                Edit
                              </button>
                              <button
                                className="text-[11px] font-medium text-destructive hover:underline"
                                onClick={() =>
                                  confirm(`Delete ${slot.subject} on ${d} period ${p}?`, () => {
                                    remove("timetable", slot.id);
                                    toast.success("Period deleted");
                                  })
                                }
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <FormModal open={open} onOpenChange={setOpen} title={form.id ? "Edit Period" : "Add Period"} onSubmit={save}>
        <SelectField label="Class" value={form.className} onChange={(v) => set("className", v)} options={classes} />
        <SelectField label="Section" value={form.section} onChange={(v) => set("section", v)} options={sections} />
        <SelectField label="Day" value={form.day} onChange={(v) => set("day", v)} options={DAYS} />
        <SelectField
          label="Period"
          value={String(form.period)}
          onChange={(v) => set("period", Number(v))}
          options={PERIODS.map((p) => String(p))}
        />
        <SelectField
          label="Subject"
          value={form.subject}
          onChange={(v) => set("subject", v)}
          options={subjects.map((s: any) => s.name)}
        />
        <SelectField
          label="Teacher"
          value={form.teacher}
          onChange={(v) => set("teacher", v)}
          options={teachers.map((t: any) => t.name)}
        />
        <TextField label="Start Time" type="time" value={form.startTime} onChange={(v) => set("startTime", v)} />
        <TextField label="End Time" type="time" value={form.endTime} onChange={(v) => set("endTime", v)} />
      </FormModal>
      {dialog}
    </div>
  );
}
