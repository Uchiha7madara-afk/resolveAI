import { z } from "zod";

export const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024; // must match storage bucket limit

export const ACCEPTED_MIME_TYPES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
] as const;

export type AcceptedMimeType = (typeof ACCEPTED_MIME_TYPES)[number];

/** Zod schema for the LLM's structured bill parse. */
export const BillLineItemSchema = z.object({
  description: z.string().min(1).max(500),
  category: z.enum([
    "base_service",
    "usage",
    "equipment",
    "fee",
    "tax",
    "discount",
    "one_time",
    "other",
  ]),
  amount: z.number().finite(),
  quantity: z.number().finite().nullable().optional(),
  is_recurring: z.boolean(),
  notes: z.string().max(500).nullable().optional(),
});

export const BillParseSchema = z.object({
  provider: z.string().min(1).max(200),
  category: z.enum([
    "internet",
    "mobile",
    "tv",
    "landline",
    "electricity",
    "gas",
    "water",
    "insurance",
    "other",
  ]),
  account_number: z.string().max(100).nullable(),
  billing_period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  billing_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  total_amount: z.number().finite().nullable(),
  currency: z.string().length(3).default("USD"),
  line_items: z.array(BillLineItemSchema).min(1).max(200),
  contract: z
    .object({
      monthly_price: z.number().finite().nullable(),
      commitment_months: z.number().int().positive().nullable(),
      end_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
    })
    .nullable()
    .optional(),
  payment: z
    .object({
      method: z.string().max(100).nullable(),
      autopay_enabled: z.boolean().nullable(),
    })
    .nullable()
    .optional(),
  notes: z.string().max(2000).nullable().optional(),
});

export type BillParse = z.infer<typeof BillParseSchema>;
export type ParsedLineItem = z.infer<typeof BillLineItemSchema>;

export function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Content-sniff the first bytes to confirm the browser-reported MIME type.
 * Returns the detected type or null if unrecognized.
 */
export function detectFileType(bytes: Uint8Array): AcceptedMimeType | null {
  // %PDF
  if (bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) {
    return "application/pdf";
  }
  // PNG magic
  if (
    bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47
  ) {
    return "image/png";
  }
  // JPEG SOI
  if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  return null;
}

/** Strip anything that could make a storage path ambiguous. */
export function sanitizeFileName(name: string): string {
  const base = name.split(/[/\\]/).pop() ?? "bill";
  const cleaned = base.replace(/[^a-zA-Z0-9._-]/g, "_").replace(/^\.+/, "");
  return (cleaned || "bill").slice(0, 120);
}

export function formatMoney(amount: number | null | undefined, currency = "USD"): string {
  if (amount == null || Number.isNaN(amount)) return "—";
  try {
    return new Intl.NumberFormat("en-US", { style: "currency", currency }).format(amount);
  } catch {
    return `$${round2(amount).toFixed(2)}`;
  }
}

export function formatDate(date: string | null | undefined): string {
  if (!date) return "—";
  const d = new Date(`${date}T00:00:00`);
  if (Number.isNaN(d.getTime())) return date;
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}
