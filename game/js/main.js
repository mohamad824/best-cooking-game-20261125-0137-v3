// Ember Hearth — Night Market Kitchen, v3.
// Game loop, screen flow, clicks and the wiring between the modules.
import { W, H, SERVICES, UPGRADES } from './config.js';
import { freshState, resetRun, serviceOf } from './state.js';
import { gradeFor } from './score.js';
import { tickTimer, startService } from './timer.js';
import { tickOrders } from './orders.js';
import { interact, tickStations, nearestStation, STATIONS } from './stations.js';
import { tickChef } from './chef.js';
import { AudioSys } from './audio.js';
import { Input } from './input.js';
import { render, TITLE_START, RESULTS_AGAIN, UPGRADE_CARDS } from './render.js';
import { stageShot } from './shots.js';

const canvas = document.getElementById('game');
const ctx = canvas.getContext('2d');
const state = freshState();
const audio = new AudioSys();
const input = new Input(canvas);

let last = performance.now();
let t = 0;
let shotMode = null;
let frozen = false;

function inRect(x, y, r) {
  return x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;
}

function endRun(won) {
  state.won = won;
  state.grade = gradeFor(state.score, state.served, state.misses);
  state.screen = 'results';
  if (won) audio.win();
  else audio.bad();
}

function startGame() {
  resetRun(state);
  audio.ensure();
}

// --- input wiring -------------------------------------------------------
input.onPressE = () => {
  if (state.screen !== 'play') return;
  interact(state, audio);
};
input.onPressQ = () => {
  if (state.screen !== 'play') return;
  if (state.plate.length && !state.plateDish) {
    state.plate = [];
    state.message = 'Plate scrapped.';
    state.messageT = 1.5;
  }
};
input.onPressM = () => {
  state.muted = !state.muted;
  audio.muted = state.muted;
};
input.onDigit = (n) => {
  if (state.screen === 'play') {
    if (n >= 1 && n <= 6) state.pantrySel = n - 1;
    return;
  }
  if (state.screen === 'upgrade' && n >= 1 && n <= 3) pickUpgrade(n - 1);
};
input.onConfirm = () => {
  if (state.screen === 'title') startGame();
  else if (state.screen === 'results') startGame();
};
input.onClick = (x, y) => {
  audio.ensure();
  if (state.screen === 'title') {
    if (inRect(x, y, TITLE_START)) startGame();
    return;
  }
  if (state.screen === 'results') {
    if (inRect(x, y, RESULTS_AGAIN)) startGame();
    return;
  }
  if (state.screen === 'upgrade') {
    for (let i = 0; i < 3; i++) {
      if (inRect(x, y, UPGRADE_CARDS[i])) pickUpgrade(i);
    }
    return;
  }
  if (state.screen !== 'play') return;
  // Click a pantry item to select it; click a station to walk there.
  for (let i = 0; i < 6; i++) {
    const iy = STATIONS.pantry.y + 4 + i * 60;
    if (x >= STATIONS.pantry.x && x <= STATIONS.pantry.x + STATIONS.pantry.w && y >= iy && y <= iy + 54) {
      state.pantrySel = i;
      state.chef.target = { x: 150, y: 360 };
      return;
    }
  }
  for (const [id, r] of Object.entries(STATIONS)) {
    if (inRect(x, y, r)) {
      state.chef.target = { x: Math.min(Math.max(r.x + r.w / 2, 150), 1080), y: Math.min(Math.max(r.y + r.h + 30, 300), 585) };
      return;
    }
  }
  state.chef.target = { x: Math.min(Math.max(x, 140), 1080), y: Math.min(Math.max(y, 300), 585) };
};

function pickUpgrade(i) {
  const up = UPGRADES[i];
  if (!up || state.upgrades.includes(up.id)) return;
  state.upgrades.push(up.id);
  audio.chime();
  const next = state.service + 1;
  if (next >= SERVICES.length) {
    endRun(state.score >= 1000);
    return;
  }
  startService(state, next);
  state.screen = 'play';
}

// --- per-frame update ---------------------------------------------------
function update(dt) {
  t += dt;
  state.elapsed += dt;
  if (state.messageT > 0) state.messageT -= dt;
  for (const p of state.popups) p.t += dt;
  state.popups = state.popups.filter((p) => p.t < p.life);
  for (const pt of state.particles) {
    pt.t += dt;
    pt.x += pt.vx * dt;
    pt.y += pt.vy * dt;
    pt.vy += 60 * dt;
  }
  state.particles = state.particles.filter((p) => p.t < p.life);
  if (state.screen !== 'play') return;
  if (shotMode) return; // staged shots hold still
  tickChef(state, dt, input.keys);
  tickStations(state, dt, input.keys);
  if (tickOrders(state, dt) === 'lose') {
    endRun(false);
    return;
  }
  if (tickTimer(state, dt) === 'service-end') {
    if (state.service < SERVICES.length - 1) {
      state.screen = 'upgrade';
    } else {
      endRun(state.score >= 1000);
    }
    return;
  }
  if (state.pendingWin) {
    state.pendingWin = false;
    endRun(true);
  }
}

function frame(now) {
  const dt = Math.min(0.05, (now - last) / 1000);
  last = now;
  update(dt);
  render(ctx, state, t);
  requestAnimationFrame(frame);
}

// --- screenshot staging -------------------------------------------------
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  shotMode = shot;
  stageShot(state, shot);
  // Freeze the clock for a stable capture, but let one frame render.
  frozen = true;
  t = 2.4;
  render(ctx, state, t);
  // Keep rendering the same frozen frame so the canvas stays live.
  setInterval(() => render(ctx, state, t), 100);
} else {
  requestAnimationFrame(frame);
}

// Test / automation hooks (used by the headless play-test, not by players).
window.__ember = {
  state,
  start: startGame,
  interact: () => interact(state, audio),
  pickUpgrade,
  endRun,
  version: 'v3',
};
