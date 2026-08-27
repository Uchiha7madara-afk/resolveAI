"use client";
import { useCallback, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Phase = "idle" | "uploading" | "analyzing" | "error";

const ACCEPTED = ".pdf,.png,.jpg,.jpeg";

export default function UploadPage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [phase, setPhase] = useState<Phase>("idle");
  const [message, setMessage] = useState("");

  const handleFiles = useCallback((files: FileList | null) => {
    setMessage("");
    setPhase("idle");
    const selected = files?.[0];
    if (!selected) return;
    if (!["application/pdf", "image/png", "image/jpeg"].includes(selected.type)) {
      setMessage("Please upload a PDF, PNG, or JPEG file.");
      setPhase("error");
      return;
    }
    if (selected.size > 10 * 1024 * 1024) {
      setMessage("File must be smaller than 10 MB.");
      setPhase("error");
      return;
    }
    setFile(selected);
  }, []);

  const analyze = async () => {
    if (!file) return;
    setPhase("uploading");
    setMessage("Uploading bill…");

    try {
      const form = new FormData();
      form.append("file", file);

      const uploadRes = await fetch("/api/bills", { method: "POST", body: form });
      const uploadData = (await uploadRes.json()) as { id?: string; error?: string };
      if (!uploadRes.ok || !uploadData.id) {
        throw new Error(uploadData.error ?? "Upload failed");
      }

      setPhase("analyzing");
      setMessage("Agents are reading your bill — this usually takes under a minute…");

      const processRes = await fetch(`/api/bills/${uploadData.id}/process`, { method: "POST" });
      const processData = (await processRes.json()) as { error?: string };
      if (!processRes.ok) {
        throw new Error(processData.error ?? "Analysis failed");
      }

      router.push(`/dashboard/bills/${uploadData.id}`);
    } catch (err) {
      setPhase("error");
      setMessage(err instanceof Error ? err.message : "Something went wrong");
    }
  };

  const busy = phase === "uploading" || phase === "analyzing";

  return (
    <div className="space-y-8 max-w-3xl">
      <div>
        <h2 className="text-2xl font-semibold tracking-tight text-zinc-900">Upload Bill</h2>
        <p className="text-sm text-zinc-500 mt-1">
          Upload a bill and our engine will extract every line item, flag hidden charges, and
          prepare a negotiation.
        </p>
      </div>

      <div
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        onClick={() => !busy && inputRef.current?.click()}
        className={`p-12 border-2 border-dashed rounded-lg text-center transition-colors ${
          busy ? "border-zinc-200 bg-zinc-50 cursor-wait" : "cursor-pointer"
        } ${
          dragging
            ? "border-indigo-400 bg-indigo-50"
            : phase !== "error"
              ? "border-zinc-300 bg-white hover:border-zinc-400 hover:bg-zinc-50"
              : "border-zinc-300 bg-white"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED}
          className="hidden"
          disabled={busy}
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="text-sm font-medium text-zinc-900">
          {busy ? "Working…" : "Drag & drop your bill here"}
        </div>
        <div className="text-xs text-zinc-500 mt-1">
          PDF (recommended), PNG, or JPEG — up to 10 MB
        </div>
      </div>

      {file && (
        <div className="flex items-center justify-between p-4 bg-white border border-zinc-200 rounded-lg">
          <div className="min-w-0">
            <div className="text-sm font-medium text-zinc-900 truncate">{file.name}</div>
            <div className="text-xs text-zinc-400">{(file.size / 1024).toFixed(0)} KB</div>
          </div>
          <div className="flex items-center gap-3">
            {!busy && (
              <button
                onClick={() => {
                  setFile(null);
                  setPhase("idle");
                  setMessage("");
                }}
                className="text-xs text-zinc-500 hover:text-zinc-900"
              >
                Remove
              </button>
            )}
            <button
              onClick={analyze}
              disabled={busy}
              className="px-4 py-2 bg-zinc-900 text-white text-xs font-medium rounded-md hover:bg-zinc-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {phase === "uploading" ? "Uploading…" : phase === "analyzing" ? "Analyzing…" : "Analyze bill"}
            </button>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`p-3 rounded-md text-xs ${
            phase === "error"
              ? "bg-red-50 border border-red-200 text-red-700"
              : "bg-blue-50 border border-blue-200 text-blue-700"
          }`}
        >
          {message}
        </div>
      )}
    </div>
  );
}
