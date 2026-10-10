import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LegalFooter } from "@/components/LegalPage";

export const Route = createFileRoute("/reset-password")({
  staticData: { sitemap: false },
  head: () => ({
    meta: [
      { title: "Set a new password — FieldCO" },
      { name: "description", content: "Choose a new password for your FieldCO account." },
      { property: "og:title", content: "Set a new password — FieldCO" },
      { property: "og:description", content: "Choose a new password for your FieldCO account." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ResetPassword,
});

function ResetPassword() {
  const navigate = useNavigate();
  const [pw, setPw] = useState("");
  const [busy, setBusy] = useState(false);
  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setBusy(true);
    const { error } = await supabase.auth.updateUser({ password: pw });
    setBusy(false);
    if (error) { toast.error(/session/i.test(error.message) ? "This reset link has expired. Request a new one from the sign-in page." : error.message); return; }
    toast.success("Password updated");
    navigate({ to: "/" });
  };
  return (
    <div className="flex min-h-screen flex-col">
      <main className="mx-auto w-full max-w-sm flex-1 px-6 py-16">
        <Link to="/" className="font-display text-lg font-bold">FieldCO</Link>
        <h1 className="mt-6 text-2xl font-bold">Set a new password</h1>
        <form onSubmit={submit} className="mt-6 space-y-3 rounded-xl bg-card p-5">
          <div>
            <Label htmlFor="pw">New password</Label>
            <Input id="pw" type="password" autoComplete="new-password" required minLength={6} value={pw} onChange={(e) => setPw(e.target.value)} className="h-11" />
          </div>
          <Button type="submit" className="h-11 w-full" disabled={busy}>{busy ? "Saving…" : "Save new password"}</Button>
        </form>
      </main>
      <LegalFooter />
    </div>
  );
}
