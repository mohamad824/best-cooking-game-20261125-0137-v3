// The whole run state: one object, created fresh per run.
import { SERVICES } from './config.js';

export function freshState() {
  return {
    screen: 'title', // title | play | upgrade | results
    service: 0, // index into SERVICES
    timeLeft: SERVICES[0].time,
    score: 0,
    tips: 0,
    served: 0,
    misses: 0,
    streak: 0,
    bestCombo: 1,
    upgrades: [],
    orders: [], // {id, recipeId, patience, max, born}
    spawnIn: 4,
    nextOrderId: 1,
    // chef.carry: null | {kind:'item', id, chopped, cooked} | {kind:'dish', recipeId}
    chef: { x: 640, y: 430, dir: 1, moving: false, carry: null, chopT: 0 },
    bibi: { x: 275, y: 350, busy: 0 },
    pantrySel: 0,
    plate: [], // prepared ingredient ids on the plating counter
    plateDish: null, // recipe id once the plate matches a recipe
    stations: {
      chop1: { item: null, progress: 0 }, // chef board: {id, chopped}
      chop2: { item: null, progress: 0 }, // Bibi's board: auto-chopped
      grill1: { item: null, progress: 0 },
      grill2: { item: null, progress: 0 },
      pot: { item: null, progress: 0 },
    },
    popups: [], // {x, y, text, color, t, life}
    particles: [], // {x, y, vx, vy, t, life, color, size}
    won: false,
    grade: '',
    message: '',
    messageT: 0,
    muted: false,
    elapsed: 0,
    shake: 0,
  };
}

export function serviceOf(state) {
  return SERVICES[state.service];
}

export function resetRun(state) {
  const fresh = freshState();
  Object.assign(state, fresh);
  state.screen = 'play';
}
