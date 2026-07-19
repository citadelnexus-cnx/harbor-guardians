/**
 * Schema-validated loader for the A3 TEST-ONLY event fixtures — the single
 * gate through which the harness and tests obtain event definitions. The sim
 * core (src/sim) is pure and does no I/O; file access + ajv validation live
 * here (Sim §2: the harness consumes ONLY schema-validated inputs).
 *
 * These fixtures live under tests/fixtures/events/ — deliberately OUTSIDE
 * the /data seed-discovery path (scripts/validate-data.mjs SEED_SETS is
 * untouched): no real event content exists, no runtime code loads events,
 * and nothing here can make a fixture look like production content
 * (ALPHA_A3_EXECUTION_BRIEF v0.1 §2 — "No real event content").
 *
 * Governing docs: SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2; 15_EVENT_SYSTEM_
 * SPEC v0.2 §3; ALPHA_A3_EXECUTION_BRIEF v0.1 §1/§2; D39 (generated schema).
 * Invariant refs: EVT1 (pure data, schema-validated, invalid rejected).
 */

import { readFileSync } from "node:fs";
import Ajv from "ajv";
import type { EventFixtureSeed } from "../src/contracts/event.js";

export const EVENT_FIXTURE_DIR = "tests/fixtures/events";
export const EVENT_FIXTURE_SCHEMA_PATH = "schema/event_fixture_seed.schema.json";

export const CHOICE_EVENT_FIXTURE_PATH = `${EVENT_FIXTURE_DIR}/expedition.choice.valid.json`;
export const IMPOSED_EVENT_FIXTURE_PATH = `${EVENT_FIXTURE_DIR}/event.imposed.valid.json`;
export const BROKEN_EVENT_FIXTURE_PATH = `${EVENT_FIXTURE_DIR}/event.broken.invalid.json`;

/** Thrown when an event fixture fails schema validation — nothing downstream may consume it (EVT1/DC5 stance). */
export class EventFixtureValidationError extends Error {
  constructor(detail: string) {
    super(`event fixture failed schema validation — refusing to load (EVT1): ${detail}`);
    this.name = "EventFixtureValidationError";
  }
}

/**
 * Load and schema-validate one event fixture. Throws
 * EventFixtureValidationError on any violation; on success the returned
 * object is the only source of event definitions for harness checks and
 * tests (test-supplied inputs, exactly like A2's reward drafts).
 */
export function loadEventFixture(fixturePath: string): EventFixtureSeed {
  const schema = JSON.parse(readFileSync(EVENT_FIXTURE_SCHEMA_PATH, "utf8"));
  const ajv = new Ajv({ allErrors: true, allowUnionTypes: true });
  const validate = ajv.compile(schema);
  const fixture: unknown = JSON.parse(readFileSync(fixturePath, "utf8"));
  if (!validate(fixture)) {
    throw new EventFixtureValidationError(ajv.errorsText(validate.errors, { separator: "; " }));
  }
  return fixture as EventFixtureSeed;
}
