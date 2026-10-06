import { defineTool } from "@lovable.dev/mcp-js";
import { z } from "zod";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "create_draft_directive",
  title: "Create draft change directive",
  description: "Create a draft change directive on a job with a title, scope and lump-sum amount.",
  inputSchema: {
    job_id: z.string().uuid().describe("Job id from list_jobs."),
    title: z.string().trim().min(1).max(200),
    description: z.string().trim().max(5000).optional().describe("Scope of the extra work."),
    amount: z.number().min(0).describe("Lump-sum dollar amount."),
  },
  annotations: { readOnlyHint: false, destructiveHint: false, openWorldHint: false },
  handler: async ({ job_id, title, description, amount }, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("change_orders")
      .insert({ user_id: ctx.getUserId()!, job_id, title, description: description ?? "", amount, status: "draft" })
      .select("id,number")
      .single();
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const directive = { id: data.id, number: `CD-${String(data.number).padStart(4, "0")}` };
    return { content: [{ type: "text", text: `Created draft ${directive.number}. Add photos and send it from the app.` }], structuredContent: { directive } };
  },
});
