"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  Layers,
  Loader2,
  Upload,
  X,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  ParsedStudentRow,
  downloadStudentImportTemplate,
  parseStudentExcel,
} from "@/utils/excel";
import { useApp } from "@/context/AppContext";
import { useGoto } from "@/modules/shared";

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StudentImportModal({ open, onOpenChange, onSuccess }: Props) {
  const { importStudents } = useApp();
  const goto = useGoto();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);
  const [parsedRows, setParsedRows] = useState<ParsedStudentRow[]>([]);
  const [sheetNames, setSheetNames] = useState<string[]>([]);
  const [activeSheet, setActiveSheet] = useState<string>("");
  const [dragOver, setDragOver] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedRows([]);
    setSheetNames([]);
    setActiveSheet("");
    setLoading(false);
    setParsing(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileChange = async (selectedFile?: File, sheetName?: string) => {
    if (!selectedFile) return;
    setFile(selectedFile);
    setParsing(true);
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
      const res = await importStudents(validRows);
      if (res.success) {
        toast.success(`Successfully imported ${res.count} student(s) into database!`);
        resetState();
        onOpenChange(false);
        if (onSuccess) {
          onSuccess();
        } else {
          goto("students");
        }
      } else {
        toast.error(res.error || "Bulk import failed.");
      }
    } catch (err: any) {
      toast.error(err.message || "An unexpected error occurred during import.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(v) => {
        if (!loading) {
          if (!v) resetState();
          onOpenChange(v);
        }
      }}
    >
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto sm:max-w-5xl">
        <DialogHeader>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <FileSpreadsheet className="size-5 text-emerald-600" />
                Import Students from Excel
              </DialogTitle>
              <DialogDescription>
                Supports all Excel formats (.xlsx, .xls, .xlsm, .xlsb, .csv, .tsv, .ods, .xml) with the 19 standard UDISE+ columns.
              </DialogDescription>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadStudentImportTemplate("xlsx")}
                className="gap-2 border-emerald-300 text-emerald-700 hover:bg-emerald-50 dark:border-emerald-800 dark:text-emerald-300 dark:hover:bg-emerald-950/40"
              >
                <Download className="size-4" />
                Sample .XLSX
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => downloadStudentImportTemplate("csv")}
                className="gap-2 border-slate-300 text-slate-700 hover:bg-slate-50 dark:border-slate-700 dark:text-slate-300 dark:hover:bg-slate-900/40"
              >
                <Download className="size-4" />
                Sample .CSV
              </Button>
            </div>
          </div>
        </DialogHeader>

        {/* Upload Box */}
        <div className="space-y-4">
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
              className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 text-center transition-all ${
                dragOver
                  ? "border-primary bg-primary/5 shadow-inner"
                  : "border-border hover:border-primary/50 hover:bg-muted/40"
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
              <div className="flex size-14 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Upload className="size-7" />
              </div>
              <p className="mt-3 text-sm font-semibold text-foreground">
                Click to browse or drag &amp; drop any Excel / Spreadsheet file
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports Microsoft Excel (.xlsx, .xls, .xlsm, .xlsb), OpenDocument (.ods), CSV, TSV, and XML files.
              </p>
            </div>
          ) : (
            <div className="flex flex-col gap-3 rounded-xl border border-border bg-muted/30 p-3 px-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="flex size-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300">
                  <FileSpreadsheet className="size-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB • {parsedRows.length} students in current sheet
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {sheetNames.length > 1 && (
                  <div className="flex items-center gap-1.5 rounded-lg border border-border bg-card px-2 py-1 text-xs">
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
                  variant="ghost"
                  size="sm"
                  disabled={loading}
                  onClick={resetState}
                  className="text-muted-foreground hover:text-foreground"
                >
                  <X className="size-4 mr-1" /> Choose another file
                </Button>
              </div>
            </div>
          )}

          {parsing && (
            <div className="flex items-center justify-center gap-2 py-8 text-sm text-muted-foreground">
              <Loader2 className="size-5 animate-spin text-primary" />
              Reading Excel workbook and mapping columns…
            </div>
          )}

          {parsedRows.length > 0 && !parsing && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-lg border border-border bg-card p-3">
                  <span className="text-xs text-muted-foreground">Total Rows in Sheet</span>
                  <p className="text-xl font-bold">{parsedRows.length}</p>
                </div>
                <div className="rounded-lg border border-emerald-200 bg-emerald-50/50 p-3 dark:border-emerald-900/60 dark:bg-emerald-950/30">
                  <span className="text-xs text-emerald-700 dark:text-emerald-400">Ready to Import</span>
                  <p className="text-xl font-bold text-emerald-700 dark:text-emerald-300">
                    {validRows.length}
                  </p>
                </div>
                <div className="rounded-lg border border-red-200 bg-red-50/50 p-3 dark:border-red-900/60 dark:bg-red-950/30">
                  <span className="text-xs text-red-700 dark:text-red-400">Errors (Missing Fields)</span>
                  <p className="text-xl font-bold text-red-700 dark:text-red-400">
                    {errorRows.length}
                  </p>
                </div>
                <div className="rounded-lg border border-amber-200 bg-amber-50/50 p-3 dark:border-amber-900/60 dark:bg-amber-950/30">
                  <span className="text-xs text-amber-700 dark:text-amber-400">Aadhaar Name Discrepancies</span>
                  <p className="text-xl font-bold text-amber-700 dark:text-amber-400">
                    {mismatchRows.length}
                  </p>
                </div>
              </div>

              {mismatchRows.length > 0 && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-xs text-amber-800 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                  <span>
                    <b>Notice:</b> {mismatchRows.length} student(s) have a registered <b>Name</b> that differs from their <b>Name As per AADHAAR</b>. These entries are highlighted in red below and will be flagged in the Student List.
                  </span>
                </div>
              )}

              {/* Data Preview Table */}
              <div className="overflow-hidden rounded-xl border border-border">
                <div className="max-h-72 overflow-x-auto overflow-y-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="sticky top-0 bg-muted/90 text-muted-foreground backdrop-blur">
                      <tr>
                        <th className="px-3 py-2 font-semibold">#</th>
                        <th className="px-3 py-2 font-semibold">Status</th>
                        <th className="px-3 py-2 font-semibold">Adm No</th>
                        <th className="px-3 py-2 font-semibold">Student Name</th>
                        <th className="px-3 py-2 font-semibold">Name As per Aadhaar</th>
                        <th className="px-3 py-2 font-semibold">Class-Sec</th>
                        <th className="px-3 py-2 font-semibold">Gender</th>
                        <th className="px-3 py-2 font-semibold">DOB</th>
                        <th className="px-3 py-2 font-semibold">Father Name</th>
                        <th className="px-3 py-2 font-semibold">Mother Name</th>
                        <th className="px-3 py-2 font-semibold">PEN No</th>
                        <th className="px-3 py-2 font-semibold">State Code</th>
                        <th className="px-3 py-2 font-semibold">Social Cat</th>
                        <th className="px-3 py-2 font-semibold">Minority</th>
                        <th className="px-3 py-2 font-semibold">BPL</th>
                        <th className="px-3 py-2 font-semibold">CWSN</th>
                        <th className="px-3 py-2 font-semibold">Repeater</th>
                        <th className="px-3 py-2 font-semibold">Entry Status</th>
                        <th className="px-3 py-2 font-semibold">Aadhaar No</th>
                        <th className="px-3 py-2 font-semibold">Aadhaar Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {parsedRows.map((r, i) => {
                        const isMismatch = r._nameMismatch;
                        return (
                          <tr
                            key={i}
                            className={`transition-colors ${
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
                            <td className="px-3 py-2 font-mono font-medium">{r.admissionNo || "Auto"}</td>
                            <td className="px-3 py-2">
                              <span
                                className={`font-medium ${
                                  isMismatch ? "font-bold text-red-600 dark:text-red-400" : "text-foreground"
                                }`}
                              >
                                {r.name || <span className="italic text-red-500">Missing</span>}
                              </span>
                            </td>
                            <td className="px-3 py-2">
                              <span
                                className={`${
                                  isMismatch ? "font-semibold text-red-600 dark:text-red-400" : "text-muted-foreground"
                                }`}
                              >
                                {r.nameAsPerAadhaar || "—"}
                              </span>
                            </td>
                            <td className="px-3 py-2">{r.className ? `${r.className}-${r.section}` : "—"}</td>
                            <td className="px-3 py-2">{r.gender || "—"}</td>
                            <td className="px-3 py-2">{r.dob || "—"}</td>
                            <td className="px-3 py-2">{r.father || "—"}</td>
                            <td className="px-3 py-2">{r.mother || "—"}</td>
                            <td className="px-3 py-2 font-mono">{r.penNo || "—"}</td>
                            <td className="px-3 py-2">{r.studentStateCode || "—"}</td>
                            <td className="px-3 py-2">{r.socialCategory || "—"}</td>
                            <td className="px-3 py-2">{r.minorityGroup || "—"}</td>
                            <td className="px-3 py-2">{r.bplBeneficiary || "—"}</td>
                            <td className="px-3 py-2">{r.cwsn || "—"}</td>
                            <td className="px-3 py-2">{r.isRepeater || "—"}</td>
                            <td className="px-3 py-2">{r.entryStatus || "—"}</td>
                            <td className="px-3 py-2 font-mono">{r.aadhaarNo || "—"}</td>
                            <td className="px-3 py-2">{r.aadhaarValidationStatus || "—"}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex flex-col-reverse justify-end gap-2 pt-2 sm:flex-row sm:items-center">
            <Button
              type="button"
              variant="outline"
              disabled={loading}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleImport}
              disabled={loading || validRows.length === 0}
              className="gap-2 bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {loading ? (
                <>
                  <Loader2 className="size-4 animate-spin" />
                  Importing {validRows.length} Student(s)…
                </>
              ) : (
                <>
                  <Upload className="size-4" />
                  Import {validRows.length} Student(s)
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
