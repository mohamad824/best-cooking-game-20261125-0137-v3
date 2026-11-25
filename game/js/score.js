// Scoring: 100 per dish plus a shrinking tip, times the combo multiplier.
// The multiplier grows 0.25 per consecutive serve, capped at x3, and resets
// on a walk-out.
import { WIN_SCORE } from './config.js';

export function comboOf(state) {
  return Math.min(3, 1 + 0.25 * state.streak);
}

export function tipFor(order) {
  const frac = Math.max(0, order.patience / order.max);
  return Math.round(5 + frac * 40);
}

export function gradeFor(score, served, misses) {
  if (score >= 1400 && misses === 0) return 'S';
  if (score >= 1200) return 'A';
  if (score >= 1000) return 'B';
  if (score >= 700) return 'C';
  return 'D';
}

// Apply a serve. Returns {points, tip, combo} for the popup.
export function applyServe(state, order) {
  const tipBase = tipFor(order);
  const tip = state.upgrades.includes('tips') ? Math.round(tipBase * 1.5) : tipBase;
  const combo = comboOf(state);
  const points = Math.round((100 + tip) * combo);
  state.score += points;
  state.tips += tip;
  state.served += 1;
  state.streak += 1;
  state.bestCombo = Math.max(state.bestCombo, comboOf(state));
  return { points, tip, combo };
}

export function applyMiss(state) {
  state.misses += 1;
  state.streak = 0;
  if (state.misses >= 6) return 'lose';
  return null;
}

export function hasWon(state) {
  return state.score >= WIN_SCORE;
}
