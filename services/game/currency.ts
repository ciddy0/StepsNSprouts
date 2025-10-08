

export const STEPS_PER_POME = 100; // 100 steps = 1 pome

// Convert steps to pomes (currency)
export function stepsToPomes(steps: number): number {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  return Math.floor(steps / STEPS_PER_POME);
}

// Calculate remaining steps towards the next pome
export function stepsRemainder(steps: number): number {
  if (!Number.isFinite(steps) || steps <= 0) return 0;
  return Math.max(0, steps % STEPS_PER_POME);
}

