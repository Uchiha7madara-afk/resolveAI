import { BillParseSchema, type BillParse } from "@/lib/validation";
import { logger } from "@/lib/logger";

const SYSTEM_PROMPT = `You are a precise bill-parsing engine. You receive a utility/telecom bill document
(PDF or image) and must extract its contents into structured JSON.

Return ONLY a JSON object, no prose, no markdown fences, matching exactly this shape:
{
  "provider": string,                    // company name, e.g. "Comcast Xfinity"
  "category": "internet" | "mobile" | "tv" | "landline" | "electricity" | "gas" | "water" | "insurance" | "other",
  "account_number": string | null,
  "billing_period_start": "YYYY-MM-DD" | null,
  "billing_period_end": "YYYY-MM-DD" | null,
  "total_amount": number | null,         // total amount due on the bill
  "currency": "USD",
  "line_items": [                        // EVERY charge on the bill, one per line
    {
      "description": string,             // exact or near-exact label from the bill
      "category": "base_service" | "usage" | "equipment" | "fee" | "tax" | "discount" | "one_time" | "other",
      "amount": number,                  // positive for charges, negative for discounts/credits
      "quantity": number | null,
      "is_recurring": boolean,           // appears every month vs one-time
      "notes": string | null
    }
  ],
  "contract": { "monthly_price": number | null, "commitment_months": number | null, "end_date": "YYYY-MM-DD" | null } | null,
  "payment": { "method": string | null, "autopay_enabled": boolean | null } | null,
  "notes": string | null                 // anything unusual about the bill
}

Rules:
- Include every line item, even tiny fees and taxes; do not merge them.
- Discounts and credits have negative amounts.
- Use null when a value is not on the bill. Never guess account numbers or dates.
- Amounts are plain numbers (49.99, not "$49.99").`;

export interface BillFile {
  buffer: ArrayBuffer;
  mimeType: "application/pdf" | "image/png" | "image/jpeg";
  fileName: string;
}

export class LlmConfigError extends Error {}
export class LlmParseError extends Error {}

function extractJson(text: string): unknown {
  const withoutFences = text
    .replace(/^\s*```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
  try {
    return JSON.parse(withoutFences);
  } catch {
    // Model occasionally wraps JSON in prose; grab the outermost braces.
    const start = withoutFences.indexOf("{");
    const end = withoutFences.lastIndexOf("}");
    if (start !== -1 && end > start) {
      return JSON.parse(withoutFences.slice(start, end + 1));
    }
    throw new LlmParseError("LLM response was not valid JSON");
  }
}

async function callAnthropic(file: BillFile, apiKey: string): Promise<unknown> {
  const model = process.env.ANTHROPIC_MODEL || "claude-sonnet-4-5";
  const base64 = Buffer.from(file.buffer).toString("base64");

  const content: Array<Record<string, unknown>> = [];
  if (file.mimeType === "application/pdf") {
    content.push({
      type: "document",
      source: { type: "base64", media_type: "application/pdf", data: base64 },
    });
  } else {
    content.push({
      type: "image",
      source: { type: "base64", media_type: file.mimeType, data: base64 },
    });
  }
  content.push({
    type: "text",
    text: "Extract this bill into the required JSON structure. Return only the JSON.",
  });

  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      max_tokens: 4096,
      temperature: 0,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error("Anthropic API error", { status: res.status, body: body.slice(0, 500) });
    throw new LlmParseError(`Bill parsing provider returned ${res.status}. Check the model name and API key.`);
  }

  const data = (await res.json()) as { content?: Array<{ type: string; text?: string }> };
  const text = (data.content ?? [])
    .filter((block) => block.type === "text")
    .map((block) => block.text ?? "")
    .join("\n");
  if (!text) throw new LlmParseError("Bill parsing provider returned an empty response");
  return extractJson(text);
}

async function callOpenAI(file: BillFile, apiKey: string): Promise<unknown> {
  if (file.mimeType === "application/pdf") {
    throw new LlmConfigError(
      "PDF bills require ANTHROPIC_API_KEY (the OpenAI provider only supports images).",
    );
  }
  const model = process.env.OPENAI_MODEL || "gpt-4o";
  const base64 = Buffer.from(file.buffer).toString("base64");
  const dataUrl = `data:${file.mimeType};base64,${base64}`;

  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      authorization: `Bearer ${apiKey}`,
      "content-type": "application/json",
    },
    body: JSON.stringify({
      model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            { type: "text", text: "Extract this bill into the required JSON structure. Return only the JSON." },
            { type: "image_url", image_url: { url: dataUrl } },
          ],
        },
      ],
    }),
  });

  if (!res.ok) {
    const body = await res.text().catch(() => "");
    logger.error("OpenAI API error", { status: res.status, body: body.slice(0, 500) });
    throw new LlmParseError(`Bill parsing provider returned ${res.status}. Check the model name and API key.`);
  }

  const data = (await res.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const text = data.choices?.[0]?.message?.content;
  if (!text) throw new LlmParseError("Bill parsing provider returned an empty response");
  return extractJson(text);
}

/**
 * Send the bill document to the configured LLM provider and return a
 * schema-validated structured parse. Throws LlmConfigError when no provider
 * is configured and LlmParseError when extraction or validation fails.
 */
export async function parseBillWithLlm(file: BillFile): Promise<BillParse> {
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openaiKey = process.env.OPENAI_API_KEY;

  let raw: unknown;
  if (anthropicKey) {
    raw = await callAnthropic(file, anthropicKey);
  } else if (openaiKey) {
    raw = await callOpenAI(file, openaiKey);
  } else {
    throw new LlmConfigError(
      "Bill parsing is not configured. Set ANTHROPIC_API_KEY (recommended, supports PDF + images) or OPENAI_API_KEY.",
    );
  }

  const parsed = BillParseSchema.safeParse(raw);
  if (!parsed.success) {
    logger.warn("LLM output failed schema validation", { issues: parsed.error.issues.slice(0, 10) });
    throw new LlmParseError(
      "The bill could not be parsed reliably. Try a clearer scan or a PDF export of the bill.",
    );
  }
  return parsed.data;
}
