import { resolvePaddlePrice } from "@/lib/payments.functions";
import type { PlanId } from "@/lib/plans";

const clientToken = import.meta.env.VITE_PAYMENTS_CLIENT_TOKEN as string | undefined;

declare global {
  interface Window {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Paddle: any;
  }
}

export function getPaddleEnvironment(): "sandbox" | "live" {
  return clientToken?.startsWith("test_") ? "sandbox" : "live";
}

let initPromise: Promise<void> | null = null;

export function initializePaddle() {
  if (initPromise) return initPromise;
  if (!clientToken) return Promise.reject(new Error("Payments are not configured"));
  initPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement("script");
    script.src = "https://cdn.paddle.com/paddle/v2/paddle.js";
    script.onload = () => {
      window.Paddle.Environment.set(getPaddleEnvironment() === "sandbox" ? "sandbox" : "production");
      window.Paddle.Initialize({ token: clientToken });
      resolve();
    };
    script.onerror = () => { initPromise = null; reject(new Error("Could not load checkout")); };
    document.head.appendChild(script);
  });
  return initPromise;
}

export async function openPlanCheckout(plan: PlanId, user: { id: string; email?: string | null }) {
  await initializePaddle();
  const priceId = await resolvePaddlePrice({ data: { priceId: `${plan}_monthly` as "starter_monthly", environment: getPaddleEnvironment() } });
  window.Paddle.Checkout.open({
    items: [{ priceId, quantity: 1 }],
    customer: user.email ? { email: user.email } : undefined,
    customData: { userId: user.id },
    settings: {
      displayMode: "overlay",
      successUrl: `${window.location.origin}/pricing`,
      allowLogout: false,
      variant: "one-page",
    },
  });
}
