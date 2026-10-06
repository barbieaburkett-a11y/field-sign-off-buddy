import { auth, defineMcp } from "@lovable.dev/mcp-js";
import listJobs from "./tools/list-jobs";
import listDirectives from "./tools/list-change-directives";
import createDraft from "./tools/create-draft-directive";

const projectRef = import.meta.env["VITE_SUPABASE_PROJECT_ID"] ?? "project-ref-unset";

export default defineMcp({
  name: "field-approve",
  title: "Field Approve",
  version: "0.1.0",
  instructions:
    "FieldCO tools for construction change directives. Use `list_jobs` to find jobs, `list_change_directives` to review status and dollar totals, and `create_draft_directive` to start a draft.",
  auth: auth.oauth.issuer({
    issuer: `https://${projectRef}.supabase.co/auth/v1`,
    acceptedAudiences: "authenticated",
  }),
  tools: [listJobs, listDirectives, createDraft],
});
