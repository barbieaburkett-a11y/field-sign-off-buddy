import { defineTool } from "@lovable.dev/mcp-js";
import { supabaseForUser } from "../supabase";

export default defineTool({
  name: "list_jobs",
  title: "List jobs",
  description: "List the signed-in user's jobs with their GC and address.",
  inputSchema: {},
  annotations: { readOnlyHint: true, idempotentHint: true, openWorldHint: false },
  handler: async (_args, ctx) => {
    const { data, error } = await supabaseForUser(ctx)
      .from("jobs")
      .select("id,name,gc_name,address,created_at")
      .order("created_at", { ascending: false });
    if (error) return { content: [{ type: "text", text: error.message }], isError: true };
    const jobs = (data ?? []).map((j) => ({ id: j.id, name: j.name, gc_name: j.gc_name, address: j.address }));
    return { content: [{ type: "text", text: JSON.stringify(jobs) }], structuredContent: { jobs } };
  },
});
