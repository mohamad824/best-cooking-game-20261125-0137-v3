// Deterministic screenshot staging: ?shot=cover|title|service|results
// puts the game into a fixed, mid-action state so the screenshots are real
// renders of the running game, not drawings. Used only for screenshots;
// normal play never calls this.
import { RECIPES } from './recipes.js';
import { gradeFor } from './score.js';

function ticket(state, recipeId, frac) {
  const max = 30;
  state.orders.push({ id: state.nextOrderId++, recipeId, patience: max * frac, max });
}

export function stageShot(state, name) {
  if (name === 'title') {
    state.screen = 'title';
    return;
  }
  if (name === 'results') {
    state.screen = 'results';
    state.won = true;
    state.score = 1240;
    state.served = 12;
    state.tips = 310;
    state.bestCombo = 2.75;
    state.misses = 2;
    state.grade = gradeFor(1240, 12, 2);
    return;
  }
  if (name === 'service') {
    state.screen = 'play';
    state.service = 1;
    state.timeLeft = 51;
    state.score = 380;
    state.streak = 2;
    state.served = 4;
    state.tips = 120;
    state.misses = 0;
    state.orders = [];
    ticket(state, 'ricebowl', 0.8);
    ticket(state, 'skewer', 0.35);
    ticket(state, 'fishplate', 0.65);
    state.chef.x = 205;
    state.chef.y = 445;
    state.chef.carry = null;
    state.stations.chop1.item = { kind: 'item', id: 'mushroom', chopped: true, grilled: false, boiled: false };
    state.stations.grill1.item = { kind: 'item', id: 'mushroom', chopped: true, grilled: true, boiled: false };
    state.stations.pot.item = { kind: 'item', id: 'rice', chopped: false, grilled: false, boiled: false };
    state.stations.pot.progress = 1.8;
    state.plate = [];
    state.plateDish = null;
    return;
  }
  // cover: Dinner Rush climax.
  state.screen = 'play';
  state.service = 2;
  state.timeLeft = 42;
  state.score = 640;
  state.streak = 6;
  state.served = 7;
  state.tips = 215;
  state.misses = 0;
  state.orders = [];
  ticket(state, 'skewer', 0.85);
  ticket(state, 'noodle', 0.55);
  ticket(state, 'ricebowl', 0.7);
  ticket(state, 'fishplate', 0.45);
  state.chef.x = 820;
  state.chef.y = 430;
  state.chef.carry = { kind: 'dish', recipeId: 'skewer' };
  state.stations.chop1.item = { kind: 'item', id: 'pepper', chopped: true, grilled: false, boiled: false };
  state.stations.chop2.item = { kind: 'item', id: 'pepper', chopped: false, grilled: false, boiled: false };
  state.stations.chop2.progress = 1.0;
  state.bibi.busy = 1;
  state.bibi.x = 310;
  state.bibi.y = 335;
  state.stations.grill1.item = { kind: 'item', id: 'meat', chopped: true, grilled: true, boiled: false };
  state.stations.grill2.item = { kind: 'item', id: 'mushroom', chopped: true, grilled: true, boiled: false };
  state.stations.pot.item = { kind: 'item', id: 'noodle', chopped: false, grilled: false, boiled: false };
  state.stations.pot.progress = 2.2;
  state.plate = ['noodle', 'mushroom'];
  state.plateDish = null;
  state.popups = [
    { x: 640, y: 330, text: '+250  EMBER SKEWER', color: '#ffc53d', t: 0.2, life: 1.6 },
    { x: 940, y: 260, text: 'COMBO x2.50', color: '#ff7a2f', t: 0.1, life: 1.6 },
  ];
  state.message = '';
  state.messageT = 0;
}

export const SHOT_NAMES = ['cover', 'title', 'service', 'results'];
