import { useMemo, useState, type ReactNode } from "react";
import { ArrowUpDown, Download, Printer, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { exportCsv, printArea } from "@/utils/helpers";

export type Column = {
  key: string;
  label: string;
  render?: (row: any) => ReactNode;
  sortable?: boolean;
  className?: string;
};

type Props = {
  columns: Column[];
  rows: any[];
  searchKeys?: string[];
  pageSize?: number;
  toolbar?: ReactNode;
  filters?: ReactNode;
  exportName?: string;
  printId?: string;
  emptyMessage?: string;
};

export function DataTable({
  columns,
  rows,
  searchKeys = [],
  pageSize = 10,
  toolbar,
  filters,
  exportName = "export",
  printId,
  emptyMessage = "No records found.",
}: Props) {
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<{ key: string; dir: 1 | -1 } | null>(null);
  const [page, setPage] = useState(1);
  const tableId = printId || `tbl-${exportName}`;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let out = rows;
    if (q && searchKeys.length) {
      out = rows.filter((r) =>
        searchKeys.some((k) => String(r[k] ?? "").toLowerCase().includes(q)),
      );
    }
    if (sort) {
      out = [...out].sort((a, b) => {
        const av = a[sort.key], bv = b[sort.key];
        if (typeof av === "number" && typeof bv === "number") return (av - bv) * sort.dir;
        return String(av ?? "").localeCompare(String(bv ?? "")) * sort.dir;
      });
    }
    return out;
  }, [rows, query, searchKeys, sort]);

  const pages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const current = Math.min(page, pages);
  const slice = filtered.slice((current - 1) * pageSize, current * pageSize);

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-1 flex-wrap items-center gap-2">
          {searchKeys.length > 0 && (
            <div className="relative w-full sm:w-72">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => { setQuery(e.target.value); setPage(1); }}
                placeholder="Search records…"
                className="pl-9"
              />
            </div>
          )}
          {filters}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {toolbar}
          <Button variant="outline" size="sm" onClick={() => printArea(tableId)}>
            <Printer className="size-4" /> Print
          </Button>
          <Button variant="outline" size="sm" onClick={() => exportCsv(exportName, filtered)}>
            <Download className="size-4" /> Export
          </Button>
        </div>
      </div>

      <div id={tableId} className="overflow-x-auto rounded-xl border border-border bg-card shadow-sm">
        <table className="w-full min-w-[640px] text-sm">
          <thead className="bg-muted/60 text-left text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              {columns.map((c) => (
                <th key={c.key} className={`px-4 py-3 font-semibold ${c.className || ""}`}>
                  {c.sortable === false ? (
                    c.label
                  ) : (
                    <button
                      type="button"
                      className="inline-flex items-center gap-1 hover:text-foreground"
                      onClick={() =>
                        setSort((s) =>
                          s && s.key === c.key ? { key: c.key, dir: s.dir === 1 ? -1 : 1 } : { key: c.key, dir: 1 },
                        )
                      }
                    >
                      {c.label}
                      <ArrowUpDown className="size-3 opacity-60" />
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {slice.length === 0 && (
              <tr>
                <td colSpan={columns.length} className="px-4 py-14 text-center text-muted-foreground">
                  {emptyMessage}
                </td>
              </tr>
            )}
            {slice.map((row, i) => (
              <tr key={row.id || i} className="border-t border-border/70 transition-colors hover:bg-muted/40">
                {columns.map((c) => (
                  <td key={c.key} className={`px-4 py-3 align-middle ${c.className || ""}`}>
                    {c.render ? c.render(row) : String(row[c.key] ?? "—")}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col items-center justify-between gap-3 text-sm text-muted-foreground sm:flex-row">
        <span>
          Showing {slice.length ? (current - 1) * pageSize + 1 : 0}–{(current - 1) * pageSize + slice.length} of{" "}
          {filtered.length}
        </span>
        <div className="flex items-center gap-1">
          <Button variant="outline" size="sm" disabled={current === 1} onClick={() => setPage(current - 1)}>
            Previous
          </Button>
          <span className="px-3 font-medium text-foreground">
            {current} / {pages}
          </span>
          <Button variant="outline" size="sm" disabled={current === pages} onClick={() => setPage(current + 1)}>
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
