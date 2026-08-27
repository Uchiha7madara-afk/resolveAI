"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/utils/supabase/server";

const ALLOWED_TRANSITIONS: Record<string, string[]> = {
  suggested: ["in_progress", "cancelled"],
  in_progress: ["won", "lost", "cancelled"],
  won: [],
  lost: ["suggested"],
  cancelled: ["suggested"],
};

async function transitionNegotiation(formData: FormData, target: string): Promise<void> {
  const id = String(formData.get("id") ?? "");
  if (!id) return;

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return;

  const { data: negotiation } = await supabase
    .from("negotiations")
    .select("id, status, potential_monthly_savings")
    .eq("id", id)
    .eq("user_id", user.id)
    .maybeSingle();
  if (!negotiation) return;

  if (!ALLOWED_TRANSITIONS[negotiation.status]?.includes(target)) return;

  const update: Record<string, unknown> = { status: target };
  if (target === "won") {
    const raw = formData.get("actual_amount");
    const parsed = raw != null && String(raw).trim() !== "" ? Number(raw) : NaN;
    update.actual_monthly_savings =
      Number.isFinite(parsed) && parsed >= 0 ? parsed : negotiation.potential_monthly_savings;
  }
  if (target === "lost" || target === "cancelled") {
    update.actual_monthly_savings = null;
  }

  await supabase.from("negotiations").update(update).eq("id", id);
  revalidatePath("/dashboard/negotiations");
  revalidatePath("/dashboard");
}

export async function startNegotiation(formData: FormData) {
  return transitionNegotiation(formData, "in_progress");
}

export async function markWon(formData: FormData) {
  return transitionNegotiation(formData, "won");
}

export async function markLost(formData: FormData) {
  return transitionNegotiation(formData, "lost");
}

export async function cancelNegotiation(formData: FormData) {
  return transitionNegotiation(formData, "cancelled");
}
