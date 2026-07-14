/**
 * Fixed-seed determinism spine — the seeded PRNG the harness (and later the
 * sim core's tests) drive runs with, plus the repeat-run proof.
 *
 * Governing docs:
 *   - SIM_HARNESS_ACCEPTANCE_SPEC v0.6.2 §2 ("Deterministic, seedable,
 *     rendering-free core"), §8 (evidence: command, output, exit code, seed)
 *   - M0 packet §8 ("Headless sim harness drives the pure sim core
 *     deterministically (fixed seeds → reproducible runs)")
 * Invariant refs: TD1 (deterministic threat advance) and E21 (seeded
 * online/offline consistency) will consume this PRNG when implemented.
 *
 * No gameplay numbers here — PRNG constants are algorithm constants
 * (splitmix32), not gameplay values.
 */

/** Deterministic 32-bit PRNG (splitmix32). Same seed → identical stream. */
export function createRng(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x9e3779b9) >>> 0;
    let z = state;
    z = Math.imul(z ^ (z >>> 16), 0x21f0aaad);
    z = Math.imul(z ^ (z >>> 15), 0x735a2d97);
    z = z ^ (z >>> 15);
    return (z >>> 0) / 0x100000000;
  };
}

/**
 * Repeat-run determinism proof: execute the batch computation twice with the
 * same seed and require byte-identical canonical JSON. This is the M0 form of
 * "same seed + same input = identical output"; feature PRs extend the batch,
 * and this proof keeps holding over the grown output.
 */
export function proveRepeatRunDeterminism(
  seed: number,
  batch: (seed: number) => unknown,
): { pass: boolean; detail: string } {
  const first = JSON.stringify(batch(seed));
  const second = JSON.stringify(batch(seed));
  if (first === second) {
    return {
      pass: true,
      detail: `repeat-run proof: two runs with seed ${seed} produced byte-identical canonical output (${first.length} bytes)`,
    };
  }
  let at = 0;
  while (at < Math.min(first.length, second.length) && first[at] === second[at]) at += 1;
  return {
    pass: false,
    detail: `repeat-run proof FAILED: runs with seed ${seed} diverge at byte ${at} — the harness is not deterministic`,
  };
}
