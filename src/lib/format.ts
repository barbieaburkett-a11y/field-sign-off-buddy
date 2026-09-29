export const money = (n: number | string | null | undefined) =>
  new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(Number(n ?? 0));

export const dateTime = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }) : "—";

export const dateOnly = (s: string | null | undefined) =>
  s ? new Date(s).toLocaleDateString("en-US", { dateStyle: "medium" }) : "—";

export type Status = "draft" | "pending" | "approved" | "rejected";

export const STATUS_LABEL: Record<Status, string> = {
  draft: "Draft",
  pending: "Pending Approval",
  approved: "Approved",
  rejected: "Rejected",
};

export const STATUS_CLASS: Record<Status, string> = {
  draft: "bg-muted text-muted-foreground",
  pending: "bg-warning text-warning-foreground",
  approved: "bg-success text-success-foreground",
  rejected: "bg-destructive text-destructive-foreground",
};

export const coNumber = (n: number) => `CD-${String(n).padStart(4, "0")}`;
