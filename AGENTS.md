# AGENTS.md — Harbor Guardians Multi-Agent Workflow

How work flows between the five roles on Harbor Guardians, per M0 packet area 3 (`docs/M0_IMPLEMENTATION_READINESS_PACKET_v0.1.3.md` §3). Operating rules for the Implementer are in [`CLAUDE.md`](CLAUDE.md); tool permissions are pinned in [`.claude/settings.json`](.claude/settings.json).

## 1. The five roles

| Role | Who | May | May not |
| --- | --- | --- | --- |
| **Owner (Command)** | Anthony Hammon | Approve/reject specs, packets, PRs, gates; authorize milestones; promote draft PRs to ready (`gh pr ready`); merge to `main`; create repos/tags/deployments | — (all authority originates here) |
| **Architect** | Design authority (document channel) | Draft/revise doctrine in `/docs`; propose decisions; resolve escalated doctrine gaps | Write code; merge; change scope without owner approval |
| **Implementer** | Claude Code | Implement approved specs; author code, schemas, tests, seeds; open **draft** PRs (`gh pr create --draft`); run the harness | Mark a PR ready for review; merge or self-merge to `main`; commit to `main`; invent doctrine; exceed the current milestone; touch other projects' infrastructure or credentials |
| **Reviewer** | Independent reviewer | Audit docs, PRs, evidence; demand revisions; verify traceability | Mutate code or docs; approve their own suggestions into `main` |
| **QA** | Sim harness (automated) | Prove/disprove every claim via invariant suites; block merges through CI | Be bypassed — a red harness stops the line, no exceptions |

Spec flow: **Architect → Owner approval → Implementer → Reviewer → QA (harness/CI) → Owner merge.**

## 2. Handoff format

Every task handed to an agent uses this envelope:

```text
CHANNEL:            where the work happens (e.g. Claude Code terminal; document channel)
LAYER:              which project/layer — Harbor Guardians is standalone; name the subsystem
TASK:               what to do, in execution order, with explicit stop points
SAFEGUARDS:         scope limits, doctrine constraints, stop-and-ask triggers
SUCCESS CONDITION:  the testable definition of done (invariants, evidence, exit state)
CONTEXT:            governing docs/decisions, prior state, anything needed to execute cold
```

A handoff missing SAFEGUARDS or a SUCCESS CONDITION is returned, not executed.

## 3. Escalation triggers (stop-and-ask)

The Implementer halts and escalates to the Owner/Architect — never improvises — when:

1. **Missing doctrine** — no approved spec in `/docs` covers a decision the task requires.
2. **Ambiguous or conflicting doctrine** — two docs (or a doc and a decision) disagree.
3. **Invariant conflict** — the requested change cannot be implemented without breaching a foundation invariant (E/L/M/C/S/OPS/CARGO/TD/A11Y/DC/OB/GEAR/W/FCT/GDN suites).
4. **Scope breach** — a step appears to require work beyond the authorized milestone (e.g. gameplay logic during M0).
5. **Hidden-loss risk** — any path that could silently delete or degrade player value.
6. **Security/isolation breach** — anything touching secrets, credentials, or another project's infrastructure.

Resolution always runs through the document channel: doc updated → decision recorded in [`DECISIONS.md`](DECISIONS.md) → then code proceeds.

## 4. Standing boundaries

- The Implementer opens PRs **as drafts and stops there**; promoting a draft to ready and merging to `main` are **owner-only actions**. `main` is protected by an active GitHub ruleset (PR required, force-push blocked, deletion restricted — see [`CLAUDE.md`](CLAUDE.md) §4), so the boundary is mechanical as well as procedural.
- The Reviewer reads everything, writes nothing in `/src`, `/data`, `/schema`.
- QA (harness) evidence accompanies any PR that touches an invariant.
- Commits cite the governing doc + decision/invariant ID (CLAUDE.md §8).
- Permissions available to the Implementer's tooling are deliberately allow/deny-listed in [`.claude/settings.json`](.claude/settings.json); expanding them is an owner decision.
