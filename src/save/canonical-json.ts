/**
 * Canonical JSON serialization for saves — the byte-identity spine.
 *
 * Saves are local JSON (Save/Load §1). Serialization is canonical (recursively
 * sorted object keys, 2-space indent, trailing newline, UTF-8) so that
 * save → load → re-serialize is byte-identical: the round-trip proof (S5) and
 * the atomic-save write-verification step (S7) both compare exact bytes.
 *
 * Silent field-dropping is forbidden: JSON.stringify quietly discards
 * `undefined`/functions and turns non-finite numbers into `null` — any of
 * those in a save blob would be hidden state loss (CLAUDE.md §5 "no hidden
 * loss"), so this serializer throws instead.
 *
 * Governing docs: SAVE_LOAD_TIME_RECONCILIATION_SPEC v0.5 §1/§15.
 * Invariant refs: S5, S7.
 */

/** Thrown when a value cannot round-trip through JSON without loss. */
export class NonSerializableSaveError extends Error {
  constructor(path: string, reason: string) {
    super(
      `save serialization refused at ${path}: ${reason} — silently dropping or ` +
        `coercing save state would be hidden loss (CLAUDE.md §5)`,
    );
    this.name = "NonSerializableSaveError";
  }
}

function canonicalize(value: unknown, path: string): unknown {
  if (value === null || typeof value === "string" || typeof value === "boolean") {
    return value;
  }
  if (typeof value === "number") {
    if (!Number.isFinite(value)) {
      throw new NonSerializableSaveError(path, `non-finite number (${value})`);
    }
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((v, i) => canonicalize(v, `${path}[${i}]`));
  }
  if (typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(value as Record<string, unknown>).sort()) {
      const v = (value as Record<string, unknown>)[key];
      if (v === undefined) {
        throw new NonSerializableSaveError(`${path}.${key}`, "undefined property");
      }
      out[key] = canonicalize(v, `${path}.${key}`);
    }
    return out;
  }
  throw new NonSerializableSaveError(path, `unsupported type "${typeof value}"`);
}

/**
 * Serialize to canonical bytes: sorted keys, 2-space indent, trailing "\n".
 * Same logical state ⇒ identical bytes, regardless of construction order.
 */
export function canonicalSerialize(value: unknown): string {
  return JSON.stringify(canonicalize(value, "$"), null, 2) + "\n";
}
