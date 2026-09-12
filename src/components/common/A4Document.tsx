import type { ReactNode } from "react";
import { Printer, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useApp } from "@/context/AppContext";
import { printArea } from "@/utils/helpers";

export function DocToolbar({ docId, onPreview }: { docId: string; onPreview?: () => void }) {
  return (
    <div className="mb-4 flex flex-wrap gap-2 print:hidden">
      {onPreview && (
        <Button variant="outline" onClick={onPreview}>
          <Eye className="size-4" /> Preview
        </Button>
      )}
      <Button onClick={() => printArea(docId)}>
        <Printer className="size-4" /> Print
      </Button>
      <Button variant="outline" onClick={() => printArea(docId)}>
        <Download className="size-4" /> Download PDF
      </Button>
    </div>
  );
}

export function Letterhead({ title }: { title: string }) {
  const { settings } = useApp();
  return (
    <div className="border-b-2 border-slate-800 pb-3 text-center">
      <div className="flex items-center justify-center gap-4">
        <div className="flex size-16 shrink-0 items-center justify-center rounded-full border-2 border-slate-800 text-xl font-black">
          {settings.logo ? (
            <img src={settings.logo} alt="School logo" className="size-full rounded-full object-cover" />
          ) : (
            "HPS"
          )}
        </div>
        <div>
          <h1 className="text-2xl font-black uppercase tracking-wide">{settings.name}</h1>
          <p className="text-[11px]">{settings.address}</p>
          <p className="text-[11px]">
            Ph: {settings.phone} • {settings.email} • {settings.affiliation}
          </p>
        </div>
      </div>
      <div className="mx-auto mt-3 w-fit border border-slate-800 px-6 py-1 text-sm font-bold uppercase tracking-[0.2em]">
        {title}
      </div>
    </div>
  );
}

export function A4Document({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: ReactNode;
}) {
  return (
    <div className="overflow-x-auto">
      <div
        id={id}
        className="a4-sheet mx-auto w-[210mm] min-h-[297mm] bg-white p-[14mm] text-[12px] leading-relaxed text-slate-900 shadow-lg"
      >
        <div className="border border-slate-800 p-5">
          <Letterhead title={title} />
          <div className="mt-5">{children}</div>
        </div>
      </div>
    </div>
  );
}

export function SignRow({ items }: { items: string[] }) {
  return (
    <div className="mt-14 flex flex-wrap justify-between gap-6">
      {items.map((s) => (
        <div key={s} className="min-w-[130px] text-center">
          <div className="h-10" />
          <div className="border-t border-slate-800 pt-1 text-[11px] font-semibold uppercase">{s}</div>
        </div>
      ))}
    </div>
  );
}

export function Field({ label, value }: { label: string; value?: ReactNode }) {
  return (
    <div className="flex gap-2 border-b border-dotted border-slate-400 py-1">
      <span className="w-44 shrink-0 font-semibold">{label}</span>
      <span className="flex-1">{value ?? "—"}</span>
    </div>
  );
}
