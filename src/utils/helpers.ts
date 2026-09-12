export const inr = (n: number) =>
  `₹${Number(n || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

export const fmtDate = (d?: string) => {
  if (!d) return "—";
  const date = new Date(d);
  if (Number.isNaN(date.getTime())) return d;
  return date.toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

export const today = () => new Date().toISOString().slice(0, 10);

export function gradeFor(pct: number) {
  if (pct >= 91) return "A1";
  if (pct >= 81) return "A2";
  if (pct >= 71) return "B1";
  if (pct >= 61) return "B2";
  if (pct >= 51) return "C1";
  if (pct >= 41) return "C2";
  if (pct >= 33) return "D";
  return "E";
}

export function invoiceTotal(inv: any) {
  const items = (inv.items || []).reduce((a: number, b: any) => a + Number(b.amount || 0), 0);
  return items + Number(inv.lateFee || 0) - Number(inv.discount || 0);
}

export function printArea(elementId: string) {
  const node = document.getElementById(elementId);
  if (!node) return window.print();
  document.body.classList.add("printing");
  node.classList.add("print-target");
  window.print();
  setTimeout(() => {
    document.body.classList.remove("printing");
    node.classList.remove("print-target");
  }, 500);
}

export function exportCsv(filename: string, rows: Record<string, any>[]) {
  if (!rows.length) return;
  const headers = Object.keys(rows[0]);
  const csv = [
    headers.join(","),
    ...rows.map((r) =>
      headers.map((h) => `"${String(r[h] ?? "").replace(/"/g, '""')}"`).join(","),
    ),
  ].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function initials(name = "") {
  return name
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

/** Simple deterministic QR-ish matrix so ID cards render an offline code. */
export function qrMatrix(text: string, size = 21) {
  let h = 2166136261;
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const cells: boolean[] = [];
  let state = h >>> 0;
  for (let i = 0; i < size * size; i++) {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    cells.push((state >>> 16) % 2 === 0);
  }
  // finder patterns
  const setBlock = (r0: number, c0: number) => {
    for (let r = 0; r < 7; r++)
      for (let c = 0; c < 7; c++) {
        const edge = r === 0 || r === 6 || c === 0 || c === 6;
        const core = r >= 2 && r <= 4 && c >= 2 && c <= 4;
        cells[(r0 + r) * size + (c0 + c)] = edge || core;
      }
  };
  setBlock(0, 0);
  setBlock(0, size - 7);
  setBlock(size - 7, 0);
  return cells;
}
