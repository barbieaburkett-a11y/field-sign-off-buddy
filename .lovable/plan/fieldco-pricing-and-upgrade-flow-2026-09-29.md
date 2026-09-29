# FieldCO pricing and upgrade flow

## Goal
Add a clear subscription experience for construction subcontractors, using a warm sand, terracotta, sage, and warm-slate visual system throughout the app.

## What will change
- Add a dedicated **Pricing** page with Starter, Pro, and Unlimited plans, monthly pricing, concise plan cards, and a full feature comparison.
- Add a reusable **Upgrade** dialog accessible from the app header and locked-feature prompts.
- Add a **14-day trial banner** showing the current trial state and a direct upgrade action.
- Add account plan data and secure entitlement checks so limits are enforced, not merely displayed.
  - Starter: 1–3 foremen, unlimited directives, on-screen signing, PDF exports.
  - Pro: up to 10 foremen, SMS routing, company logo on packets, automatic office-PM email CC.
  - Unlimited: unlimited foremen and jobs.
- Gate plan-specific actions at the point of use and provide an upgrade path when unavailable.
- Apply the earth-tone palette consistently to navigation, status treatments, forms, cards, dialogs, and print-safe surfaces while preserving readability.
- Enable Paddle’s built-in subscription payments in a test environment, then create the three recurring products and connect checkout to plan selection.

## Data and access
- Store each account’s plan, trial dates, subscription state, and Paddle customer/subscription references in Lovable Cloud.
- Keep billing updates server-controlled and validate Paddle callbacks before changing access.
- Preserve existing user-owned jobs and change directives, with secure access rules on new billing data.

## Verification
- Check phone and desktop layouts for pricing, comparison, banner, and upgrade dialog.
- Verify locked and unlocked states for each tier, trial expiry behavior, successful checkout return, and existing capture/sign/PDF workflows.
- Confirm every content page has unique sharing metadata and the app has no build or runtime errors.

## Prerequisite
Built-in payments require a paid Lovable workspace plan. The workspace is currently on Free, so Paddle setup will pause until the workspace is upgraded; the pricing UI and entitlement structure can still be built once this plan is approved.
