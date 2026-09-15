"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Eye,
  FileSpreadsheet,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  Upload,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import {
  EmptyState, FormModal, PageHeader, Panel, SelectField, TextField, useConfirm,
} from "@/components/common/Ui";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { A4Document, DocToolbar, Field } from "@/components/common/A4Document";
import { fmtDate, initials, inr, invoiceTotal, qrMatrix, today } from "@/utils/helpers";
import { BLOOD, CATEGORY } from "@/data/seed";
import { Badge, attendanceSummary, feeSummary, useGoto } from "@/modules/shared";
import { hasAadhaarNameMismatch } from "@/utils/excel";
import { ImageUpload } from "@/components/common/ImageUpload";

const MINORITY_GROUPS = ["None", "Muslim", "Christian", "Sikh", "Buddhist", "Parsi", "Jain", "Other"];
const YES_NO = ["No", "Yes"];
const ENTRY_STATUSES = ["Regular", "New Admission", "Transferred In", "Direct Admission"];
const AADHAAR_STATUSES = ["Pending", "Verified", "Failed", "Not Provided"];

const BLANK = {
  admissionNo: "", name: "", father: "", mother: "", dob: "", gender: "Male",
  mobile: "", email: "", address: "", city: "Indore", state: "Madhya Pradesh", pin: "",
  className: "V", section: "A", rollNo: 1, admissionDate: today(), session: "2025-26",
  category: "General", bloodGroup: "O+", photo: "", guardian: "", occupation: "",
  previousSchool: "", status: "Active",
  // UDISE+ and Aadhaar fields
  penNo: "", studentStateCode: "", socialCategory: "General", minorityGroup: "None",
  bplBeneficiary: "No", cwsn: "No", isRepeater: "No", entryStatus: "Regular",
  aadhaarNo: "", nameAsPerAadhaar: "", aadhaarValidationStatus: "Pending",
};

function StudentFormFields({ form, set, classes, sections }: any) {
  return (
    <>
      <div className="sm:col-span-2 lg:col-span-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
          Basic Student Details
        </h4>
      </div>
      <TextField label="Admission Number" value={form.admissionNo} onChange={(v) => set("admissionNo", v)} required />
      <TextField label="Student Name" value={form.name} onChange={(v) => set("name", v)} required />
      <TextField label="Father's Name" value={form.father} onChange={(v) => set("father", v)} />
      <TextField label="Mother's Name" value={form.mother} onChange={(v) => set("mother", v)} />
      <TextField label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
      <SelectField label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={["Male", "Female", "Other"]} />
      <SelectField label="Class" value={form.className} onChange={(v) => set("className", v)} options={classes} />
      <SelectField label="Section" value={form.section} onChange={(v) => set("section", v)} options={sections} />
      <TextField label="Roll Number" type="number" value={form.rollNo} onChange={(v) => set("rollNo", Number(v))} />
      <TextField label="Mobile Number" value={form.mobile} onChange={(v) => set("mobile", v)} />
      <TextField label="Email" value={form.email} onChange={(v) => set("email", v)} />
      <TextField label="Admission Date" type="date" value={form.admissionDate} onChange={(v) => set("admissionDate", v)} />
      <SelectField label="Blood Group" value={form.bloodGroup} onChange={(v) => set("bloodGroup", v)} options={BLOOD} />
      <SelectField label="Status" value={form.status} onChange={(v) => set("status", v)} options={["Active", "Inactive", "Transferred"]} />

      <div className="sm:col-span-2 lg:col-span-3 mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
          AADHAAR &amp; UDISE+ Official Information
        </h4>
      </div>
      <TextField label="AADHAAR No" value={form.aadhaarNo} onChange={(v) => set("aadhaarNo", v)} />
      <TextField label="Name As per AADHAAR" value={form.nameAsPerAadhaar} onChange={(v) => set("nameAsPerAadhaar", v)} />
      <SelectField label="AADHAAR Validation Status" value={form.aadhaarValidationStatus} onChange={(v) => set("aadhaarValidationStatus", v)} options={AADHAAR_STATUSES} />
      <TextField label="PEN no (Permanent Education No)" value={form.penNo} onChange={(v) => set("penNo", v)} />
      <TextField label="Student State Code" value={form.studentStateCode} onChange={(v) => set("studentStateCode", v)} />
      <SelectField label="Social Category" value={form.socialCategory || form.category} onChange={(v) => { set("socialCategory", v); set("category", v); }} options={CATEGORY} />
      <SelectField label="Minority Group" value={form.minorityGroup} onChange={(v) => set("minorityGroup", v)} options={MINORITY_GROUPS} />
      <SelectField label="BPL beneficiary" value={form.bplBeneficiary} onChange={(v) => set("bplBeneficiary", v)} options={YES_NO} />
      <SelectField label="CWSN (Special Needs)" value={form.cwsn} onChange={(v) => set("cwsn", v)} options={YES_NO} />
      <SelectField label="Is Repeater" value={form.isRepeater} onChange={(v) => set("isRepeater", v)} options={YES_NO} />
      <SelectField label="Entry Status" value={form.entryStatus} onChange={(v) => set("entryStatus", v)} options={ENTRY_STATUSES} />

      <div className="sm:col-span-2 lg:col-span-3 mt-4">
        <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
          Address &amp; Guardian Details
        </h4>
      </div>
      <TextField label="Address" value={form.address} onChange={(v) => set("address", v)} />
      <TextField label="City" value={form.city} onChange={(v) => set("city", v)} />
      <TextField label="State" value={form.state} onChange={(v) => set("state", v)} />
      <TextField label="PIN Code" value={form.pin} onChange={(v) => set("pin", v)} />
      <TextField label="Guardian Name" value={form.guardian} onChange={(v) => set("guardian", v)} />
      <TextField label="Guardian Occupation" value={form.occupation} onChange={(v) => set("occupation", v)} />
      <TextField label="Previous School" value={form.previousSchool} onChange={(v) => set("previousSchool", v)} />

      <div className="sm:col-span-2 lg:col-span-3 mt-4">
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

/**
 * Modal to Import Pending/Unimported Students from UDISE into Student List
 */
function ImportFromUdiseModal({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const { udiseStudents, students, transferUdiseToStudents } = useApp();
  const goto = useGoto();
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Filter ONLY records that are NOT yet imported into Student List
  const unimportedList = useMemo(() => {
    return udiseStudents.filter((u: any) => {
      if (u.importedToStudents) return false;
      const alreadyInStudents = students.some(
        (s: any) =>
          (s.admissionNo && u.admissionNo && s.admissionNo.toLowerCase() === u.admissionNo.toLowerCase()) ||
          (s.penNo && u.penNo && s.penNo === u.penNo)
      );
      return !alreadyInStudents;
    });
  }, [udiseStudents, students]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return unimportedList;
    return unimportedList.filter((s: any) =>
      [s.name, s.admissionNo, s.penNo, s.aadhaarNo, s.father, s.className, s.section].some((v) =>
        String(v ?? "").toLowerCase().includes(q)
      )
    );
  }, [unimportedList, query]);

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filtered.map((s: any) => s.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleImport = async () => {
    const idsToTransfer = selectedIds.length ? selectedIds : filtered.map((s: any) => s.id);
    if (!idsToTransfer.length) {
      toast.error("No unimported students selected to import.");
      return;
    }

    setLoading(true);
    try {
      const res = await transferUdiseToStudents(idsToTransfer);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} student(s) into Student List!`);
        setSelectedIds([]);
        onOpenChange(false);
      } else {
        toast.error(res.error || "Failed to import students from UDISE.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <FileSpreadsheet className="size-5 text-emerald-600" />
                Import Students from UDISE List
              </DialogTitle>
              <DialogDescription>
                Select unimported student records from the UDISE staging list to enroll into the active School Student List.
              </DialogDescription>
            </div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
              <Clock className="size-3.5" />
              {unimportedList.length} Unimported Available
            </span>
          </div>
        </DialogHeader>

        {unimportedList.length === 0 ? (
          <div className="py-12 text-center space-y-4">
            <div className="flex size-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-700 mx-auto dark:bg-emerald-950/80 dark:text-emerald-300">
              <CheckCircle2 className="size-8" />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">All UDISE Students Already Imported</h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto mt-1">
                There are currently no pending unimported records in the UDISE list. To add new student records, import a spreadsheet via UDISE Import Data.
              </p>
            </div>
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  onOpenChange(false);
                  goto("udise/import");
                }}
                className="gap-1.5"
              >
                <Upload className="size-4" /> Go to UDISE Import Data
              </Button>
              <Button size="sm" onClick={() => onOpenChange(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Search filter */}
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search unimported students by name, admission no, PEN, class…"
                  className="pl-9 text-xs"
                />
              </div>
              <span className="text-xs text-muted-foreground shrink-0">
                {selectedIds.length} of {filtered.length} selected
              </span>
            </div>

            {/* Unimported Students Table */}
            <div className="overflow-hidden rounded-xl border border-border">
              <div className="max-h-72 overflow-x-auto overflow-y-auto">
                <table className="w-full text-left text-xs whitespace-nowrap">
                  <thead className="sticky top-0 bg-muted/90 text-muted-foreground font-semibold backdrop-blur">
                    <tr className="divide-x divide-border border-b border-border">
                      <th className="px-3 py-2 text-center w-8">
                        <input
                          type="checkbox"
                          checked={filtered.length > 0 && selectedIds.length === filtered.length}
                          onChange={(e) => toggleSelectAll(e.target.checked)}
                          className="rounded border-input"
                        />
                      </th>
                      <th className="px-3 py-2">Adm. No</th>
                      <th className="px-3 py-2">Class-Sec</th>
                      <th className="px-3 py-2">Student Name</th>
                      <th className="px-3 py-2">Gender</th>
                      <th className="px-3 py-2">DOB</th>
                      <th className="px-3 py-2">Father Name</th>
                      <th className="px-3 py-2">PEN no</th>
                      <th className="px-3 py-2">AADHAAR No</th>
                      <th className="px-3 py-2">Category</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {filtered.map((s: any) => {
                      const isSelected = selectedIds.includes(s.id);
                      const nameMismatch = hasAadhaarNameMismatch(s.name, s.nameAsPerAadhaar);

                      return (
                        <tr
                          key={s.id}
                          onClick={() => toggleSelect(s.id)}
                          className={`divide-x divide-border cursor-pointer transition-colors ${
                            isSelected
                              ? "bg-emerald-50/70 dark:bg-emerald-950/30"
                              : "hover:bg-muted/30"
                          }`}
                        >
                          <td className="px-3 py-2 text-center" onClick={(e) => e.stopPropagation()}>
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelect(s.id)}
                              className="rounded border-input"
                            />
                          </td>
                          <td className="px-3 py-2 font-mono font-medium text-primary">
                            {s.admissionNo || "Auto"}
                          </td>
                          <td className="px-3 py-2 font-medium">{s.className}-{s.section || "A"}</td>
                          <td className="px-3 py-2">
                            <span className={`font-semibold ${nameMismatch ? "text-amber-700 dark:text-amber-400" : ""}`}>
                              {s.name}
                            </span>
                            {nameMismatch && (
                              <span className="ml-1.5 inline-flex items-center gap-0.5 rounded bg-amber-100 px-1 py-0.2 text-[9px] font-bold text-amber-800">
                                <AlertTriangle className="size-2.5" /> Diff
                              </span>
                            )}
                          </td>
                          <td className="px-3 py-2">{s.gender || "Male"}</td>
                          <td className="px-3 py-2">{fmtDate(s.dob)}</td>
                          <td className="px-3 py-2">{s.father || "—"}</td>
                          <td className="px-3 py-2 font-mono">{s.penNo || "—"}</td>
                          <td className="px-3 py-2 font-mono">{s.aadhaarNo || "—"}</td>
                          <td className="px-3 py-2">{s.socialCategory || s.category || "General"}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="flex flex-col-reverse justify-between gap-2 pt-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                variant="outline"
                size="sm"
                disabled={loading}
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  size="sm"
                  onClick={handleImport}
                  disabled={loading || (filtered.length === 0 && selectedIds.length === 0)}
                  className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Enrolling into Student List…
                    </>
                  ) : (
                    <>
                      <UserPlus className="size-4" />
                      {selectedIds.length > 0
                        ? `Import Selected (${selectedIds.length}) to Student List`
                        : `Import All Filtered (${filtered.length}) to Student List`}
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function StudentList() {
  const { students, udiseStudents, classes, sections, add, update, remove, invoices } = useApp();
  const goto = useGoto();
  const { confirm, dialog } = useConfirm();
  const [open, setOpen] = useState(false);
  const [udiseModalOpen, setUdiseModalOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<any>(BLANK);
  const [cls, setCls] = useState("All");
  const [sec, setSec] = useState("All");
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  // Count unimported UDISE students
  const unimportedCount = useMemo(() => {
    return udiseStudents.filter((u: any) => {
      if (u.importedToStudents) return false;
      const inStudents = students.some(
        (s: any) =>
          (s.admissionNo && u.admissionNo && s.admissionNo.toLowerCase() === u.admissionNo.toLowerCase()) ||
          (s.penNo && u.penNo && s.penNo === u.penNo)
      );
      return !inStudents;
    }).length;
  }, [udiseStudents, students]);

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
        subtitle={`${rows.length} of ${students.length} students enrolled in active roster.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              onClick={() => setUdiseModalOpen(true)}
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              Import from UDISE List
              {unimportedCount > 0 && (
                <span className="ml-1 rounded-full bg-emerald-600 px-1.5 py-0.2 text-[10px] font-bold text-white">
                  {unimportedCount}
                </span>
              )}
            </Button>
            <Button onClick={openAdd}>
              <Plus className="size-4" /> Add Student
            </Button>
          </div>
        }
      />
      <DataTable
        exportName="students"
        rows={rows}
        searchKeys={[
          "name",
          "admissionNo",
          "father",
          "mother",
          "mobile",
          "className",
          "penNo",
          "aadhaarNo",
          "nameAsPerAadhaar",
          "studentStateCode",
        ]}
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
          { key: "admissionNo", label: "1. Adm. No" },
          { key: "className", label: "2. Class", render: (r) => r.className || "—" },
          { key: "section", label: "3. Sec", render: (r) => r.section || "A" },
          { key: "rollNo", label: "4. Roll", render: (r) => r.rollNo || "0" },
          {
            key: "name",
            label: "5. Student Name",
            render: (r) => {
              const nameMismatch = hasAadhaarNameMismatch(r.name, r.nameAsPerAadhaar);
              return (
                <div className="flex items-center gap-2">
                  {r.photo ? (
                    <img
                      src={r.photo}
                      alt={r.name}
                      className="size-8 rounded-full object-cover border border-border shrink-0"
                    />
                  ) : (
                    <span className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-[11px] font-bold text-primary shrink-0">
                      {initials(r.name)}
                    </span>
                  )}
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className={`block font-semibold ${nameMismatch ? "text-red-600 dark:text-red-400 font-bold" : ""}`}>
                        {r.name}
                      </span>
                      {nameMismatch && (
                        <span
                          className="inline-flex items-center gap-1 rounded bg-red-100 dark:bg-red-950/80 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 dark:text-red-300"
                          title={`Registered Name (${r.name}) differs from Name As per AADHAAR (${r.nameAsPerAadhaar})`}
                        >
                          <AlertTriangle className="size-3 text-red-600 dark:text-red-400 shrink-0" />
                          Aadhaar: {r.nameAsPerAadhaar}
                        </span>
                      )}
                    </div>
                    <span className="block text-xs text-muted-foreground">
                      {r.father ? `S/D: ${r.father}` : r.penNo ? `PEN: ${r.penNo}` : ""}
                    </span>
                  </div>
                </div>
              );
            },
          },
          {
            key: "nameAsPerAadhaar",
            label: "6. Name As per Aadhaar",
            render: (r) => {
              const mismatch = hasAadhaarNameMismatch(r.name, r.nameAsPerAadhaar);
              return (
                <span className={mismatch ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                  {r.nameAsPerAadhaar || "—"}
                </span>
              );
            },
          },
          { key: "gender", label: "7. Gender", render: (r) => r.gender || "Male" },
          { key: "dob", label: "8. DOB", render: (r) => fmtDate(r.dob) },
          { key: "father", label: "9. Father Name", render: (r) => r.father || "—" },
          { key: "mother", label: "10. Mother Name", render: (r) => r.mother || "—" },
          {
            key: "penNo",
            label: "11. PEN no",
            render: (r) =>
              r.penNo ? (
                <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 font-mono text-[11px] font-medium">
                  {r.penNo}
                </span>
              ) : (
                <span className="text-muted-foreground">—</span>
              ),
          },
          { key: "studentStateCode", label: "12. State Code", render: (r) => r.studentStateCode || "—" },
          { key: "socialCategory", label: "13. Social Cat", render: (r) => r.socialCategory || r.category || "General" },
          { key: "minorityGroup", label: "14. Minority", render: (r) => r.minorityGroup || "None" },
          {
            key: "bplBeneficiary",
            label: "15. BPL",
            render: (r) => (
              <Badge tone={r.bplBeneficiary === "Yes" ? "amber" : "slate"}>
                {r.bplBeneficiary || "No"}
              </Badge>
            ),
          },
          {
            key: "cwsn",
            label: "16. CWSN",
            render: (r) => (
              <Badge tone={r.cwsn === "Yes" ? "red" : "slate"}>
                {r.cwsn || "No"}
              </Badge>
            ),
          },
          { key: "isRepeater", label: "17. Repeater", render: (r) => r.isRepeater || "No" },
          { key: "entryStatus", label: "18. Entry Status", render: (r) => r.entryStatus || "Regular" },
          { key: "aadhaarNo", label: "19. AADHAAR No", render: (r) => r.aadhaarNo || "—" },
          {
            key: "aadhaarValidationStatus",
            label: "20. AADHAAR Status",
            render: (r) => (
              <Badge
                tone={
                  r.aadhaarValidationStatus === "Verified"
                    ? "green"
                    : r.aadhaarValidationStatus === "Failed"
                    ? "red"
                    : "amber"
                }
              >
                {r.aadhaarValidationStatus || "Pending"}
              </Badge>
            ),
          },
          { key: "mobile", label: "Mobile", render: (r) => r.mobile || "—" },
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

      <ImportFromUdiseModal
        open={udiseModalOpen}
        onOpenChange={setUdiseModalOpen}
      />

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
      <PageHeader
        title="Add Student"
        subtitle="Register a new student into the current academic session."
      />

      <Panel title="Single Student Registration">
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
  const nameMismatch = hasAadhaarNameMismatch(student.name, student.nameAsPerAadhaar);

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
          {["personal", "identity", "parents", "attendance", "fees", "results", "payments"].map((t) => (
            <TabsTrigger key={t} value={t} className="capitalize">{t === "identity" ? "Identity & UDISE+" : t}</TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="personal">
          <Panel>
            {student.photo && (
              <div className="mb-6 flex items-center gap-4 border-b pb-4">
                <img
                  src={student.photo}
                  alt={student.name}
                  className="size-20 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
                />
                <div>
                  <h3 className="text-lg font-bold">{student.name}</h3>
                  <p className="text-sm text-muted-foreground">{student.admissionNo} • Class {student.className}-{student.section}</p>
                </div>
              </div>
            )}
            <div className="grid gap-x-8 sm:grid-cols-2">
              <Field label="Admission Number" value={student.admissionNo} />
              <Field label="Date of Birth" value={fmtDate(student.dob)} />
              <Field label="Gender" value={student.gender} />
              <Field label="Blood Group" value={student.bloodGroup} />
              <Field label="Category" value={student.socialCategory || student.category} />
              <Field label="Admission Date" value={fmtDate(student.admissionDate)} />
              <Field label="Mobile" value={student.mobile} />
              <Field label="Email" value={student.email} />
              <Field label="Address" value={`${student.address || ""}, ${student.city || ""}, ${student.state || ""} ${student.pin || ""}`} />
              <Field label="Previous School" value={student.previousSchool} />
            </div>
          </Panel>
        </TabsContent>

        <TabsContent value="identity">
          <Panel title="Official Identity &amp; UDISE+ Government Data">
            {nameMismatch && (
              <div className="mb-6 flex items-start gap-2 rounded-lg border border-red-300 bg-red-50 p-3 text-xs text-red-800 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                <AlertTriangle className="mt-0.5 size-4 shrink-0 text-red-600 dark:text-red-400" />
                <div>
                  <p className="font-bold">AADHAAR Name Discrepancy</p>
                  <p>Registered Name: <b>{student.name}</b> • Name As Per AADHAAR: <b className="underline">{student.nameAsPerAadhaar}</b></p>
                </div>
              </div>
            )}
            <div className="grid gap-x-8 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="AADHAAR No" value={student.aadhaarNo || "—"} />
              <Field label="Name As per AADHAAR" value={student.nameAsPerAadhaar || "—"} />
              <Field label="AADHAAR Validation Status" value={student.aadhaarValidationStatus || "Pending"} />
              <Field label="PEN no (Permanent Education No)" value={student.penNo || "—"} />
              <Field label="Student State Code" value={student.studentStateCode || "—"} />
              <Field label="Social Category" value={student.socialCategory || student.category || "General"} />
              <Field label="Minority Group" value={student.minorityGroup || "None"} />
              <Field label="BPL beneficiary" value={student.bplBeneficiary || "No"} />
              <Field label="CWSN (Special Needs)" value={student.cwsn || "No"} />
              <Field label="Is Repeater" value={student.isRepeater || "No"} />
              <Field label="Entry Status" value={student.entryStatus || "Regular"} />
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
                {s.photo ? (
                  <img
                    src={s.photo}
                    alt={s.name}
                    className="size-16 rounded-full object-cover border-2 border-slate-800 shadow-sm"
                  />
                ) : (
                  <div className="flex size-16 items-center justify-center rounded-full border-2 border-slate-800 text-lg font-black">
                    {initials(s.name)}
                  </div>
                )}
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
