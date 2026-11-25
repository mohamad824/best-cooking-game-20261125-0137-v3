// Stations and the route between them: pantry -> chop -> hearth -> plate -> serve.
// Each station is a rectangle the chef stands next to; E uses it.
import { INGREDIENTS, matchRecipe, isRecipePrefix } from './recipes.js';
import { findOrderFor } from './orders.js';
import { applyServe, hasWon } from './score.js';

export const STATIONS = {
  pantry: { x: 8, y: 178, w: 116, h: 368, label: 'PANTRY' },
  chop1: { x: 150, y: 190, w: 118, h: 88, label: 'CHOP [E]' },
  chop2: { x: 282, y: 190, w: 118, h: 88, label: 'CHOP [E]' },
  grill1: { x: 440, y: 192, w: 108, h: 86, label: 'GRILL' },
  grill2: { x: 560, y: 192, w: 108, h: 86, label: 'GRILL' },
  pot: { x: 682, y: 192, w: 112, h: 86, label: 'POT — BOIL' },
  plating: { x: 150, y: 600, w: 850, h: 88, label: 'PLATING COUNTER' },
  serve: { x: 1090, y: 190, w: 182, h: 170, label: 'SERVE WINDOW' },
};

function distToRect(x, y, r) {
  const dx = Math.max(r.x - x, 0, x - (r.x + r.w));
  const dy = Math.max(r.y - y, 0, y - (r.y + r.h));
  return Math.hypot(dx, dy);
}

export function nearestStation(chef) {
  let best = null;
  let bestD = 110;
  for (const [id, rect] of Object.entries(STATIONS)) {
    const d = distToRect(chef.x, chef.y, rect);
    if (d < bestD) { bestD = d; best = id; }
  }
  return best;
}

export function prepDone(item) {
  const ing = INGREDIENTS.find((i) => i.id === item.id);
  if (!ing) return false;
  if (ing.prep.includes('chop') && !item.chopped) return false;
  if (ing.prep.includes('grill') && !item.grilled) return false;
  if (ing.prep.includes('boil') && !item.boiled) return false;
  return true;
}

function say(state, text) {
  state.message = text;
  state.messageT = 2.2;
}

function spark(state, x, y, color, n = 10) {
  for (let i = 0; i < n; i++) {
    state.particles.push({
      x, y, vx: (Math.random() - 0.5) * 140, vy: -40 - Math.random() * 90,
      t: 0, life: 0.6 + Math.random() * 0.4, color, size: 2 + Math.random() * 3,
    });
  }
}

// One E press at the station the chef is nearest to.
export function interact(state, audio) {
  const chef = state.chef;
  const near = nearestStation(chef);
  if (!near) { say(state, 'Walk to a station first!'); return; }
  const st = state.stations;

  if (near === 'pantry') {
    if (chef.carry) { say(state, 'Hands full — finish this item first!'); return; }
    const ing = INGREDIENTS[state.pantrySel];
    chef.carry = { kind: 'item', id: ing.id, chopped: false, grilled: false, boiled: false };
    audio?.blip(520, 0.06);
    return;
  }
  if (near === 'chop1' || near === 'chop2') {
    const board = st[near];
    if (board.item && board.item.chopped) {
      if (chef.carry) { say(state, 'Hands full!'); return; }
      chef.carry = board.item; board.item = null; board.progress = 0;
      audio?.blip(660, 0.06);
      return;
    }
    if (!board.item && chef.carry?.kind === 'item' && !chef.carry.chopped) {
      const ing = INGREDIENTS.find((i) => i.id === chef.carry.id);
      if (!ing.prep.includes('chop')) { say(state, `${ing.name} needs no chopping!`); return; }
      board.item = chef.carry; chef.carry = null; board.progress = 0;
      audio?.blip(440, 0.06);
      return;
    }
    if (board.item && !board.item.chopped) say(state, 'Hold E to chop!');
    return;
  }
  if (near === 'grill1' || near === 'grill2' || near === 'pot') {
    const slot = st[near];
    const want = near === 'pot' ? 'boil' : 'grill';
    if (slot.item && (slot.item.grilled || slot.item.boiled)) {
      if (chef.carry) { say(state, 'Hands full!'); return; }
      chef.carry = slot.item; slot.item = null; slot.progress = 0;
      audio?.blip(660, 0.06);
      return;
    }
    if (!slot.item && chef.carry?.kind === 'item') {
      const ing = INGREDIENTS.find((i) => i.id === chef.carry.id);
      if (!ing.prep.includes(want)) { say(state, `${ing.name} does not go ${want === 'boil' ? 'in the pot' : 'on the grill'}!`); return; }
      if (want === 'grill' && ing.prep.includes('chop') && !chef.carry.chopped) { say(state, 'Chop it first!'); return; }
      if (want === 'boil' && ing.prep.includes('chop') && !chef.carry.chopped) { say(state, 'Chop it first!'); return; }
      slot.item = chef.carry; chef.carry = null; slot.progress = 0;
      audio?.sizzle();
      return;
    }
    if (slot.item) say(state, 'Still cooking…');
    return;
  }
  if (near === 'plating') {
    if (chef.carry?.kind === 'dish') { say(state, 'That plate is ready — take it to the SERVE window!'); return; }
    if (chef.carry?.kind === 'item') {
      if (!prepDone(chef.carry)) { say(state, 'Not ready yet — finish cooking it first!'); return; }
      state.plate.push(chef.carry.id);
      spark(state, 640, 640, '#ffc53d', 8);
      chef.carry = null;
      audio?.blip(760, 0.07);
      const dish = matchRecipe(state.plate);
      if (dish) {
        state.plateDish = dish.id;
        say(state, `${dish.name} — READY! Pick it up and serve!`);
        audio?.chime();
      } else if (!isRecipePrefix(state.plate)) {
        say(state, 'That mix matches no recipe — press Q to scrap the plate.');
      }
      return;
    }
    if (state.plateDish) {
      chef.carry = { kind: 'dish', recipeId: state.plateDish };
      state.plate = [];
      state.plateDish = null;
      audio?.blip(880, 0.07);
      return;
    }
    say(state, 'Bring a prepared item here to build a dish.');
    return;
  }
  if (near === 'serve') {
    if (chef.carry?.kind !== 'dish') { say(state, 'Bring a finished plate here!'); return; }
    const order = findOrderFor(state, chef.carry.recipeId);
    if (!order) { say(state, 'No order for this dish right now!'); return; }
    const res = applyServe(state, order);
    state.orders.splice(state.orders.indexOf(order), 1);
    chef.carry = null;
    state.popups.push({ x: 1180, y: 300, text: `+${res.points}`, color: '#ffc53d', t: 0, life: 1.4 });
    state.popups.push({ x: 640, y: 330, text: `+${res.points}  SERVED!`, color: '#7be495', t: 0, life: 1.4 });
    spark(state, 1180, 280, '#ffc53d', 16);
    audio?.serve();
    if (hasWon(state)) state.pendingWin = true;
    return;
  }
}

// Per-frame cooking / chopping progress. Bibi auto-chops board 2.
export function tickStations(state, dt, keys) {
  const st = state.stations;
  const chopSpeed = state.upgrades.includes('chop') ? 2 : 1;
  const near = nearestStation(state.chef);
  // Chef chops board 1 while holding E next to it.
  if (keys.e && near === 'chop1' && st.chop1.item && !st.chop1.item.chopped) {
    st.chop1.progress += dt * chopSpeed;
    state.chef.chopT += dt;
    if (st.chop1.progress >= 1.4) {
      st.chop1.item.chopped = true;
      st.chop1.progress = 0;
      spark(state, 209, 220, '#fff3d6', 8);
    }
  }
  // Bibi auto-chops board 2.
  if (st.chop2.item && !st.chop2.item.chopped) {
    st.chop2.progress += dt * 0.9;
    state.bibi.busy = 1;
    if (Math.random() < dt * 6) {
      state.particles.push({ x: 340 + Math.random() * 40, y: 210, vx: (Math.random() - 0.5) * 60, vy: -30, t: 0, life: 0.4, color: '#fff3d6', size: 2 });
    }
    if (st.chop2.progress >= 1.6) {
      st.chop2.item.chopped = true;
      st.chop2.progress = 0;
      state.bibi.busy = 0;
    }
  } else {
    state.bibi.busy = 0;
  }
  for (const key of ['grill1', 'grill2', 'pot']) {
    const slot = st[key];
    if (!slot.item) continue;
    const done = key === 'pot' ? slot.item.boiled : slot.item.grilled;
    if (done) continue;
    slot.progress += dt;
    if (Math.random() < dt * 8) {
      state.particles.push({ x: 470 + (key === 'grill2' ? 120 : key === 'pot' ? 250 : 0) + Math.random() * 40, y: 210, vx: (Math.random() - 0.5) * 30, vy: -50 - Math.random() * 40, t: 0, life: 0.7, color: key === 'pot' ? '#cfe8ff' : '#ffb066', size: 2 + Math.random() * 2 });
    }
    const need = key === 'pot' ? 3 : 3.5;
    if (slot.progress >= need) {
      if (key === 'pot') slot.item.boiled = true;
      else slot.item.grilled = true;
      slot.progress = 0;
      spark(state, 500, 220, '#ffc53d', 6);
    }
  }
}
