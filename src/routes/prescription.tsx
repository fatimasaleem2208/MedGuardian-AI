import { createFileRoute, Link } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Disclaimer, EmptyState, PageHeader, Panel, SectionLabel, SourceTag } from "@/components/Bits";
import { extractDocument } from "@/lib/ai.functions";

export const Route = createFileRoute("/prescription")({
  head: () => ({
    meta: [
      { title: "Prescription Analyzer — MedGuardian AI" },
      { name: "description", content: "Upload a prescription and get each medicine, dose, frequency and instruction explained in plain language." },
      { property: "og:title", content: "Prescription Analyzer — MedGuardian AI" },
      { property: "og:description", content: "Plain-language explanation of your prescription, verified against the medicine database." },
    ],
  }),
  component: PrescriptionPage,
});

type Item = {
  medicine?: string;
  strength?: string;
  dose?: string;
  frequency?: string;
  route?: string;
  duration?: string;
  prn?: string;
  instructions?: string;
  explanation?: string;
};

const ACCEPT = "image/jpeg,image/png,application/pdf,text/plain";
const MAX_BYTES = 8 * 1024 * 1024;

function PrescriptionPage() {
  const extract = useServerFn(extractDocument);
  const [fileName, setFileName] = useState("");
  const [busy, setBusy] = useState(false);
  const [items, setItems] = useState<Item[] | null>(null);
  const [summary, setSummary] = useState("");

  async function handleFile(file: File) {
    if (file.size > MAX_BYTES) {
      toast.error("File is too large. Maximum size is 8 MB.");
      return;
    }
    if (!ACCEPT.split(",").includes(file.type)) {
      toast.error("Unsupported file. Upload a JPG, PNG, PDF or text file.");
      return;
    }
    setFileName(file.name);
    setBusy(true);
    setItems(null);
    try {
      const text = file.type === "text/plain" ? (await file.text()).slice(0, 20000) : "";
      const res = await extract({ data: { kind: "prescription", fileName: file.name, text } });
      if (!res.ok) {
        toast.error(res.message ?? "Analysis failed.");
        return;
      }
      const parsed = res.data as { items?: Item[]; summary?: string };
      setItems(parsed.items ?? []);
      setSummary(parsed.summary ?? "");
    } catch {
      toast.error("The prescription could not be analysed. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <AppShell>
      <PageHeader
        label="Document analysis"
        title="Prescription Analysis"
        description="Upload a prescription image or PDF. Medicines, doses, frequency, route and special instructions are extracted and explained in everyday language."
      />

      <div className="grid lg:grid-cols-12 gap-4">
        <Panel className="lg:col-span-4">
          <SectionLabel>Upload prescription</SectionLabel>
          <label className="mt-3 block rounded-lg border border-dashed border-ink/20 bg-panel2 p-8 text-center cursor-pointer hover:border-brand/50 transition-colors">
            <input
              type="file"
              accept={ACCEPT}
              className="sr-only"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) void handleFile(f);
              }}
            />
            <p className="font-sans text-sm text-ink">{fileName || "Choose a file"}</p>
            <p className="font-mono text-[10px] text-inksoft mt-1.5">JPG · PNG · PDF · up to 8 MB</p>
          </label>
          {busy && <p className="font-mono text-[11px] text-brand mt-3">Extracting medicines…</p>}
          <p className="font-mono text-[10px] text-inksoft/80 mt-4 leading-relaxed">
            Files are processed for this analysis only and are not shared. OCR/AI extraction may contain errors.
          </p>
        </Panel>

        <div className="lg:col-span-8 space-y-4">
          {items === null ? (
            <EmptyState
              title="No prescription analysed yet."
              hint="Upload a prescription to see extracted medicines and a plain-language explanation."
            />
          ) : (
            <>
              <Panel>
                <div className="flex items-center justify-between">
                  <SectionLabel>Your prescription</SectionLabel>
                  <SourceTag kind="ai" />
                </div>
                {summary && <p className="font-sans text-sm text-inksoft mt-3 text-pretty">{summary}</p>}
                <div className="mt-3 space-y-3">
                  {items.map((it, i) => (
                    <div key={i} className="rounded-lg bg-panel2 ring-1 ring-ink/10 p-4">
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <h3 className="font-sans text-ink font-semibold">
                          {it.medicine} {it.strength}
                        </h3>
                        {it.prn && <span className="font-mono text-[10px] text-caution">{it.prn}</span>}
                      </div>
                      <div className="grid sm:grid-cols-4 gap-3 mt-3">
                        {[
                          ["Dose", it.dose],
                          ["Frequency", it.frequency],
                          ["Route", it.route],
                          ["Duration", it.duration],
                        ].map(([k, v]) => (
                          <div key={k}>
                            <p className="font-mono text-[10px] uppercase tracking-wide text-inksoft">{k}</p>
                            <p className="font-sans text-sm text-ink">{v || "—"}</p>
                          </div>
                        ))}
                      </div>
                      {it.instructions && (
                        <p className="font-sans text-sm text-inksoft mt-3 text-pretty">
                          <span className="text-brand font-mono text-[10px] uppercase tracking-wide mr-2">Instructions</span>
                          {it.instructions}
                        </p>
                      )}
                      {it.explanation && (
                        <p className="font-sans text-sm text-ink mt-2 text-pretty">In simple words: {it.explanation}</p>
                      )}
                    </div>
                  ))}
                </div>
              </Panel>

              <Link
                to="/assistant"
                search={{
                  q: `Explain this prescription in simple language: ${items
                    .map((i) => `${i.medicine ?? ""} ${i.strength ?? ""} ${i.dose ?? ""} ${i.frequency ?? ""}`.trim())
                    .join("; ")}`,
                }}
                className="inline-block px-4 py-2 rounded-md bg-brand text-seam text-sm font-medium hover:bg-brand/90 transition-colors"
              >
                Ask AI About This Prescription
              </Link>
            </>
          )}
        </div>
      </div>

      <Disclaimer>
        OCR and AI extraction may contain errors. Always verify every medicine, dose and instruction with your pharmacist or
        prescriber before taking anything.
      </Disclaimer>
    </AppShell>
  );
}
