import { createFileRoute, Link } from "@tanstack/react-router";
import { HardHat, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LegalFooter } from "@/components/LegalPage";
import { Packet } from "@/components/Packet";
import { SAMPLE_PACKET } from "@/lib/sample-packet";

export const Route = createFileRoute("/sample-packet")({
  staticData: { sitemap: true },
  head: () => ({
    meta: [
      { title: "Sample Signed Change Directive Packet — FieldCO" },
      { name: "description", content: "See exactly what a signed FieldCO change directive packet looks like: photos, scope, price, signature and timestamps. Fictional sample data." },
      { property: "og:title", content: "Sample Signed Change Directive Packet — FieldCO" },
      { property: "og:description", content: "See exactly what a signed FieldCO change directive packet looks like. Fictional sample data." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SamplePacket,
});

function SamplePacket() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="no-print border-b bg-background">
        <div className="mx-auto flex h-16 max-w-3xl items-center justify-between px-5">
          <Link to="/" className="flex items-center gap-2 text-xl font-extrabold text-heading">
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground"><HardHat className="h-5 w-5" /></span>
            FieldCO
          </Link>
          <Button variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" /> Print / Save PDF</Button>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl flex-1 px-5 py-10">
        <p className="mb-4 rounded-md border-2 border-dashed border-primary px-3 py-2 text-sm font-semibold text-accent-foreground">
          Sample — fictional data. Not a real authorization.
        </p>
        <Packet co={SAMPLE_PACKET} />
        <div className="no-print mt-6 text-center">
          <Button variant="welcoming" size="lg" asChild className="h-14 rounded-lg text-sm font-bold uppercase">
            <Link to="/auth" search={{ mode: "signup" }}>Start 14-day free trial</Link>
          </Button>
        </div>
      </main>
      <LegalFooter />
    </div>
  );
}
