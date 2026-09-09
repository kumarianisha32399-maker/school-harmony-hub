import { useNavigate } from "@tanstack/react-router";
import { useApp } from "@/context/AppContext";
import { invoiceTotal } from "@/utils/helpers";

export function useGoto() {
  const navigate = useNavigate();
  return (slug: string) => navigate({ to: "/app/$", params: { _splat: slug } });
}

export function Badge({ tone = "muted", children }: { tone?: string; children: React.ReactNode }) {
  const map: Record<string, string> = {
    muted: "bg-muted text-muted-foreground",
    green: "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400",
    red: "bg-destructive/15 text-destructive",
    amber: "bg-amber-500/15 text-amber-600 dark:text-amber-400",
    blue: "bg-primary/15 text-primary",
  };
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${map[tone] || map.muted}`}>
      {children}
    </span>
  );
}

/** Fee summary for one student across all invoices. */
export function feeSummary(invoices: any[], studentId: string) {
  const rows = invoices.filter((i) => i.studentId === studentId);
  const total = rows.reduce((a, b) => a + invoiceTotal(b), 0);
  const paid = rows.reduce((a, b) => a + Number(b.paid || 0), 0);
  return { rows, total, paid, pending: Math.max(0, total - paid) };
}

export function attendanceSummary(attendance: any[], studentId: string) {
  const rows = attendance.filter((a) => a.studentId === studentId);
  const present = rows.filter((r) => r.status === "Present" || r.status === "Late").length;
  const pct = rows.length ? Math.round((present / rows.length) * 100) : 0;
  return { rows, total: rows.length, present, absent: rows.length - present, pct };
}

export function useStudentOptions() {
  const { students } = useApp();
  return students.map((s: any) => ({
    value: s.id,
    label: `${s.name} — ${s.className}-${s.section} (${s.admissionNo})`,
  }));
}

export const MONTHS = [
  "April", "May", "June", "July", "August", "September",
  "October", "November", "December", "January", "February", "March",
];

export const FEE_HEADS = [
  "Admission Fee", "Tuition Fee", "Annual Fee", "Exam Fee",
  "Transport Fee", "Computer Fee", "Activity Fee", "Other Charges",
];

export const PAYMENT_MODES = ["Cash", "UPI", "Card", "Bank Transfer", "Cheque"];
