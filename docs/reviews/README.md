# /docs/reviews

**One responsibility:** external-review and disposition artifacts — reviews of the design corpus, their owner-approved dispositions, and deferral records.

These record *what was reviewed and what was decided about it*; they are not design doctrine themselves. Doctrine lives in `/docs/foundation` and `/docs/phase-b`; decisions extracted from these reviews live in [`/DECISIONS.md`](../../DECISIONS.md).

## Contents

| File | What it is | Status |
| --- | --- | --- |
| `13_DESIGN_REVIEW_DISPOSITION_v0.2.md` | Disposition of the external design review "Harbor Guardians — Design Review & Strategic Recommendations" (2026-07-12); records R-D1–R-D6 | APPROVED — R-D1–R-D6 planning-locked 2026-07-12 |
| `HG_DEEP_ROOTS_PILLAR_REFINEMENT_PASSALONG_2026-07-13.md` | Independent reviewer's Deep Roots pillar-refinement recommendation (proposes 14_DESIGN_PILLARS v0.2) | AUDIT / RECOMMENDATION — deferred; pillars v0.2 refinement runs in the document channel, not in M0 |

## Known gap (recorded at M0 Step 4)

The external design review document itself ("Harbor Guardians — Design Review & Strategic Recommendations", 2026-07-12) was **not found on the build machine** at install time — only its disposition (which quotes and dispositions it in full) is filed here. Per disposition §7.4 the review is to be filed in this folder alongside the disposition; the owner should supply the file so it can be added in a follow-up commit. No doctrine depends on the missing file: everything actionable from it is captured in the disposition and R-D1–R-D6.
