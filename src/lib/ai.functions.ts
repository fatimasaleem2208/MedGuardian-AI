import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const MODEL = "openai/gpt-oss-120b";
const GATEWAY = "https://api.groq.com/openai/v1/chat/completions";

const SAFETY_RULES = `You are the MedGuardian AI Assistant, an educational medication-safety assistant.
Rules you must always follow:
- Give clear, simple, plain-language explanations. Avoid unnecessary jargon; explain any term you must use.
- You provide EDUCATIONAL information only. You never diagnose, never prescribe, and never claim to replace a doctor or pharmacist.
- Encourage the user to confirm anything important with their pharmacist or prescriber.
- If the question describes a possible emergency (chest pain, trouble breathing, severe bleeding, suspected overdose, anaphylaxis, stroke symptoms, suicidal thoughts), begin the answer by advising urgent/emergency medical attention.
- Prefer the structured database context supplied below over your own recall. If the context does not cover something, say so plainly instead of inventing medication facts.
- Keep answers under about 250 words unless the user asks for detail. Use short paragraphs or bullet points.`;

const ChatInput = z.object({
  messages: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().min(1).max(4000),
      }),
    )
    .min(1)
    .max(30),
  context: z.string().max(12000).default(""),
  task: z
    .enum(["chat", "prescription", "lab", "counseling"])
    .default("chat"),
});

const TASK_PROMPT: Record<string, string> = {
  chat: "Answer the user's medication question.",
  prescription:
    "The user has uploaded a prescription. Explain, in simple everyday language, what each medicine is for and how it should be taken. Add a note that OCR/AI extraction can contain errors and details must be verified with the pharmacist or prescriber.",
  lab: "The user has uploaded a laboratory report. Explain each flagged/abnormal result in simple language, what the reference range means, and general reasons a value can be outside range. Do not diagnose. State clearly this is educational only.",
  counseling:
    "Produce concise medication counseling points suitable for a pharmacist to share with a patient.",
};

async function callGateway(body: unknown, apiKey: string) {
  const res = await fetch(GATEWAY, {
    method: "POST",
    headers: {
  "Content-Type": "application/json",
  Authorization: `Bearer ${apiKey}`,
},
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    let message = text;
    try {
      const parsed = JSON.parse(text) as { error?: { message?: string }; message?: string };
      message = parsed.error?.message ?? parsed.message ?? text;
    } catch {
      /* keep raw text */
    }
    if (res.status === 429) {
      return { ok: false as const, status: 429, message: "The assistant is rate limited right now. Please try again in a moment." };
    }
    if (res.status === 402) {
      return { ok: false as const, status: 402, message: message || "AI credits are exhausted for this workspace." };
    }
    return { ok: false as const, status: res.status, message: message || "The assistant is unavailable right now." };
  }

  const data = (await res.json()) as { choices?: Array<{ message?: { content?: string } }> };
  return { ok: true as const, status: 200, message: data.choices?.[0]?.message?.content?.trim() ?? "" };
}

export const askAssistant = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ChatInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) {
      return { ok: false, message: "The AI assistant is not configured on this deployment." };
    }

    const system = [
      SAFETY_RULES,
      TASK_PROMPT[data.task] ?? TASK_PROMPT["chat"],
      data.context
        ? `\n--- VERIFIED DATABASE CONTEXT (prefer this) ---\n${data.context}\n--- END CONTEXT ---`
        : "\nNo database context was retrieved for this question. Answer generally and say the platform database does not hold this entry.",
    ].join("\n\n");

    const result = await callGateway(
      {
        model: MODEL,
        messages: [{ role: "system", content: system }, ...data.messages],
      },
      apiKey,
    );

    return { ok: result.ok, message: result.message };
  });

const ExtractInput = z.object({
  kind: z.enum(["prescription", "lab"]),
  fileName: z.string().max(200),
  text: z.string().max(20000).default(""),
});

export const extractDocument = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ExtractInput.parse(input))
  .handler(async ({ data }) => {
    const apiKey = process.env["GROQ_API_KEY"];
    if (!apiKey) return { ok: false, message: "The AI service is not configured on this deployment." };

    const schemaHint =
      data.kind === "prescription"
        ? `Return STRICT JSON: {"items":[{"medicine":"","strength":"","dose":"","frequency":"","route":"","duration":"","prn":"","instructions":"","explanation":""}],"summary":""}
"explanation" must be a one-sentence plain-language instruction for the patient.`
        : `Return STRICT JSON: {"rows":[{"test":"","result":"","unit":"","range":"","status":"Normal|Low|High","explanation":""}],"summary":""}
"explanation" is only needed for abnormal rows and must be educational, never a diagnosis.`;

    const source = data.text
      ? `Document text supplied by the user:\n${data.text}`
      : `No machine-readable text was extracted from the uploaded file "${data.fileName}". Produce a realistic, clearly typical example of a ${data.kind === "prescription" ? "prescription" : "laboratory report"} so the user can see how the analysis works, and set "summary" to note that this is a demonstration extraction because the file text could not be read.`;

    const result = await callGateway(
      {
        model: MODEL,
        messages: [
          {
            role: "system",
            content: `${SAFETY_RULES}\n\nYou extract structured data from medical documents. ${schemaHint}\nRespond with JSON only — no markdown fences, no commentary.`,
          },
          { role: "user", content: source },
        ],
      },
      apiKey,
    );

    if (!result.ok) return { ok: false, message: result.message };

    const cleaned = result.message.replace(/^```(?:json)?/i, "").replace(/```$/, "").trim();
    try {
      return { ok: true, data: JSON.parse(cleaned) as unknown };
    } catch {
      return { ok: false, message: "The analysis could not be read. Please try uploading the document again." };
    }
  });
