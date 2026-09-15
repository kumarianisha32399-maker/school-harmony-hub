"use client";

import { useMemo, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  FileSpreadsheet,
  Layers,
  Loader2,
  Pencil,
  Plus,
  Printer,
  Search,
  Trash2,
  Upload,
  UserCheck,
  UserPlus,
  Users,
  X,
} from "lucide-react";
import { useApp } from "@/context/AppContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge, useGoto } from "@/modules/shared";
import {
  EmptyState,
  FormModal,
  PageHeader,
  Panel,
  SelectField,
  TextField,
  useConfirm,
} from "@/components/common/Ui";
import {
  ParsedStudentRow,
  downloadStudentImportTemplate,
  exportStudentsToExcel,
  hasAadhaarNameMismatch,
  parseStudentExcel,
} from "@/utils/excel";
import { exportCsv, fmtDate, initials, printArea } from "@/utils/helpers";
import { CATEGORY } from "@/data/seed";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const MINORITY_GROUPS = ["None", "Muslim", "Christian", "Sikh", "Buddhist", "Parsi", "Jain", "Other"];
const YES_NO = ["No", "Yes"];
const ENTRY_STATUSES = ["Regular", "New Admission", "Transferred In", "Direct Admission"];
const AADHAAR_STATUSES = ["Pending", "Verified", "Failed", "Not Provided"];

const BLANK_STUDENT = {
  admissionNo: "",
  name: "",
  father: "",
  mother: "",
  dob: "",
  gender: "Male",
  mobile: "",
  email: "",
  address: "",
  city: "Indore",
  state: "Madhya Pradesh",
  pin: "",
  className: "V",
  section: "A",
  rollNo: 1,
  admissionDate: new Date().toISOString().slice(0, 10),
  session: "2025-26",
  category: "General",
  bloodGroup: "O+",
  photo: "",
  guardian: "",
  occupation: "",
  previousSchool: "",
  status: "Active",
  // UDISE+ and Aadhaar fields
  penNo: "",
  studentStateCode: "",
  socialCategory: "General",
  minorityGroup: "None",
  bplBeneficiary: "No",
  cwsn: "No",
  isRepeater: "No",
  entryStatus: "Regular",
  aadhaarNo: "",
  nameAsPerAadhaar: "",
  aadhaarValidationStatus: "Pending",
};

/**
 * Quick Student Edit Modal for UDISE Fields
 */
function UdiseEditModal({
  open,
  onOpenChange,
  student,
  onSave,
  classes,
  sections,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  student: any;
  onSave: (data: any) => void;
  classes: string[];
  sections: string[];
}) {
  const [form, setForm] = useState<any>(student || BLANK_STUDENT);
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  const handleSubmit = () => {
    if (!form.name?.trim()) {
      toast.error("Student Name is required.");
      return;
    }
    onSave(form);
    onOpenChange(false);
  };

  return (
    <FormModal
      open={open}
      onOpenChange={onOpenChange}
      title={student?.id ? `Edit UDISE Details — ${student.name}` : "Add UDISE Record"}
      onSubmit={handleSubmit}
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="sm:col-span-2 lg:col-span-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
            Standard Identification &amp; Demographics
          </h4>
        </div>
        <TextField label="Admission Number" value={form.admissionNo} onChange={(v) => set("admissionNo", v)} required />
        <TextField label="Student Name" value={form.name} onChange={(v) => set("name", v)} required />
        <SelectField label="Class" value={form.className} onChange={(v) => set("className", v)} options={classes} />
        <SelectField label="Section" value={form.section} onChange={(v) => set("section", v)} options={sections} />
        <SelectField label="Gender" value={form.gender} onChange={(v) => set("gender", v)} options={["Male", "Female", "Other"]} />
        <TextField label="Date of Birth" type="date" value={form.dob} onChange={(v) => set("dob", v)} />
        <TextField label="Father's Name" value={form.father} onChange={(v) => set("father", v)} />
        <TextField label="Mother's Name" value={form.mother} onChange={(v) => set("mother", v)} />

        <div className="sm:col-span-2 lg:col-span-3 mt-3">
          <h4 className="text-xs font-bold uppercase tracking-wider text-muted-foreground border-b pb-1 mb-2">
            UDISE+ &amp; AADHAAR Official Fields (All 19 Columns)
          </h4>
        </div>
        <TextField label="PEN no (Permanent Education No)" value={form.penNo} onChange={(v) => set("penNo", v)} />
        <TextField label="Student State Code" value={form.studentStateCode} onChange={(v) => set("studentStateCode", v)} />
        <TextField label="AADHAAR No" value={form.aadhaarNo} onChange={(v) => set("aadhaarNo", v)} />
        <TextField label="Name As per AADHAAR" value={form.nameAsPerAadhaar} onChange={(v) => set("nameAsPerAadhaar", v)} />
        <SelectField label="AADHAAR Validation Status" value={form.aadhaarValidationStatus} onChange={(v) => set("aadhaarValidationStatus", v)} options={AADHAAR_STATUSES} />
        <SelectField label="Social Category" value={form.socialCategory || form.category} onChange={(v) => { set("socialCategory", v); set("category", v); }} options={CATEGORY} />
        <SelectField label="Minority Group" value={form.minorityGroup} onChange={(v) => set("minorityGroup", v)} options={MINORITY_GROUPS} />
        <SelectField label="BPL beneficiary" value={form.bplBeneficiary} onChange={(v) => set("bplBeneficiary", v)} options={YES_NO} />
        <SelectField label="CWSN (Special Needs)" value={form.cwsn} onChange={(v) => set("cwsn", v)} options={YES_NO} />
        <SelectField label="Is Repeater" value={form.isRepeater} onChange={(v) => set("isRepeater", v)} options={YES_NO} />
        <SelectField label="Entry Status" value={form.entryStatus} onChange={(v) => set("entryStatus", v)} options={ENTRY_STATUSES} />
      </div>
    </FormModal>
  );
}

/**
 * UDISE Import Data Component
 * Allows Admin to import student data from Excel into UDISE dataset
 */
export function UdiseImport() {
  const { importUdiseStudents } = useApp();
  const goto = useGoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);
  const [importedCount, setImportedCount] = useState<number | null>(null);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setSheetNames([]);
    setActiveSheet("");
    setLoading(false);
    setParsing(false);
    setImportedCount(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (selectedFile?: File, sheetName?: string) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsing(true);
    setImportedCount(null);
    try {
      const result = await parseStudentExcel(selectedFile, sheetName);
      setParsedRows(result.rows);
      setSheetNames(result.sheetNames);
      setActiveSheet(result.activeSheet);
      toast.success(`Loaded ${result.rows.length} student row(s) from sheet '${result.activeSheet}'.`);
    } catch (err: any) {
      toast.error(err.message || "Failed to parse Excel file.");
      setParsedRows([]);
      setSheetNames([]);
      setActiveSheet("");
    } finally {
      setParsing(false);
    }
  };

  const handleSheetSwitch = async (newSheet: string) => {
    if (!file || newSheet === activeSheet) return;
    await handleFileChange(file, newSheet);
  };

  const validRows = parsedRows.filter((r) => r._isValid);
  const errorRows = parsedRows.filter((r) => !r._isValid);
  const mismatchRows = parsedRows.filter((r) => r._nameMismatch);

  const handleImport = async () => {
    if (!validRows.length) {
      toast.error("No valid student rows to import.");
      return;
    }

    setLoading(true);
    try {
      const res = await importUdiseStudents(validRows);
      if (res.success) {
        setImportedCount(res.count);
        toast.success(`Successfully imported ${res.count} student(s) into Import Student List!`);
      } else {
        toast.error(res.error || "UDISE bulk import failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="UDISE Import Data"
        subtitle="Import student master records from Microsoft Excel or CSV into the UDISE dataset with standard 19 columns."
        actions={
          <div className="flex flex-wrap items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadStudentImportTemplate("xlsx")}
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Download className="size-4 text-emerald-600" />
              Download Sample .XLSX
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => downloadStudentImportTemplate("csv")}
              className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900/40"
            >
              <Download className="size-4" />
              Download Sample .CSV
            </Button>
            <Button
              variant="default"
              size="sm"
              onClick={() => goto("udise/students")}
              className="gap-1.5"
            >
              <Users className="size-4" />
              View Import Student List
            </Button>
          </div>
        }
      />

      {/* Instructions Card */}
      <Panel>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h3 className="text-base font-bold text-foreground">Official 19-Column UDISE+ Standard Format</h3>
            <p className="mt-1 text-xs text-muted-foreground leading-relaxed max-w-3xl">
              Upload spreadsheets formatted according to the Ministry of Education UDISE+ specification. The system automatically detects and maps: <b>Admission Number, Class, Section, Name, Gender, PEN no, Student State Code, DOB, Father Name, Mother Name, Social Category, Minority Group, BPL beneficiary, CWSN, Is Repeater, Entry Status, AADHAAR No, Name As per AADHAAR,</b> and <b>AADHAAR Validation Status</b>.
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:bg-emerald-950/70 dark:text-emerald-300">
              <CheckCircle2 className="size-3.5" /> 19 Columns Supported
            </span>
          </div>
        </div>
      </Panel>

      {/* Success Notification Banner after import */}
      {importedCount !== null && (
        <div className="flex flex-col items-start justify-between gap-3 rounded-xl border border-emerald-300 bg-emerald-50 p-4 sm:flex-row sm:items-center dark:border-emerald-800 dark:bg-emerald-950/50">
          <div className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-emerald-200 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              <CheckCircle2 className="size-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-100">
                UDISE Data Imported Successfully!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-300">
                {importedCount} student records have been saved into the <b>Import Student List</b>. You can now view them or import them directly into the main Student List.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              onClick={() => goto("udise/students")}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              View Import Student List <ArrowRight className="size-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={resetState}
              className="border-emerald-300 text-emerald-800 dark:border-emerald-800 dark:text-emerald-200"
            >
              Import Another File
            </Button>
          </div>
        </div>
      )}

      {/* Upload Zone */}
      <Panel>
        {!file ? (
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(false);
              const droppedFile = e.dataTransfer.files?.[0];
              if (droppedFile) handleFileChange(droppedFile);
            }}
            onClick={() => fileInputRef.current?.click()}
            className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-10 text-center transition-all ${
              dragOver
                ? "border-primary bg-primary/5 shadow-inner"
                : "border-border hover:border-primary/60 hover:bg-muted/30"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .xlsm, .xlsb, .csv, .tsv, .txt, .ods, .fods, .xml, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, application/vnd.ms-excel, application/vnd.ms-excel.sheet.macroEnabled.12, application/vnd.ms-excel.sheet.binary.macroEnabled.12, text/csv, text/tab-separated-values, text/plain, application/vnd.oasis.opendocument.spreadsheet, application/xml, text/xml"
              className="hidden"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) handleFileChange(f);
              }}
            />
            <div className="flex size-16 items-center justify-center rounded-2xl bg-primary/10 text-primary shadow-sm">
              <Upload className="size-8" />
            </div>
            <h4 className="mt-4 text-base font-semibold text-foreground">
              Select or Drag &amp; Drop your UDISE Excel File
            </h4>
            <p className="mt-1 text-xs text-muted-foreground max-w-md">
              Supports Microsoft Excel (.xlsx, .xls, .xlsm, .xlsb), OpenDocument (.ods), CSV, and TSV spreadsheets.
            </p>
            <Button type="button" variant="outline" size="sm" className="mt-4 pointer-events-none">
              <FileSpreadsheet className="size-4 mr-1.5 text-emerald-600" /> Browse File
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/40 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3.5">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                  <FileSpreadsheet className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} rows detected
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {sheetNames.length > 1 && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2.5 py-1 text-xs shadow-sm">
                    <Layers className="size-3.5 text-muted-foreground" />
                    <span className="text-muted-foreground">Sheet:</span>
                    <select
                      value={activeSheet}
                      onChange={(e) => handleSheetSwitch(e.target.value)}
                      className="bg-transparent font-medium text-foreground focus:outline-none"
                    >
                      {sheetNames.map((s) => (
                        <option key={s} value={s}>
                          {s}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <Button
                  variant="outline"
                  size="sm"
                  disabled={loading}
                  onClick={resetState}
                  className="gap-1.5"
                >
                  <X className="size-4" /> Change File
                </Button>
              </div>
            </div>

            {parsing && (
              <div className="flex items-center justify-center gap-2 py-10 text-sm text-muted-foreground">
                <Loader2 className="size-5 animate-spin text-primary" />
                Reading Excel workbook and mapping columns…
              </div>
            )}

            {parsedRows.length > 0 && !parsing && (
              <div className="space-y-4 pt-2">
                {/* Stats */}
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                  <div className="rounded-xl border border-border bg-card p-3.5 shadow-sm">
                    <span className="text-xs font-medium text-muted-foreground">Total Rows in Sheet</span>
                    <p className="mt-1 text-2xl font-bold">{parsedRows.length}</p>
                  </div>
                  <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-3.5 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Ready to Import</span>
                    <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                      {validRows.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-red-200 bg-red-50/60 p-3.5 shadow-sm dark:border-red-900/60 dark:bg-red-950/30">
                    <span className="text-xs font-semibold text-red-700 dark:text-red-400">Errors (Missing Required)</span>
                    <p className="mt-1 text-2xl font-bold text-red-700 dark:text-red-400">
                      {errorRows.length}
                    </p>
                  </div>
                  <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-3.5 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
                    <span className="text-xs font-semibold text-amber-700 dark:text-amber-400">Aadhaar Name Discrepancies</span>
                    <p className="mt-1 text-2xl font-bold text-amber-700 dark:text-amber-400">
                      {mismatchRows.length}
                    </p>
                  </div>
                </div>

                {mismatchRows.length > 0 && (
                  <div className="flex items-start gap-2.5 rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0 text-amber-600 dark:text-amber-400" />
                    <span>
                      <b>Verification Notice:</b> {mismatchRows.length} student(s) have a registered <b>Name</b> that does not match their <b>Name As per AADHAAR</b>. These entries are flagged below with orange tags for review.
                    </span>
                  </div>
                )}

                {/* Preview Table with 19 Columns */}
                <div className="rounded-xl border border-border shadow-sm overflow-hidden">
                  <div className="flex items-center justify-between border-b border-border bg-muted/50 px-4 py-2.5">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Data Preview ({parsedRows.length} Rows)
                    </span>
                    <span className="text-xs text-muted-foreground">
                      Scroll horizontally to view all 19 UDISE columns
                    </span>
                  </div>
                  <div className="max-h-96 overflow-x-auto overflow-y-auto">
                    <table className="w-full text-left text-xs whitespace-nowrap">
                      <thead className="sticky top-0 bg-muted text-muted-foreground font-semibold">
                        <tr className="divide-x divide-border border-b border-border">
                          <th className="px-3 py-2.5">#</th>
                          <th className="px-3 py-2.5">Status</th>
                          <th className="px-3 py-2.5">1. Admission No</th>
                          <th className="px-3 py-2.5">2. Class</th>
                          <th className="px-3 py-2.5">3. Section</th>
                          <th className="px-3 py-2.5">4. Student Name</th>
                          <th className="px-3 py-2.5">5. Gender</th>
                          <th className="px-3 py-2.5">6. PEN no</th>
                          <th className="px-3 py-2.5">7. Student State Code</th>
                          <th className="px-3 py-2.5">8. DOB</th>
                          <th className="px-3 py-2.5">9. Father Name</th>
                          <th className="px-3 py-2.5">10. Mother Name</th>
                          <th className="px-3 py-2.5">11. Social Category</th>
                          <th className="px-3 py-2.5">12. Minority Group</th>
                          <th className="px-3 py-2.5">13. BPL Beneficiary</th>
                          <th className="px-3 py-2.5">14. CWSN</th>
                          <th className="px-3 py-2.5">15. Is Repeater</th>
                          <th className="px-3 py-2.5">16. Entry Status</th>
                          <th className="px-3 py-2.5">17. AADHAAR No</th>
                          <th className="px-3 py-2.5">18. Name As per AADHAAR</th>
                          <th className="px-3 py-2.5">19. AADHAAR Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {parsedRows.map((r, i) => {
                          const isMismatch = r._nameMismatch;
                          return (
                            <tr
                              key={i}
                              className={`divide-x divide-border transition-colors ${
                                !r._isValid
                                  ? "bg-red-50/70 dark:bg-red-950/30"
                                  : isMismatch
                                  ? "bg-amber-50/50 dark:bg-amber-950/20"
                                  : "hover:bg-muted/30"
                              }`}
                            >
                              <td className="px-3 py-2 text-muted-foreground">{r._rawRowIndex}</td>
                              <td className="px-3 py-2">
                                {!r._isValid ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-red-100 px-1.5 py-0.5 font-medium text-red-700 dark:bg-red-950/80 dark:text-red-300">
                                    <AlertCircle className="size-3" /> Error
                                  </span>
                                ) : isMismatch ? (
                                  <span className="inline-flex items-center gap-1 rounded bg-amber-100 px-1.5 py-0.5 font-medium text-amber-800 dark:bg-amber-950/80 dark:text-amber-300">
                                    <AlertTriangle className="size-3" /> Name Diff
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 rounded bg-emerald-100 px-1.5 py-0.5 font-medium text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300">
                                    <CheckCircle2 className="size-3" /> Ready
                                  </span>
                                )}
                              </td>
                              <td className="px-3 py-2 font-mono font-medium">{r.admissionNo || "Auto-Gen"}</td>
                              <td className="px-3 py-2 font-medium">{r.className || "—"}</td>
                              <td className="px-3 py-2">{r.section || "A"}</td>
                              <td className="px-3 py-2">
                                <span className={`font-semibold ${isMismatch ? "text-amber-700 dark:text-amber-400" : "text-foreground"}`}>
                                  {r.name || <span className="italic text-red-500">Missing Name</span>}
                                </span>
                              </td>
                              <td className="px-3 py-2">{r.gender || "—"}</td>
                              <td className="px-3 py-2 font-mono">{r.penNo || "—"}</td>
                              <td className="px-3 py-2">{r.studentStateCode || "—"}</td>
                              <td className="px-3 py-2">{r.dob || "—"}</td>
                              <td className="px-3 py-2">{r.father || "—"}</td>
                              <td className="px-3 py-2">{r.mother || "—"}</td>
                              <td className="px-3 py-2">{r.socialCategory || "—"}</td>
                              <td className="px-3 py-2">{r.minorityGroup || "—"}</td>
                              <td className="px-3 py-2">{r.bplBeneficiary || "—"}</td>
                              <td className="px-3 py-2">{r.cwsn || "—"}</td>
                              <td className="px-3 py-2">{r.isRepeater || "—"}</td>
                              <td className="px-3 py-2">{r.entryStatus || "—"}</td>
                              <td className="px-3 py-2 font-mono">{r.aadhaarNo || "—"}</td>
                              <td className="px-3 py-2">
                                <span className={isMismatch ? "font-semibold text-red-600 dark:text-red-400 underline" : ""}>
                                  {r.nameAsPerAadhaar || "—"}
                                </span>
                              </td>
                              <td className="px-3 py-2">{r.aadhaarValidationStatus || "—"}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Import Action Bar */}
                <div className="flex flex-col-reverse justify-end gap-3 pt-3 sm:flex-row sm:items-center">
                  <Button
                    type="button"
                    variant="outline"
                    disabled={loading}
                    onClick={resetState}
                  >
                    Cancel / Discard
                  </Button>
                  <Button
                    type="button"
                    onClick={handleImport}
                    disabled={loading || validRows.length === 0}
                    className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
                    size="lg"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="size-5 animate-spin" />
                        Importing {validRows.length} Student(s) into UDISE List…
                      </>
                    ) : (
                      <>
                        <Upload className="size-5" />
                        Import {validRows.length} Student(s) to Import Student List
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </Panel>
    </div>
  );
}

/**
 * UDISE Import Student List Component
 * Shows ONLY the imported student data with all 19 fields present in an interactive table
 */
export function UdiseStudentList() {
  const { udiseStudents, classes, sections, update, remove, transferUdiseToStudents } = useApp();
  const goto = useGoto();
  const { confirm, dialog } = useConfirm();

  const [query, setQuery] = useState("");
  const [cls, setCls] = useState("All");
  const [sec, setSec] = useState("All");
  const [gender, setGender] = useState("All");
  const [category, setCategory] = useState("All");
  const [aadhaarFilter, setAadhaarFilter] = useState("All");
  const [importStatusFilter, setImportStatusFilter] = useState("All");
  const [mismatchOnly, setMismatchOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [transferring, setTransferring] = useState(false);
  const pageSize = 15;

  const [editStudent, setEditStudent] = useState<any>(null);
  const [editOpen, setEditOpen] = useState(false);

  // Filtered rows from udiseStudents (showing ONLY imported data)
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return udiseStudents.filter((s: any) => {
      if (cls !== "All" && s.className !== cls) return false;
      if (sec !== "All" && s.section !== sec) return false;
      if (gender !== "All" && s.gender !== gender) return false;
      if (category !== "All" && (s.socialCategory || s.category) !== category) return false;
      if (aadhaarFilter !== "All" && (s.aadhaarValidationStatus || "Pending") !== aadhaarFilter) return false;
      if (importStatusFilter === "Unimported" && s.importedToStudents) return false;
      if (importStatusFilter === "Imported" && !s.importedToStudents) return false;

      const isMismatch = hasAadhaarNameMismatch(s.name, s.nameAsPerAadhaar);
      if (mismatchOnly && !isMismatch) return false;

      if (q) {
        const fieldsToSearch = [
          s.name,
          s.admissionNo,
          s.penNo,
          s.aadhaarNo,
          s.nameAsPerAadhaar,
          s.father,
          s.mother,
          s.studentStateCode,
          s.className,
          s.section,
        ];
        return fieldsToSearch.some((v) => String(v ?? "").toLowerCase().includes(q));
      }
      return true;
    });
  }, [udiseStudents, cls, sec, gender, category, aadhaarFilter, importStatusFilter, mismatchOnly, query]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pageRows = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  // Statistics
  const stats = useMemo(() => {
    let verifiedAadhaar = 0;
    let pendingAadhaar = 0;
    let nameMismatches = 0;
    let unimportedCount = 0;
    let importedToStudentsCount = 0;

    udiseStudents.forEach((s: any) => {
      if (s.aadhaarValidationStatus === "Verified") verifiedAadhaar++;
      else pendingAadhaar++;

      if (hasAadhaarNameMismatch(s.name, s.nameAsPerAadhaar)) nameMismatches++;
      if (s.importedToStudents) importedToStudentsCount++;
      else unimportedCount++;
    });

    return {
      total: udiseStudents.length,
      verifiedAadhaar,
      pendingAadhaar,
      nameMismatches,
      unimportedCount,
      importedToStudentsCount,
    };
  }, [udiseStudents]);

  const handleEdit = (student: any) => {
    setEditStudent(student);
    setEditOpen(true);
  };

  const handleSaveEdit = (form: any) => {
    if (editStudent?.id) {
      update("udiseStudents", editStudent.id, form);
      toast.success("UDISE Imported Student record updated successfully.");
    }
  };

  const handleTransfer = async (ids?: string[]) => {
    const targetIds = ids || selectedIds;
    setTransferring(true);
    try {
      const res = await transferUdiseToStudents(targetIds.length ? targetIds : undefined);
      if (res.success) {
        toast.success(`Successfully enrolled ${res.count} student(s) into Student List!`);
        setSelectedIds([]);
      } else {
        toast.error(res.error || "Failed to transfer students.");
      }
    } catch (err: any) {
      toast.error(err.message || "An error occurred.");
    } finally {
      setTransferring(false);
    }
  };

  const toggleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(pageRows.map((r: any) => r.id));
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Import Student List"
        subtitle={`Showing only imported UDISE records (${filtered.length} of ${udiseStudents.length} rows) with all 19 columns.`}
        actions={
          <div className="flex flex-wrap items-center gap-2">
            {stats.unimportedCount > 0 && (
              <Button
                size="sm"
                onClick={() => handleTransfer(selectedIds.length ? selectedIds : undefined)}
                disabled={transferring}
                className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
              >
                {transferring ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <UserPlus className="size-4" />
                )}
                {selectedIds.length > 0
                  ? `Enroll Selected (${selectedIds.length}) to Student List`
                  : `Enroll All Pending (${stats.unimportedCount}) to Student List`}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportStudentsToExcel(filtered, "UDISE_Imported_Student_List.xlsx")}
              className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
            >
              <Download className="size-4 text-emerald-600" />
              Export .XLSX (19 Cols)
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => exportCsv("udise_imported_students", filtered)}
              className="gap-1.5"
            >
              <Download className="size-4" />
              Export CSV
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => printArea("udise-table-container")}
              className="gap-1.5"
            >
              <Printer className="size-4" />
              Print
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => goto("udise/import")}
              className="gap-2"
            >
              <FileSpreadsheet className="size-4 text-emerald-600" />
              Import More Data
            </Button>
          </div>
        }
      />

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl border border-border bg-card p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground">Total Imported Records</span>
            <FileSpreadsheet className="size-4 text-primary" />
          </div>
          <p className="mt-2 text-2xl font-bold">{stats.total}</p>
          <p className="mt-0.5 text-[11px] text-muted-foreground">In UDISE import staging</p>
        </div>

        <div className="rounded-xl border border-amber-200 bg-amber-50/60 p-4 shadow-sm dark:border-amber-900/60 dark:bg-amber-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-amber-800 dark:text-amber-300">Pending Enrollment</span>
            <Clock className="size-4 text-amber-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-amber-700 dark:text-amber-300">
            {stats.unimportedCount}
          </p>
          <p className="mt-0.5 text-[11px] text-amber-600 dark:text-amber-400">
            Not yet added to Student List
          </p>
        </div>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50/60 p-4 shadow-sm dark:border-emerald-900/60 dark:bg-emerald-950/30">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-emerald-800 dark:text-emerald-300">Enrolled to Student List</span>
            <CheckCircle2 className="size-4 text-emerald-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
            {stats.importedToStudentsCount}
          </p>
          <p className="mt-0.5 text-[11px] text-emerald-600 dark:text-emerald-400">
            Active in school roster
          </p>
        </div>

        <div
          onClick={() => setMismatchOnly(!mismatchOnly)}
          className={`cursor-pointer rounded-xl border p-4 shadow-sm transition-all ${
            mismatchOnly
              ? "border-red-500 bg-red-100/80 dark:bg-red-950/60 ring-2 ring-red-400"
              : "border-red-200 bg-red-50/60 dark:border-red-900/60 dark:bg-red-950/30 hover:border-red-400"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-red-800 dark:text-red-300">Name Discrepancies</span>
            <AlertTriangle className="size-4 text-red-600" />
          </div>
          <p className="mt-2 text-2xl font-bold text-red-700 dark:text-red-300">
            {stats.nameMismatches}
          </p>
          <p className="mt-0.5 text-[11px] text-red-600 dark:text-red-400">
            {mismatchOnly ? "Filtering name mismatches" : "Click to filter mismatches"}
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          <div className="relative w-full sm:w-72">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(1);
              }}
              placeholder="Search Name, PEN, Aadhaar, Adm No…"
              className="pl-9"
            />
          </div>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            value={importStatusFilter}
            onChange={(e) => {
              setImportStatusFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Enrollment: All</option>
            <option value="Unimported">Pending Enrollment</option>
            <option value="Imported">Enrolled in Student List</option>
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            value={cls}
            onChange={(e) => {
              setCls(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Class: All</option>
            {classes.map((c) => (
              <option key={c} value={c}>
                Class {c}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            value={sec}
            onChange={(e) => {
              setSec(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Section: All</option>
            {sections.map((s) => (
              <option key={s} value={s}>
                Sec {s}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            value={aadhaarFilter}
            onChange={(e) => {
              setAadhaarFilter(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Aadhaar: All Status</option>
            {AADHAAR_STATUSES.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Category: All</option>
            {CATEGORY.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <select
            className="h-9 rounded-md border border-input bg-background px-3 text-xs"
            value={gender}
            onChange={(e) => {
              setGender(e.target.value);
              setPage(1);
            }}
          >
            <option value="All">Gender: All</option>
            <option value="Male">Male</option>
            <option value="Female">Female</option>
            <option value="Other">Other</option>
          </select>

          {mismatchOnly && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMismatchOnly(false)}
              className="text-xs text-muted-foreground hover:text-foreground h-9"
            >
              <X className="size-3.5 mr-1" /> Clear Filter
            </Button>
          )}
        </div>
      </div>

      {/* Full 19 Columns Table */}
      <div id="udise-table-container" className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="bg-muted/70 text-muted-foreground uppercase tracking-wider text-[11px]">
              <tr className="divide-x divide-border border-b border-border">
                <th className="px-3 py-3 w-8 text-center">
                  <input
                    type="checkbox"
                    checked={pageRows.length > 0 && selectedIds.length === pageRows.length}
                    onChange={(e) => toggleSelectAll(e.target.checked)}
                    className="rounded border-input"
                  />
                </th>
                <th className="px-3 py-3 font-bold">#</th>
                <th className="px-3 py-3 font-bold">Enrollment Status</th>
                <th className="px-3 py-3 font-bold">1. Adm No</th>
                <th className="px-3 py-3 font-bold">2. Class</th>
                <th className="px-3 py-3 font-bold">3. Sec</th>
                <th className="px-3 py-3 font-bold min-w-[180px]">4. Student Name</th>
                <th className="px-3 py-3 font-bold">5. Gender</th>
                <th className="px-3 py-3 font-bold">6. PEN no</th>
                <th className="px-3 py-3 font-bold">7. State Code</th>
                <th className="px-3 py-3 font-bold">8. DOB</th>
                <th className="px-3 py-3 font-bold">9. Father Name</th>
                <th className="px-3 py-3 font-bold">10. Mother Name</th>
                <th className="px-3 py-3 font-bold">11. Social Category</th>
                <th className="px-3 py-3 font-bold">12. Minority</th>
                <th className="px-3 py-3 font-bold">13. BPL</th>
                <th className="px-3 py-3 font-bold">14. CWSN</th>
                <th className="px-3 py-3 font-bold">15. Repeater</th>
                <th className="px-3 py-3 font-bold">16. Entry Status</th>
                <th className="px-3 py-3 font-bold">17. AADHAAR No</th>
                <th className="px-3 py-3 font-bold min-w-[160px]">18. Name As per AADHAAR</th>
                <th className="px-3 py-3 font-bold">19. AADHAAR Status</th>
                <th className="px-3 py-3 font-bold text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={23} className="px-4 py-16 text-center text-muted-foreground">
                    <EmptyState
                      message={
                        udiseStudents.length === 0
                          ? "No student data has been imported into UDISE yet. Click 'Import Data' to upload an Excel file."
                          : "No imported UDISE student records match your filters."
                      }
                    />
                  </td>
                </tr>
              ) : (
                pageRows.map((r: any, idx: number) => {
                  const nameMismatch = hasAadhaarNameMismatch(r.name, r.nameAsPerAadhaar);
                  const isAadhaarVerified = r.aadhaarValidationStatus === "Verified";
                  const isAadhaarFailed = r.aadhaarValidationStatus === "Failed";
                  const isSelected = selectedIds.includes(r.id);

                  return (
                    <tr
                      key={r.id || idx}
                      className={`divide-x divide-border transition-colors hover:bg-muted/40 ${
                        nameMismatch ? "bg-amber-50/40 dark:bg-amber-950/20" : ""
                      } ${isSelected ? "bg-primary/5" : ""}`}
                    >
                      <td className="px-3 py-2.5 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => toggleSelectRow(r.id)}
                          className="rounded border-input"
                        />
                      </td>
                      <td className="px-3 py-2.5 text-muted-foreground text-center">
                        {(currentPage - 1) * pageSize + idx + 1}
                      </td>
                      <td className="px-3 py-2.5">
                        {r.importedToStudents ? (
                          <span className="inline-flex items-center gap-1 rounded bg-emerald-100 dark:bg-emerald-950/80 px-2 py-0.5 text-[10px] font-semibold text-emerald-800 dark:text-emerald-300">
                            <CheckCircle2 className="size-3" /> Enrolled in Students
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded bg-amber-100 dark:bg-amber-950/80 px-2 py-0.5 text-[10px] font-semibold text-amber-800 dark:text-amber-300">
                            <Clock className="size-3" /> Pending Enrollment
                          </span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono font-semibold text-primary">
                        {r.admissionNo || "—"}
                      </td>
                      <td className="px-3 py-2.5 font-medium">{r.className || "—"}</td>
                      <td className="px-3 py-2.5">{r.section || "A"}</td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center gap-2">
                          <span className="flex size-7 items-center justify-center rounded-full bg-primary/10 text-[10px] font-bold text-primary shrink-0">
                            {initials(r.name)}
                          </span>
                          <div>
                            <span className={`block font-semibold ${nameMismatch ? "text-red-600 dark:text-red-400" : "text-foreground"}`}>
                              {r.name}
                            </span>
                            {nameMismatch && (
                              <span
                                className="inline-flex items-center gap-0.5 rounded bg-red-100 dark:bg-red-950/80 px-1 py-0.2 text-[9px] font-bold text-red-700 dark:text-red-300"
                                title={`Discrepancy with Aadhaar Name: ${r.nameAsPerAadhaar}`}
                              >
                                <AlertTriangle className="size-2.5" /> Mismatch
                              </span>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2.5">{r.gender || "Male"}</td>
                      <td className="px-3 py-2.5 font-mono">
                        {r.penNo ? (
                          <span className="rounded bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 text-[11px] font-medium">
                            {r.penNo}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5 font-mono">{r.studentStateCode || "—"}</td>
                      <td className="px-3 py-2.5">{fmtDate(r.dob)}</td>
                      <td className="px-3 py-2.5">{r.father || "—"}</td>
                      <td className="px-3 py-2.5">{r.mother || "—"}</td>
                      <td className="px-3 py-2.5">
                        <span className="rounded-md border border-border px-1.5 py-0.5 text-[10px] font-medium">
                          {r.socialCategory || r.category || "General"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">{r.minorityGroup || "None"}</td>
                      <td className="px-3 py-2.5">
                        <Badge tone={r.bplBeneficiary === "Yes" ? "amber" : "slate"}>
                          {r.bplBeneficiary || "No"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge tone={r.cwsn === "Yes" ? "red" : "slate"}>
                          {r.cwsn || "No"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5">{r.isRepeater || "No"}</td>
                      <td className="px-3 py-2.5">{r.entryStatus || "Regular"}</td>
                      <td className="px-3 py-2.5 font-mono">
                        {r.aadhaarNo ? (
                          <span className="font-semibold text-slate-700 dark:text-slate-300">
                            {r.aadhaarNo}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-3 py-2.5">
                        <span className={nameMismatch ? "font-semibold text-red-600 dark:text-red-400" : ""}>
                          {r.nameAsPerAadhaar || "—"}
                        </span>
                      </td>
                      <td className="px-3 py-2.5">
                        <Badge
                          tone={
                            isAadhaarVerified
                              ? "green"
                              : isAadhaarFailed
                              ? "red"
                              : "amber"
                          }
                        >
                          {r.aadhaarValidationStatus || "Pending"}
                        </Badge>
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <div className="flex items-center justify-center gap-1">
                          {!r.importedToStudents && (
                            <Button
                              size="sm"
                              variant="outline"
                              className="h-7 text-[11px] gap-1 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300"
                              onClick={() => handleTransfer([r.id])}
                              title="Enroll this student into Student List"
                            >
                              <UserPlus className="size-3" /> Enroll
                            </Button>
                          )}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7"
                            onClick={() => handleEdit(r)}
                            title="Edit Record"
                          >
                            <Pencil className="size-3.5" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="size-7 text-destructive hover:text-destructive"
                            onClick={() =>
                              confirm(`Delete UDISE record for ${r.name}?`, () => {
                                remove("udiseStudents", r.id);
                                toast.success("Record deleted.");
                              })
                            }
                            title="Delete Record"
                          >
                            <Trash2 className="size-3.5" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-border bg-muted/30 px-4 py-3 text-xs text-muted-foreground sm:flex-row">
          <span>
            Showing {filtered.length ? (currentPage - 1) * pageSize + 1 : 0}–
            {(currentPage - 1) * pageSize + pageRows.length} of {filtered.length} imported students
          </span>
          <div className="flex items-center gap-1">
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === 1}
              onClick={() => setPage(currentPage - 1)}
              className="h-8 text-xs"
            >
              Previous
            </Button>
            <span className="px-3 font-semibold text-foreground">
              {currentPage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={currentPage === totalPages}
              onClick={() => setPage(currentPage + 1)}
              className="h-8 text-xs"
            >
              Next
            </Button>
          </div>
        </div>
      </div>

      {editStudent && (
        <UdiseEditModal
          open={editOpen}
          onOpenChange={setEditOpen}
          student={editStudent}
          onSave={handleSaveEdit}
          classes={classes}
          sections={sections}
        />
      )}

      {dialog}
    </div>
  );
}

/**
 * UDISE Hub Overview Module (handles /app/udise)
 * Displays 2 sub-sections: Import Data & Import Student List with quick tabs
 */
export function UdiseHub() {
  const [tab, setTab] = useState<"list" | "import">("list");

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={(v: any) => setTab(v)} className="w-full">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-border pb-3">
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
              <FileSpreadsheet className="size-6 text-emerald-600" />
              UDISE+ Management Portal
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage school UDISE records, bulk Excel data ingestion, and 19-column student datasets.
            </p>
          </div>
          <TabsList className="grid grid-cols-2 w-full sm:w-auto">
            <TabsTrigger value="list" className="gap-2">
              <Users className="size-4" /> Import Student List
            </TabsTrigger>
            <TabsTrigger value="import" className="gap-2">
              <Upload className="size-4" /> Import Data
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="list" className="mt-6">
          <UdiseStudentList />
        </TabsContent>
        <TabsContent value="import" className="mt-6">
          <UdiseImport />
        </TabsContent>
      </Tabs>
    </div>
  );
}
