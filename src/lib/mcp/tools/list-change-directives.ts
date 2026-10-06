import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_change_directives",
  title: "List change directives",
  description: "List change directives, optionally filtered by status or job, with amounts and dates.",
  inputSchema: {
    status: z.enum(["draft", "pending", "approved", "rejected"]).optional().describe("Filter by status."),
    job_id: z.string().uuid().optional().describe("Filter by job id."),
    limit: z.number().int().min(1).max(200).optional().describe("Max rows, default 50."),
  },
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async ({ status, job_id, limit }, ctx) => {
    let q = supabaseForUser(ctx)
      .from("change_orders")
      .select("id,number,title,description,amount,status,created_at,sent_at,signed_at,signer_name,jobs(name)")
      .order("created_at", { ascending: false })
      .limit(limit ?? 50);
    if (status) q = q.eq("status", status);
    if (job_id) q = q.eq("job_id", job_id);
    const { data, error } = await q;
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const directives = (data ?? []).map((c) => ({
      id: c.id,
      number: `CD-${String(c.number).padStart(4, "0")}`,
      job: (c.jobs as unknown as { name: string } | null)?.name ?? null,
      title: c.title,
      description: c.description,
      amount: Number(c.amount),
      status: c.status,
      created_at: c.created_at,
      sent_at: c.sent_at,
      signed_at: c.signed_at,
      signer_name: c.signer_name,
    }));
    return { content: [{ type: "text", text: JSON.stringify(directives) }], structuredContent: { directives } };
  },
});
