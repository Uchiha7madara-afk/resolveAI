import { NextResponse, type NextRequest } from "next/server";
import { createClient } from "@/utils/supabase/server";
import { logger } from "@/lib/logger";
import {
  ACCEPTED_MIME_TYPES,
  MAX_FILE_SIZE_BYTES,
  detectFileType,
  sanitizeFileName,
} from "@/lib/validation";

export const runtime = "nodejs";

const MAX_UPLOADS_PER_DAY = 20;

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    let form: FormData;
    try {
      form = await request.formData();
    } catch {
      return NextResponse.json({ error: "Expected multipart form data" }, { status: 400 });
    }

    const file = form.get("file");
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "Missing 'file' field" }, { status: 400 });
    }
    if (file.size === 0 || file.size > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        { error: `File must be between 1 byte and 10 MB (got ${file.size} bytes)` },
        { status: 400 },
      );
    }
    if (!ACCEPTED_MIME_TYPES.includes(file.type as (typeof ACCEPTED_MIME_TYPES)[number])) {
      return NextResponse.json(
        { error: `Unsupported file type ${file.type}. Use PDF, PNG, or JPEG.` },
        { status: 415 },
      );
    }

    // Trust content, not the browser's label: sniff magic bytes.
    const header = new Uint8Array(await file.slice(0, 8).arrayBuffer());
    const sniffedType = detectFileType(header);
    if (sniffedType !== file.type) {
      return NextResponse.json(
        { error: "File contents do not match its type. Upload a valid PDF, PNG, or JPEG." },
        { status: 415 },
      );
    }

    // Simple per-user rate limit to prevent storage abuse.
    const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { count, error: countError } = await supabase
      .from("bills")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", dayAgo);
    if (countError) throw countError;
    if ((count ?? 0) >= MAX_UPLOADS_PER_DAY) {
      return NextResponse.json(
        { error: "Upload limit reached (20 bills per day). Try again tomorrow." },
        { status: 429 },
      );
    }

    const buffer = await file.arrayBuffer();
    const fileName = sanitizeFileName(file.name);

    // Create the bill row first so the storage path can include its id.
    const { data: bill, error: insertError } = await supabase
      .from("bills")
      .insert({
        user_id: user.id,
        status: "pending",
        file_name: fileName,
        file_type: sniffedType,
        file_size_bytes: file.size,
        file_path: "pending",
      })
      .select("id")
      .single();
    if (insertError || !bill) throw insertError ?? new Error("Failed to create bill record");

    const storagePath = `${user.id}/${bill.id}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from("bills")
      .upload(storagePath, buffer, {
        contentType: sniffedType,
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      // Don't leave an orphaned row pointing at nothing.
      await supabase.from("bills").delete().eq("id", bill.id);
      logger.error("Storage upload failed", { billId: bill.id, error: uploadError.message });
      return NextResponse.json(
        { error: "Could not store the uploaded file. Please try again." },
        { status: 500 },
      );
    }

    const { error: pathError } = await supabase
      .from("bills")
      .update({ file_path: storagePath })
      .eq("id", bill.id);
    if (pathError) throw pathError;

    logger.info("Bill uploaded", { billId: bill.id, userId: user.id, size: file.size });
    return NextResponse.json({ id: bill.id }, { status: 201 });
  } catch (err) {
    logger.error("Upload route failed", { error: err instanceof Error ? err.message : String(err) });
    return NextResponse.json({ error: "Unexpected server error" }, { status: 500 });
  }
}
