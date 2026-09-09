import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Copy, Plus, Trash2 } from "lucide-react";
import { useApp } from "@/context/AppContext";
import { DataTable } from "@/components/common/DataTable";
import { EmptyState, PageHeader, Panel, SelectField, TextField, useConfirm } from "@/components/common/Ui";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { A4Document, DocToolbar, Field, SignRow } from "@/components/common/A4Document";
import { fmtDate, inr, invoiceTotal, today } from "@/utils/helpers";
import { Badge, FEE_HEADS, MONTHS, PAYMENT_MODES, feeSummary, useGoto } from "@/modules/shared";

const STRUCTURE = [
  { head: "Admission Fee", frequency: "Yearly", amount: 5000 },
  { head: "Tuition Fee", frequency: "Monthly", amount: 2500 },
  { head: "Annual Fee", frequency: "Yearly", amount: 6000 },
  { head: "Exam Fee", frequency: "Quarterly", amount: 400 },
  { head: "Transport Fee", frequency: "Monthly", amount: 1200 },
  { head: "Computer Fee", frequency: "Monthly", amount: 300 },
  { head: "Activity Fee", frequency: "Monthly", amount: 500 },
  { head: "Other Charges", frequency: "Yearly", amount: 800 },
];

export function FeeStructure() {
  return (
    <div>
      <PageHeader title="Fee Structure" subtitle="Standard fee heads applied when generating invoices." />
      <DataTable exportName="fee-structure" pageSize={10}
        rows={STRUCTURE.map((r, i) => ({ id: `fs-${i}`, ...r }))}
        searchKeys={["head"]}
        columns={[
          { key: "head", label: "Fee Head" },
          { key: "frequency", label: "Frequency" },
          { key: "amount", label: "Amount", render: (r) => inr(r.amount) },
        ]}
      />
    </div>
  );
}

export function GenerateFee() {
  const { students, invoices, add } = useApp();
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [month, setMonth] = useState(MONTHS[0]);
  const [heads, setHeads] = useState<string[]>(["Tuition Fee", "Exam Fee"]);
  const [discount, setDiscount] = useState(0);
  const [lateFee, setLateFee] = useState(0);
  const [dueDate, setDueDate] = useState(today());

  const items = heads.map((h) => ({ head: h, amount: STRUCTURE.find((s) => s.head === h)?.amount || 0 }));
  const subtotal = items.reduce((a, b) => a + b.amount, 0);
  const total = subtotal + Number(lateFee) - Number(discount);
  const prev = studentId ? feeSummary(invoices, studentId).pending : 0;

  const generate = () => {
    if (!studentId || !heads.length) {
      toast.error("Select a student and at least one fee head.");
      return;
    }
    add("invoices", {
      studentId, month, session: "2025-26", items,
      discount: Number(discount), lateFee: Number(lateFee),
      total: subtotal, paid: 0, dueDate, status: "Pending",
    }, "inv");
    toast.success(`Invoice generated for ${month}.`);
  };

  return (
    <div>
      <PageHeader title="Generate Fee" subtitle="Create a new fee invoice for a student." />
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Panel title="Invoice Details">
            <div className="grid gap-4 sm:grid-cols-2">
              <SelectField label="Student" value={studentId} onChange={setStudentId}
                options={students.map((s: any) => ({ value: s.id, label: `${s.name} — ${s.className}-${s.section}` }))} />
              <SelectField label="Month" value={month} onChange={setMonth} options={MONTHS} />
              <TextField label="Due Date" type="date" value={dueDate} onChange={setDueDate} />
              <TextField label="Discount" type="number" value={discount} onChange={(v) => setDiscount(Number(v))} />
              <TextField label="Late Fee" type="number" value={lateFee} onChange={(v) => setLateFee(Number(v))} />
            </div>
          </Panel>
          <Panel title="Fee Heads">
            <div className="grid gap-2 sm:grid-cols-2">
              {FEE_HEADS.map((h) => (
                <label key={h} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2 text-sm">
                  <span className="flex items-center gap-2">
                    <input type="checkbox" checked={heads.includes(h)}
                      onChange={(e) => setHeads((p) => (e.target.checked ? [...p, h] : p.filter((x) => x !== h)))} />
                    {h}
                  </span>
                  <span className="font-semibold">{inr(STRUCTURE.find((s) => s.head === h)?.amount || 0)}</span>
                </label>
              ))}
            </div>
          </Panel>
        </div>
        <Panel title="Summary">
          <dl className="space-y-2 text-sm">
            {[["Subtotal", inr(subtotal)], ["Discount", `- ${inr(discount)}`], ["Late Fee", inr(lateFee)],
              ["Previous Balance", inr(prev)]].map(([k, v]) => (
              <div key={k} className="flex justify-between"><dt className="text-muted-foreground">{k}</dt><dd>{v}</dd></div>
            ))}
            <div className="flex justify-between border-t border-border pt-2 text-base font-bold">
              <dt>Total Payable</dt><dd>{inr(total)}</dd>
            </div>
          </dl>
          <div className="mt-4 flex gap-2">
            <Button className="flex-1" onClick={generate}>Generate</Button>
            <Button variant="outline" onClick={() => { setHeads([]); setDiscount(0); setLateFee(0); }}>Reset</Button>
          </div>
        </Panel>
      </div>
    </div>
  );
}

export function CollectFee() {
  const { students, invoices, update, add, user } = useApp();
  const goto = useGoto();
  const [studentId, setStudentId] = useState(students[0]?.id || "");
  const [invoiceId, setInvoiceId] = useState("");
  const [amount, setAmount] = useState(0);
  const [mode, setMode] = useState(PAYMENT_MODES[0]);
  const [date, setDate] = useState(today());

  const open = invoices.filter((i: any) => i.studentId === studentId && invoiceTotal(i) - i.paid > 0);
  const inv = open.find((i: any) => i.id === invoiceId) || open[0];
  const balance = inv ? invoiceTotal(inv) - inv.paid : 0;

  const collect = () => {
    if (!inv) {
      toast.error("No pending invoice for this student.");
      return;
    }
    const pay = Number(amount) || balance;
    const newPaid = Math.min(invoiceTotal(inv), inv.paid + pay);
    update("invoices", inv.id, { paid: newPaid, status: newPaid >= invoiceTotal(inv) ? "Paid" : "Pending" });
    add("payments", {
      receiptNo: `RCP${Date.now().toString().slice(-6)}`,
      invoiceId: inv.id, studentId, date, amount: pay, mode,
      receivedBy: user?.name || "Office",
    }, "pay");
    toast.success(`Payment of ${inr(pay)} recorded.`);
    goto("fees/receipt");
  };

  return (
    <div>
      <PageHeader title="Collect Fee" subtitle="Record a fee payment and issue a receipt." />
      <div className="grid gap-6 lg:grid-cols-3">
        <Panel title="Payment Entry">
          <div className="space-y-4">
            <SelectField label="Student" value={studentId} onChange={(v) => { setStudentId(v); setInvoiceId(""); }}
              options={students.map((s: any) => ({ value: s.id, label: `${s.name} — ${s.className}-${s.section}` }))} />
            <SelectField label="Invoice" value={inv?.id || ""} onChange={setInvoiceId}
              options={open.length ? open.map((i: any) => ({ value: i.id, label: `${i.month} — ${inr(invoiceTotal(i) - i.paid)} due` })) : [{ value: "", label: "No pending invoice" }]} />
            <TextField label="Amount Paid" type="number" value={amount || balance} onChange={(v) => setAmount(Number(v))} />
            <SelectField label="Payment Mode" value={mode} onChange={setMode} options={PAYMENT_MODES} />
            <TextField label="Payment Date" type="date" value={date} onChange={setDate} />
            <div className="flex gap-2">
              <Button className="flex-1" onClick={collect}>Save Payment</Button>
              <Button variant="outline" onClick={() => setAmount(0)}>Reset</Button>
            </div>
          </div>
        </Panel>
        <div className="lg:col-span-2">
          <Panel title="Invoice Breakdown">
            {!inv ? <EmptyState message="This student has no pending invoice." /> : (
              <table className="w-full text-sm">
                <tbody>
                  {inv.items.map((it: any) => (
                    <tr key={it.head} className="border-b border-border"><td className="py-2">{it.head}</td><td className="py-2 text-right">{inr(it.amount)}</td></tr>
                  ))}
                  <tr className="border-b border-border"><td className="py-2">Late Fee</td><td className="py-2 text-right">{inr(inv.lateFee)}</td></tr>
                  <tr className="border-b border-border"><td className="py-2">Discount</td><td className="py-2 text-right">- {inr(inv.discount)}</td></tr>
                  <tr className="border-b border-border"><td className="py-2">Already Paid</td><td className="py-2 text-right">{inr(inv.paid)}</td></tr>
                  <tr className="font-bold"><td className="py-2">Balance Due</td><td className="py-2 text-right">{inr(balance)}</td></tr>
                </tbody>
              </table>
            )}
          </Panel>
        </div>
      </div>
    </div>
  );
}

export function FeeReceipt() {
  const { payments, students, invoices, settings } = useApp();
  const sorted = [...payments].sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));
  const [id, setId] = useState(sorted[0]?.id || "");
  const p = payments.find((x: any) => x.id === id) || sorted[0];
  const s = students.find((x: any) => x.id === p?.studentId);
  const inv = invoices.find((x: any) => x.id === p?.invoiceId);

  if (!p || !s) return <div><PageHeader title="Fee Receipt" /><EmptyState message="No payments recorded yet." /></div>;

  const total = inv ? invoiceTotal(inv) : p.amount;

  return (
    <div>
      <PageHeader title="Fee Receipt" subtitle="Print-ready payment receipt." />
      <Panel title="Select Receipt">
        <SelectField label="Receipt" value={p.id} onChange={setId}
          options={sorted.slice(0, 60).map((x: any) => ({
            value: x.id,
            label: `${x.receiptNo} — ${students.find((st: any) => st.id === x.studentId)?.name || ""} — ${inr(x.amount)}`,
          }))} />
      </Panel>
      <div className="mt-6">
        <DocToolbar docId="fee-receipt-doc" />
        <A4Document id="fee-receipt-doc" title="Fee Receipt">
          <div className="flex justify-between text-[11px] font-semibold">
            <span>Receipt No: {p.receiptNo}</span>
            <span>Date: {fmtDate(p.date)}</span>
          </div>
          <div className="mt-4 grid gap-x-8 sm:grid-cols-2">
            <Field label="Student Name" value={s.name} />
            <Field label="Admission Number" value={s.admissionNo} />
            <Field label="Father's Name" value={s.father} />
            <Field label="Class / Section" value={`${s.className} - ${s.section}`} />
            <Field label="Month" value={inv?.month} />
            <Field label="Session" value={settings.session} />
          </div>
          <table className="mt-5 w-full border border-slate-800 text-[11px]">
            <thead className="bg-slate-100">
              <tr><th className="border border-slate-800 px-2 py-1 text-left">#</th>
                <th className="border border-slate-800 px-2 py-1 text-left">Particulars</th>
                <th className="border border-slate-800 px-2 py-1 text-right">Amount</th></tr>
            </thead>
            <tbody>
              {(inv?.items || [{ head: "Fee Payment", amount: p.amount }]).map((it: any, i: number) => (
                <tr key={it.head}>
                  <td className="border border-slate-800 px-2 py-1">{i + 1}</td>
                  <td className="border border-slate-800 px-2 py-1">{it.head}</td>
                  <td className="border border-slate-800 px-2 py-1 text-right">{inr(it.amount)}</td>
                </tr>
              ))}
              <tr><td colSpan={2} className="border border-slate-800 px-2 py-1 text-right font-semibold">Late Fee</td>
                <td className="border border-slate-800 px-2 py-1 text-right">{inr(inv?.lateFee || 0)}</td></tr>
              <tr><td colSpan={2} className="border border-slate-800 px-2 py-1 text-right font-semibold">Discount</td>
                <td className="border border-slate-800 px-2 py-1 text-right">- {inr(inv?.discount || 0)}</td></tr>
              <tr className="bg-slate-100 font-bold"><td colSpan={2} className="border border-slate-800 px-2 py-1 text-right">Total</td>
                <td className="border border-slate-800 px-2 py-1 text-right">{inr(total)}</td></tr>
              <tr><td colSpan={2} className="border border-slate-800 px-2 py-1 text-right font-semibold">Amount Paid</td>
                <td className="border border-slate-800 px-2 py-1 text-right">{inr(p.amount)}</td></tr>
              <tr><td colSpan={2} className="border border-slate-800 px-2 py-1 text-right font-semibold">Balance</td>
                <td className="border border-slate-800 px-2 py-1 text-right">{inr(Math.max(0, total - (inv?.paid ?? p.amount)))}</td></tr>
            </tbody>
          </table>
          <p className="mt-3 text-[11px]"><b>Payment Mode:</b> {p.mode} &nbsp;•&nbsp; <b>Received By:</b> {p.receivedBy}</p>
          <SignRow items={["Cashier", "Authorised Signatory", "School Stamp"]} />
        </A4Document>
      </div>
    </div>
  );
}

export function PendingFees() {
  const { invoices, students } = useApp();
  const rows = invoices
    .filter((i: any) => invoiceTotal(i) - i.paid > 0)
    .map((i: any) => {
      const s = students.find((x: any) => x.id === i.studentId);
      return {
        id: i.id, name: s?.name || "—", admissionNo: s?.admissionNo || "—",
        className: s ? `${s.className}-${s.section}` : "—", month: i.month,
        total: invoiceTotal(i), paid: i.paid, pending: invoiceTotal(i) - i.paid, dueDate: i.dueDate,
      };
    });
  return (
    <div>
      <PageHeader title="Pending Fees" subtitle={`${rows.length} unpaid invoices`} />
      <DataTable exportName="pending-fees" rows={rows} searchKeys={["name", "admissionNo", "className", "month"]}
        columns={[
          { key: "admissionNo", label: "Adm. No" },
          { key: "name", label: "Student" },
          { key: "className", label: "Class" },
          { key: "month", label: "Month" },
          { key: "total", label: "Total", render: (r) => inr(r.total) },
          { key: "paid", label: "Paid", render: (r) => inr(r.paid) },
          { key: "pending", label: "Pending", render: (r) => <Badge tone="red">{inr(r.pending)}</Badge> },
          { key: "dueDate", label: "Due", render: (r) => fmtDate(r.dueDate) },
        ]}
      />
    </div>
  );
}

export function FeeDefaulters() {
  const { invoices, students, settings, classes } = useApp();
  const [cls, setCls] = useState("All");
  const [min, setMin] = useState(0);
  const [msg, setMsg] = useState("");

  const rows = useMemo(() => students.map((s: any) => {
    const f = feeSummary(invoices, s.id);
    return {
      id: s.id, name: s.name, admissionNo: s.admissionNo, className: `${s.className}-${s.section}`,
      rawClass: s.className, parent: s.father, mobile: s.mobile,
      total: f.total, paid: f.paid, pending: f.pending,
      dueDate: f.rows.find((r) => r.status !== "Paid")?.dueDate || "—",
    };
  }).filter((r: any) => r.pending > Number(min) && (cls === "All" || r.rawClass === cls)),
  [students, invoices, cls, min]);

  const reminder = (r: any) =>
    setMsg(`Dear ${r.parent},\n\nThis is a gentle reminder from ${settings.name} regarding pending school fees of ${inr(r.pending)} for ${r.name} (Adm. No ${r.admissionNo}, Class ${r.className}). Kindly clear the dues by ${fmtDate(r.dueDate)} to avoid a late fee.\n\nRegards,\nAccounts Office\n${settings.phone}`);

  return (
    <div>
      <PageHeader title="Fee Defaulters" subtitle={`${rows.length} students with outstanding dues`} />
      <DataTable exportName="defaulters" rows={rows} searchKeys={["name", "admissionNo", "parent", "mobile"]}
        filters={
          <>
            <select className="h-9 rounded-md border border-input bg-background px-3 text-sm" value={cls} onChange={(e) => setCls(e.target.value)}>
              {["All", ...classes].map((c) => <option key={c}>{c}</option>)}
            </select>
            <input type="number" placeholder="Min pending" value={min} onChange={(e) => setMin(Number(e.target.value))}
              className="h-9 w-32 rounded-md border border-input bg-background px-3 text-sm" />
          </>
        }
        columns={[
          { key: "name", label: "Student" },
          { key: "admissionNo", label: "Adm. No" },
          { key: "className", label: "Class" },
          { key: "parent", label: "Parent" },
          { key: "mobile", label: "Mobile" },
          { key: "total", label: "Total", render: (r) => inr(r.total) },
          { key: "paid", label: "Paid", render: (r) => inr(r.paid) },
          { key: "pending", label: "Pending", render: (r) => <Badge tone="red">{inr(r.pending)}</Badge> },
          { key: "act", label: "Reminder", sortable: false, render: (r) => <Button size="sm" variant="outline" onClick={() => reminder(r)}>Generate</Button> },
        ]}
      />
      {msg && (
        <div className="mt-6">
          <Panel title="WhatsApp / SMS Reminder"
            actions={<Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(msg); toast.success("Message copied."); }}><Copy className="size-4" /> Copy</Button>}>
            <Textarea value={msg} onChange={(e) => setMsg(e.target.value)} rows={9} />
          </Panel>
        </div>
      )}
    </div>
  );
}

export function PaymentHistory() {
  const { payments, students, remove } = useApp();
  const { confirm, dialog } = useConfirm();
  const rows = payments.map((p: any) => ({
    ...p, name: students.find((s: any) => s.id === p.studentId)?.name || "—",
  }));
  return (
    <div>
      <PageHeader title="Payment History" subtitle={`${rows.length} payments recorded`} />
      <DataTable exportName="payments" rows={rows} searchKeys={["receiptNo", "name", "mode"]}
        columns={[
          { key: "receiptNo", label: "Receipt" },
          { key: "name", label: "Student" },
          { key: "date", label: "Date", render: (r) => fmtDate(r.date) },
          { key: "amount", label: "Amount", render: (r) => inr(r.amount) },
          { key: "mode", label: "Mode" },
          { key: "receivedBy", label: "Received By" },
          {
            key: "act", label: "", sortable: false,
            render: (r) => (
              <Button size="icon" variant="ghost" aria-label="Delete"
                onClick={() => confirm(`Delete receipt ${r.receiptNo}?`, () => { remove("payments", r.id); toast.success("Payment deleted."); })}>
                <Trash2 className="size-4 text-destructive" />
              </Button>
            ),
          },
        ]}
      />
      {dialog}
    </div>
  );
}

export function MonthlyCollection() {
  const { payments, invoices } = useApp();
  const byMonth = useMemo(() => {
    const map = new Map<string, { id: string; month: string; count: number; collected: number; billed: number }>();
    MONTHS.forEach((m) => map.set(m, { id: m, month: m, count: 0, collected: 0, billed: 0 }));
    invoices.forEach((i: any) => {
      const row = map.get(i.month);
      if (row) row.billed += invoiceTotal(i);
    });
    payments.forEach((p: any) => {
      const inv = invoices.find((i: any) => i.id === p.invoiceId);
      const row = map.get(inv?.month || "April");
      if (row) { row.count += 1; row.collected += Number(p.amount || 0); }
    });
    return [...map.values()].filter((r) => r.billed > 0 || r.collected > 0);
  }, [payments, invoices]);

  const totalCollected = byMonth.reduce((a, b) => a + b.collected, 0);

  return (
    <div>
      <PageHeader title="Monthly Collection Report" subtitle={`Total collected: ${inr(totalCollected)}`} />
      <DataTable exportName="monthly-collection" rows={byMonth} pageSize={12}
        columns={[
          { key: "month", label: "Month" },
          { key: "count", label: "Payments" },
          { key: "billed", label: "Billed", render: (r) => inr(r.billed) },
          { key: "collected", label: "Collected", render: (r) => inr(r.collected) },
          { key: "outstanding", label: "Outstanding", render: (r) => inr(Math.max(0, r.billed - r.collected)) },
        ]}
      />
    </div>
  );
}
