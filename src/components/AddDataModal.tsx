// COMPONENT — Add Data modal (upload local files or connect to a data source)
import { useState, useRef } from "react";
import { createPortal } from "react-dom";

export interface AddedSource {
  name: string;
  type: "file" | "source";
}

interface AddDataModalProps {
  onClose: () => void;
  onDataAdded: (source: AddedSource) => void;
}

type SourceItem = { id: string; name: string; bg: string; fg: string; initial: string };

const CATALOGS: SourceItem[] = [
  { id: "aws-glue",    name: "AWS Glue Catalog",       bg: "#7C3AED", fg: "#fff", initial: "G"  },
  { id: "open-cat",   name: "Open Catalog",            bg: "#0D9488", fg: "#fff", initial: "O"  },
  { id: "iceberg",    name: "Iceberg REST Catalog",    bg: "#2563EB", fg: "#fff", initial: "I"  },
  { id: "snowflake",  name: "Snowflake Open Catalog",  bg: "#38BDF8", fg: "#fff", initial: "SN" },
  { id: "unity",      name: "Unity Catalog",           bg: "#F97316", fg: "#fff", initial: "U"  },
];

const OBJECT_STORAGE: SourceItem[] = [
  { id: "s3",    name: "AWS S3", bg: "#16A34A", fg: "#fff", initial: "S3" },
  { id: "azure", name: "Azure",  bg: "#1D4ED8", fg: "#fff", initial: "Az" },
  { id: "gcs",   name: "GCS",    bg: "#F59E0B", fg: "#fff", initial: "G"  },
];

const SAMPLE_SOURCES: SourceItem[] = [
  { id: "sample", name: "Sample source", bg: "#0EA5E9", fg: "#fff", initial: "S" },
];

function SourceTile({ source, onClick }: { source: SourceItem; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex items-center gap-[10px] px-[12px] py-[10px] rounded-[8px] border border-[var(--border)] hover:bg-[var(--muted)] transition-colors text-left w-full"
    >
      <div
        className="shrink-0 size-[28px] rounded-[6px] flex items-center justify-center text-[10px] font-bold"
        style={{ backgroundColor: source.bg, color: source.fg }}
      >
        {source.initial}
      </div>
      <span className="text-[13px] text-[var(--foreground)] truncate leading-[1.4]">{source.name}</span>
    </button>
  );
}

function SourceSection({ title, sources, onSelect }: { title: string; sources: SourceItem[]; onSelect: (name: string) => void }) {
  if (sources.length === 0) return null;
  return (
    <div className="flex flex-col gap-[8px]">
      <p className="text-[13px] font-semibold text-[var(--foreground)]">{title}</p>
      <div className="grid grid-cols-2 gap-[8px]">
        {sources.map((s) => (
          <SourceTile key={s.id} source={s} onClick={() => onSelect(s.name)} />
        ))}
      </div>
    </div>
  );
}

export function AddDataModal({ onClose, onDataAdded }: AddDataModalProps) {
  const [search, setSearch] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSourceSelect = (name: string) => {
    onDataAdded({ name, type: "source" });
    onClose();
  };

  const handleFileUpload = (file: File) => {
    onDataAdded({ name: file.name, type: "file" });
    onClose();
  };

  const filter = (items: SourceItem[]) =>
    search ? items.filter((s) => s.name.toLowerCase().includes(search.toLowerCase())) : items;

  const allFiltered = filter([...CATALOGS, ...OBJECT_STORAGE, ...SAMPLE_SOURCES]);

  const modal = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="bg-[var(--background)] rounded-[12px] shadow-2xl w-[900px] max-w-[95vw] max-h-[85vh] flex flex-col overflow-hidden">

        {/* Header */}
        <div className="flex items-center justify-between px-[24px] py-[18px] border-b border-[var(--border)] shrink-0">
          <span className="text-[15px] font-semibold text-[var(--foreground)]">Add Data</span>
          <button
            type="button"
            onClick={onClose}
            className="size-[28px] flex items-center justify-center rounded-[6px] hover:bg-[var(--muted)] text-[var(--muted-foreground)] transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M1 1L13 13M13 1L1 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-1 overflow-hidden min-h-0">

          {/* Left: Upload local files */}
          <div className="w-[360px] shrink-0 flex flex-col p-[24px] gap-[16px]">
            <p className="text-[14px] font-semibold text-[var(--foreground)] shrink-0">Upload local files</p>

            {/* Drop zone */}
            <div
              className={`flex-1 border-2 border-dashed rounded-[10px] flex flex-col items-center justify-center gap-[16px] p-[24px] cursor-pointer transition-colors ${
                isDragging ? "border-[var(--ring)] bg-[var(--muted)]" : "border-[var(--border)]"
              }`}
              style={{ minHeight: "180px" }}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                e.preventDefault();
                setIsDragging(false);
                const file = e.dataTransfer.files?.[0];
                if (file) handleFileUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
            >
              {/* Cloud upload icon */}
              <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                <path
                  d="M33 32H34.5C38.09 32 41 29.09 41 25.5C41 22.25 38.69 19.55 35.6 18.93C34.73 14.52 30.76 11.2 26 11.2C21.24 11.2 17.27 14.52 16.4 18.93C13.31 19.55 11 22.25 11 25.5C11 29.09 13.91 32 17.5 32H19"
                  stroke="var(--muted-foreground)"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                />
                <path d="M28 26L24 21L20 26" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M24 21V37" stroke="var(--muted-foreground)" strokeWidth="1.5" strokeLinecap="round" />
              </svg>

              <div className="text-center">
                <p className="text-[13px] text-[var(--muted-foreground)]">
                  Drag & Drop or{" "}
                  <span style={{ color: "#299FB1" }} className="hover:underline cursor-pointer">Choose file</span>
                  {" "}to upload
                </p>
                <p className="text-[12px] text-[var(--muted-foreground)] mt-[6px]">
                  CSV, JSON, Parquet and files are supported for upload
                </p>
              </div>
            </div>

            <p className="text-[11px] text-[var(--muted-foreground)] text-center leading-[1.5] shrink-0">
              Your data is stored as an Iceberg table in Dremio Catalog for optimized queries.
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.json,.parquet"
              className="hidden"
              onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileUpload(f); }}
            />
          </div>

          {/* "or" vertical divider */}
          <div className="flex flex-col items-center justify-center gap-[8px] py-[24px] shrink-0">
            <div className="w-px flex-1 bg-[var(--border)]" />
            <span className="text-[12px] text-[var(--muted-foreground)] shrink-0 px-[4px]">or</span>
            <div className="w-px flex-1 bg-[var(--border)]" />
          </div>

          {/* Right: Connect to a data source */}
          <div className="flex-1 flex flex-col p-[24px] gap-[16px] overflow-y-auto min-w-0">
            <p className="text-[14px] font-semibold text-[var(--foreground)] shrink-0">Connect to a data source</p>

            {/* Search */}
            <div className="relative shrink-0">
              <svg
                className="absolute left-[10px] top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]"
                width="14" height="14" viewBox="0 0 14 14" fill="none"
              >
                <circle cx="6" cy="6" r="5" stroke="currentColor" strokeWidth="1.3" />
                <path d="M9.5 9.5L13 13" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
              </svg>
              <input
                type="text"
                placeholder="Search data sources"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-[32px] pr-[12px] py-[8px] text-[13px] bg-transparent border border-[var(--border)] rounded-[6px] outline-none text-[var(--foreground)] placeholder:text-[var(--muted-foreground)]"
                style={{ borderColor: "var(--border)" }}
                onFocus={(e) => (e.target.style.borderColor = "var(--ring)")}
                onBlur={(e) => (e.target.style.borderColor = "var(--border)")}
              />
            </div>

            {/* Source sections */}
            <div className="flex flex-col gap-[20px]">
              <SourceSection title="Catalogs" sources={filter(CATALOGS)} onSelect={handleSourceSelect} />
              <SourceSection title="Object storage" sources={filter(OBJECT_STORAGE)} onSelect={handleSourceSelect} />
              <SourceSection title="Sample source" sources={filter(SAMPLE_SOURCES)} onSelect={handleSourceSelect} />
              {search && allFiltered.length === 0 && (
                <p className="text-[13px] text-[var(--muted-foreground)] text-center py-[20px]">
                  No sources found for &ldquo;{search}&rdquo;
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
