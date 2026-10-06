import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export type ScanResult = {
  job_name: string | null;
  title: string | null;
  description: string | null;
  amount: number | null;
  foreman_name: string | null;
};

const schema = {
  type: "object",
  additionalProperties: false,
  required: ["job_name", "title", "description", "amount", "foreman_name"],
  properties: {
    job_name: { type: ["string", "null"], description: "Project/job name as written, or null" },
    title: { type: ["string", "null"], description: "Short title, under 70 characters" },
    description: { type: ["string", "null"], description: "Scope of work: what changed, where, and what will be done" },
    amount: { type: ["number", "null"], description: "Lump-sum total in US dollars exactly as written, or null if not legible" },
    foreman_name: { type: ["string", "null"] },
  },
};

export const scanDocument = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((d) =>
    z.object({ image: z.string().startsWith("data:image/").max(8_000_000), jobs: z.array(z.string()).max(200) }).parse(d),
  )
  .handler(async ({ data }): Promise<{ ok: true; result: ScanResult } | { ok: false; error: string }> => {
    const apiKey = process.env["LOVABLE_API_KEY"];
    if (!apiKey) return { ok: false, error: "AI is not configured." };
    const prompt = `You read photos of construction field paperwork (handwritten change directives, GC mark-ups, T&M tickets, supplier invoices) for a subcontractor. Extract fields for a change directive. Copy dollar amounts exactly; never guess a number you cannot read — use null. If the job matches one of these existing jobs, return that exact name: ${JSON.stringify(data.jobs)}. Write the description as a clear, professional scope a GC would sign. Use null for anything not present.`;
    const res = await fetch("https://ai.gateway.lovable.dev/v1/responses", {
      method: "POST",
      headers: { "Content-Type": "application/json", "Lovable-API-Key": apiKey, "X-Lovable-AIG-SDK": "fetch" },
      body: JSON.stringify({
        model: "openai/gpt-6-astra",
        stream: true,
        store: false,
        reasoning: { effort: "low", summary: "auto" },
        include: ["reasoning.encrypted_content"],
        text: { format: { type: "json_schema", name: "change_directive", strict: true, schema } },
        input: [
          {
            role: "user",
            content: [
              { type: "input_text", text: prompt },
              { type: "input_image", image_url: data.image },
            ],
          },
        ],
      }),
    });
    if (!res.ok || !res.body) {
      const body = await res.text().catch(() => "");
      let msg = "Couldn't read the photo. Please fill in the form by hand.";
      if (res.status === 429) msg = "AI is busy right now — try again in a minute.";
      else if (res.status === 402) msg = "AI credits have run out for this workspace.";
      else {
        try { msg = JSON.parse(body)?.error?.message ?? msg; } catch { /* keep default */ }
      }
      console.error("scan failed", res.status, body.slice(0, 500));
      return { ok: false, error: msg };
    }
    const reader = res.body.getReader();
    const dec = new TextDecoder();
    let buf = "", text = "", err = "";
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += dec.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.startsWith("data:")) continue;
        const p = line.slice(5).trim();
        if (!p || p === "[DONE]") continue;
        try {
          const ev = JSON.parse(p);
          if (ev.type === "response.output_text.delta") text += ev.delta ?? "";
          else if (ev.type === "error" || ev.type === "response.failed") err = ev.error?.message ?? ev.response?.error?.message ?? "AI request failed";
        } catch { /* partial */ }
      }
    }
    if (err) return { ok: false, error: err };
    if (!text) return { ok: false, error: "Nothing readable was found in that photo." };
    try {
      return { ok: true, result: JSON.parse(text) as ScanResult };
    } catch {
      return { ok: false, error: "Couldn't understand the AI's answer. Please try again." };
    }
  });
