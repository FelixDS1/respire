---
name: Respire pre-launch to-do list
description: Ordered list of things needed before commercial launch, to resurface regularly
type: project
---

Ordered from most to least critical. Re-surface this list if the user hasn't mentioned it in a while.

## Blocking — cannot go commercial without

1. **Stripe Connect** — therapists need to get paid; platform takes the session fee, Respire keeps the €4 service fee. Requires Stripe Connect onboarding for each therapist.
2. **Cancellation & refunds** — ✅ BUILT (24h policy, Stripe refund logic)
3. **Confirmation emails** — needs custom domain in Resend. Booking confirmation with date/time/therapist details.
4. **Password reset** — ✅ BUILT
5. **RGPD compliance** — ✅ BUILT (cookie banner, privacy/terms, account deletion)
6. **Therapist verification workflow** — ✅ BUILT (admin page + verify API)

## High priority — fix immediately after launch

7. **Appointment reminders** — email 24h before session. Needs Resend + domain.
8. **No-show handling** — ✅ BUILT (therapist flags, badge shown)
9. **Minimum profile completeness gate** — ✅ BUILT
10. **Cancellation button UI** — ✅ BUILT

## Important for trust and conversion

11. **Post-session experience** — ✅ BUILT (session notes for therapists, rebook CTA for members)
12. **Support contact** — ✅ BUILT
13. **Onboarding completeness** — ✅ BUILT (redirects to /therapists)
14. **Account deletion (RGPD)** — ✅ BUILT

## Recently built (product improvements)

15. **Revenue dashboard for therapists** — earnings by month, upcoming value, session count. 🔄 IN PROGRESS
16. **Waitlist management** — ✅ BUILT (member joins waitlist on therapist profile, manages in account)
17. **Pre-session check-in** — ✅ BUILT (mood score + note before upcoming sessions, visible to therapist)
18. **Secure messaging** — member ↔ therapist messaging via Supabase realtime. 🔄 IN PROGRESS (PREMIUM)
19. **€4 service fee** — ✅ BUILT (baked into displayed price, invisible to therapist)

## Longer-term — strategic features

20. **Mon Soutien Psy integration** — `is_mon_soutien_psy` flag on therapist profile; conventionné therapists locked at €50/session; patient uploads referral letter; badge shown on listing. Requires verifying ADELI convention status during onboarding.
21. **Invoicing / feuilles de soins automation** — generate compliant receipts for members, integrate with Ameli reimbursement flow for Mon Soutien Psy sessions. Major differentiator vs Doctolib.
22. **Progress tracking** — mood/sleep/anxiety scales over time for members, visualised as charts. Uses check-in data already being collected.
23. **Freemium gate for therapists** — separate core (free) from premium features. Core: profile, agenda, appointments, session notes. Premium: messaging, revenue dashboard, waitlist management, advanced analytics.
24. **Referral tools** — psychiatrist can refer patient to psychologist within Respire (cross-practitioner flow).
25. **Supervision / peer tools** — practitioners can connect with peers in the network; makes Respire a professional community not just a booking tool.
26. **Psychoeducation content** — supportive content between sessions (not therapy); keeps members engaged on platform.

**Why:** Business model changed to €4 fixed member fee per session (not a % of therapist fee, for regulatory reasons). Therapist side moves to freemium. Pre-launch checklist discussed 2026-04-09/10.
**How to apply:** Proactively mention this list if user hasn't referenced it in a while. Flag new features as CORE or PREMIUM when building.
