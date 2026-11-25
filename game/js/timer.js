// Service timer: counts down, colour-shifts green -> gold -> red, and
// ends the service (upgrade pick, or the final results).
import { SERVICES } from './config.js';

export function timerColor(timeLeft, total) {
  const frac = timeLeft / total;
  if (frac > 0.5) return '#7be495';
  if (frac > 0.25) return '#ffc53d';
  return '#ff6b5e';
}

export function formatTime(seconds) {
  const s = Math.max(0, Math.ceil(seconds));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// Returns 'service-end' when the clock hits zero, else null.
export function tickTimer(state, dt) {
  state.timeLeft -= dt;
  if (state.timeLeft <= 0) {
    state.timeLeft = 0;
    return 'service-end';
  }
  return null;
}

export function startService(state, index) {
  state.service = index;
  state.timeLeft = SERVICES[index].time;
  state.orders = [];
  state.spawnIn = 3;
}
