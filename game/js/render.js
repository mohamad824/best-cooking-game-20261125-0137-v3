// All screen rendering: HUD, order board, kitchen, plating strip, and the
// title / upgrade / results screens.
import { W, H, COL, WIN_SCORE, MAX_MISSES, SERVICES, UPGRADES } from './config.js';
import { INGREDIENTS, RECIPES, recipeById, ingredientById } from './recipes.js';
import { STATIONS, prepDone } from './stations.js';
import { comboOf } from './score.js';
import { timerColor, formatTime } from './timer.js';
import { drawFloor, drawRug, drawMarketBackdrop, drawLanternRow, roundRect } from './world.js';
import { drawPlate, drawIngredient, drawDish, drawChef, drawBibi, drawCat, drawSteam } from './draw.js';

export const TITLE_START = { x: 490, y: 532, w: 300, h: 58 };
export const RESULTS_AGAIN = { x: 490, y: 572, w: 300, h: 58 };
export const UPGRADE_CARDS = [
  { x: 190, y: 300, w: 270, h: 190 },
  { x: 505, y: 300, w: 270, h: 190 },
  { x: 820, y: 300, w: 270, h: 190 },
];

function text(ctx, s, x, y, font, color, align = 'center') {
  ctx.font = font;
  ctx.fillStyle = color;
  ctx.textAlign = align;
  ctx.fillText(s, x, y);
}

function panel(ctx, x, y, w, h, fill = COL.panel, edge = COL.panelEdge) {
  ctx.fillStyle = fill;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = edge;
  ctx.lineWidth = 2;
  roundRect(ctx, x, y, w, h, 10);
  ctx.stroke();
}

// ---------------------------------------------------------------- HUD
function drawHUD(ctx, state) {
  ctx.fillStyle = COL.hud;
  ctx.fillRect(0, 0, W, 82);
  ctx.fillStyle = COL.hudLine;
  ctx.fillRect(0, 80, W, 3);
  const svc = SERVICES[state.service];
  text(ctx, 'SCORE', 70, 22, 'bold 13px sans-serif', '#9aa5c4');
  text(ctx, String(state.score), 70, 58, 'bold 40px sans-serif', COL.gold);
  text(ctx, 'COMBO', 185, 22, 'bold 13px sans-serif', '#9aa5c4');
  text(ctx, `x${comboOf(state).toFixed(2)}`, 185, 52, 'bold 30px sans-serif', COL.orange);
  text(ctx, `STREAK ${state.streak}`, 185, 72, '11px sans-serif', '#9aa5c4');
  text(ctx, svc.name, 340, 34, 'bold 24px sans-serif', COL.cream);
  text(ctx, `SERVICE ${state.service + 1} / 3`, 340, 58, '13px sans-serif', '#9aa5c4');
  const tc = timerColor(state.timeLeft, svc.time);
  text(ctx, formatTime(state.timeLeft), 640, 58, 'bold 52px sans-serif', tc);
  ctx.fillStyle = 'rgba(255,255,255,0.15)';
  roundRect(ctx, 560, 66, 160, 7, 3);
  ctx.fill();
  ctx.fillStyle = tc;
  roundRect(ctx, 560, 66, 160 * Math.max(0, state.timeLeft / svc.time), 7, 3);
  ctx.fill();
  text(ctx, `WIN ${WIN_SCORE}`, 800, 26, 'bold 15px sans-serif', COL.green);
  text(ctx, `MISSES ${state.misses} / ${MAX_MISSES} = LOSE`, 800, 52, 'bold 15px sans-serif', state.misses >= 4 ? COL.red : '#ff9a8a');
  text(ctx, `SERVED ${state.served}`, 950, 26, 'bold 15px sans-serif', COL.cream);
  text(ctx, `TIPS +${state.tips}`, 950, 52, 'bold 15px sans-serif', COL.gold);
  const up = state.upgrades.length ? state.upgrades.map((u) => UPGRADES.find((x) => x.id === u).name).join(' · ') : 'NO UPGRADES YET';
  text(ctx, up, 1150, 30, 'bold 13px sans-serif', COL.gold, 'center');
  text(ctx, 'M — MUTE', 1150, 54, '12px sans-serif', '#9aa5c4');
}

// ---------------------------------------------------------------- order board
function drawOrders(ctx, state, t) {
  text(ctx, 'ORDER BOARD', 640, 100, 'bold 13px sans-serif', COL.gold);
  for (let i = 0; i < 4; i++) {
    const x = 8 + i * 318;
    const order = state.orders[i];
    if (!order) {
      panel(ctx, x, 106, 306, 62, 'rgba(35,42,68,0.45)', 'rgba(58,69,104,0.5)');
      text(ctx, '— WAITING FOR ORDERS —', x + 153, 142, '13px sans-serif', '#6b7699');
      continue;
    }
    const recipe = recipeById(order.recipeId);
    const frac = Math.max(0, order.patience / order.max);
    const urgent = frac < 0.35;
    const flash = urgent ? (Math.sin(t * 8) > 0 ? '#ff6b5e' : '#ff9a8a') : COL.panelEdge;
    panel(ctx, x, 106, 306, 62, urgent ? '#3a2230' : COL.panel, flash);
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.arc(x + 28, 137, 18, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, recipe.emoji, x + 28, 144, '18px sans-serif', '#000');
    text(ctx, recipe.name, x + 54, 132, 'bold 15px sans-serif', COL.cream, 'left');
    text(ctx, recipe.needs.join(' + '), x + 54, 152, '12px sans-serif', '#9aa5c4', 'left');
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    roundRect(ctx, x + 54, 158, 240, 6, 3);
    ctx.fill();
    ctx.fillStyle = frac > 0.5 ? COL.green : frac > 0.3 ? COL.gold : COL.red;
    roundRect(ctx, x + 54, 158, 240 * frac, 6, 3);
    ctx.fill();
  }
}

// ---------------------------------------------------------------- kitchen
function drawPantry(ctx, state) {
  const r = STATIONS.pantry;
  panel(ctx, r.x - 4, r.y - 22, r.w + 8, r.h + 26, 'rgba(22,26,46,0.85)', COL.panelEdge);
  text(ctx, 'PANTRY', r.x + r.w / 2, r.y - 6, 'bold 13px sans-serif', COL.gold);
  INGREDIENTS.forEach((ing, i) => {
    const y = r.y + 4 + i * 60;
    const sel = state.pantrySel === i;
    ctx.fillStyle = sel ? '#3a2c1e' : '#1d2338';
    roundRect(ctx, r.x + 4, y, r.w - 8, 54, 8);
    ctx.fill();
    ctx.strokeStyle = sel ? COL.orange : '#3a4568';
    ctx.lineWidth = sel ? 3 : 1.5;
    roundRect(ctx, r.x + 4, y, r.w - 8, 54, 8);
    ctx.stroke();
    drawIngredient(ctx, ing.id, r.x + 26, y + 27, 0.85);
    text(ctx, ing.name, r.x + 48, y + 22, 'bold 13px sans-serif', COL.cream, 'left');
    text(ctx, ing.verb, r.x + 48, y + 40, '11px sans-serif', '#9aa5c4', 'left');
    if (sel) text(ctx, '▶', r.x + r.w - 16, y + 32, 'bold 14px sans-serif', COL.orange);
  });
}

function drawStationBox(ctx, rect, label, active) {
  ctx.fillStyle = '#3a2c1e';
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.fill();
  ctx.strokeStyle = active ? COL.orange : '#5a4632';
  ctx.lineWidth = active ? 3 : 2;
  roundRect(ctx, rect.x, rect.y, rect.w, rect.h, 10);
  ctx.stroke();
  text(ctx, label, rect.x + rect.w / 2, rect.y + rect.h + 16, 'bold 12px sans-serif', COL.cream);
}

function drawCookSlot(ctx, rect, slot, kind, t) {
  drawStationBox(ctx, rect, kind === 'pot' ? 'POT — BOIL' : 'GRILL', !!slot.item);
  if (!slot.item) {
    ctx.strokeStyle = 'rgba(255,233,196,0.25)';
    ctx.lineWidth = 2;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(rect.x + 18 + i * 28, rect.y + 20);
      ctx.lineTo(rect.x + 18 + i * 28, rect.y + rect.h - 18);
      ctx.stroke();
    }
    return;
  }
  const done = kind === 'pot' ? slot.item.boiled : slot.item.grilled;
  if (kind === 'pot') {
    ctx.fillStyle = '#1d3a5c';
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2 + 4, 38, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#7cc7ff';
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2, 30, 12, 0, 0, Math.PI * 2);
    ctx.fill();
  } else {
    ctx.fillStyle = '#2b2b33';
    ctx.beginPath();
    ctx.ellipse(rect.x + rect.w / 2, rect.y + rect.h / 2 + 4, 38, 20, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#ff8a4c';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(rect.x + 16, rect.y + rect.h / 2 + 12);
    ctx.lineTo(rect.x + rect.w - 16, rect.y + rect.h / 2 + 12);
    ctx.stroke();
  }
  drawIngredient(ctx, slot.item.id, rect.x + rect.w / 2, rect.y + rect.h / 2 - 4, 0.9, slot.item.chopped, done);
  if (done) {
    ctx.fillStyle = 'rgba(16,19,31,0.85)';
    roundRect(ctx, rect.x + rect.w / 2 - 34, rect.y + 6, 68, 18, 9);
    ctx.fill();
    text(ctx, 'READY ✓', rect.x + rect.w / 2, rect.y + 19, 'bold 11px sans-serif', COL.green);
    drawSteam(ctx, rect.x + rect.w / 2, rect.y + 6, t, 2);
  } else {
    const frac = slot.progress / (kind === 'pot' ? 3 : 3.5);
    ctx.fillStyle = 'rgba(0,0,0,0.5)';
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 12, rect.w - 24, 6, 3);
    ctx.fill();
    ctx.fillStyle = COL.orange;
    roundRect(ctx, rect.x + 12, rect.y + rect.h - 12, (rect.w - 24) * Math.min(1, frac), 6, 3);
    ctx.fill();
  }
}

function drawChopBoard(ctx, rect, slot, isBibi, t) {
  drawStationBox(ctx, rect, 'CHOP [E]', !!slot.item);
  ctx.fillStyle = '#a8763e';
  roundRect(ctx, rect.x + 10, rect.y + 12, rect.w - 20, rect.h - 24, 6);
  ctx.fill();
  ctx.strokeStyle = 'rgba(90,50,20,0.5)';
  ctx.beginPath();
  ctx.moveTo(rect.x + 14, rect.y + rect.h / 2);
  ctx.lineTo(rect.x + rect.w - 14, rect.y + rect.h / 2);
  ctx.stroke();
  if (slot.item) {
    drawIngredient(ctx, slot.item.id, rect.x + rect.w / 2, rect.y + rect.h / 2, 0.95, slot.item.chopped, false);
    if (slot.item.chopped) {
      ctx.fillStyle = 'rgba(16,19,31,0.85)';
      roundRect(ctx, rect.x + rect.w / 2 - 34, rect.y + 6, 68, 18, 9);
      ctx.fill();
      text(ctx, 'READY ✓', rect.x + rect.w / 2, rect.y + 19, 'bold 11px sans-serif', COL.green);
    } else {
      const frac = slot.progress / (isBibi ? 1.6 : 1.4);
      ctx.fillStyle = 'rgba(0,0,0,0.5)';
      roundRect(ctx, rect.x + 12, rect.y + rect.h - 12, rect.w - 24, 6, 3);
      ctx.fill();
      ctx.fillStyle = COL.green;
      roundRect(ctx, rect.x + 12, rect.y + rect.h - 12, (rect.w - 24) * Math.min(1, frac), 6, 3);
      ctx.fill();
    }
  }
}

function drawServeWindow(ctx, state, t) {
  const r = STATIONS.serve;
  ctx.fillStyle = '#2a1c10';
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.fill();
  ctx.strokeStyle = COL.orange;
  ctx.lineWidth = 3;
  roundRect(ctx, r.x, r.y, r.w, r.h, 12);
  ctx.stroke();
  // Cloche dome.
  ctx.fillStyle = '#ffc53d';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 70, 42, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#1d3a5c';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 70, 42, Math.PI, 0);
  ctx.fill();
  ctx.fillStyle = '#ffc53d';
  ctx.beginPath();
  ctx.arc(r.x + r.w / 2, r.y + 70, 8, 0, Math.PI * 2);
  ctx.fill();
  const carrying = state.chef.carry?.kind === 'dish';
  if (carrying) {
    const pulse = 1 + Math.sin(t * 5) * 0.08;
    ctx.save();
    ctx.translate(r.x + r.w / 2, r.y + 70);
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = COL.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(0, 0, 52, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    text(ctx, 'READY — PRESS E!', r.x + r.w / 2, r.y + 154, 'bold 14px sans-serif', COL.green);
  }
  text(ctx, 'SERVE WINDOW', r.x + r.w / 2, r.y + 132, 'bold 14px sans-serif', COL.gold);
  if (!carrying) {
    text(ctx, 'Bring a finished', r.x + r.w / 2, r.y + 152, '12px sans-serif', COL.cream);
    text(ctx, 'plate here — E', r.x + r.w / 2, r.y + 168, '12px sans-serif', COL.cream);
  }
}

function drawRouteArrows(ctx, t) {
  ctx.fillStyle = 'rgba(255,197,61,0.55)';
  const pulse = Math.sin(t * 3) * 2;
  const arrows = [
    { x: 132, y: 300, a: 0 },
    { x: 410, y: 320, a: 0 },
    { x: 830, y: 320, a: 0 },
    { x: 1060, y: 420, a: Math.PI / 2 },
    { x: 640, y: 565, a: Math.PI / 2 },
  ];
  for (const ar of arrows) {
    ctx.save();
    ctx.translate(ar.x + pulse, ar.y);
    ctx.rotate(ar.a);
    ctx.beginPath();
    ctx.moveTo(0, -10); ctx.lineTo(16, 0); ctx.lineTo(0, 10); ctx.lineTo(0, 4); ctx.lineTo(-14, 4); ctx.lineTo(-14, -4); ctx.lineTo(0, -4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
}

// V3 FIX (b): the plating strip is busy — stacked plates, garnish bowls,
// steam, a second dish mid-assembly, utensils, sauce bottles, chopped piles.
function drawPlatingStrip(ctx, state, t) {
  const r = STATIONS.plating;
  ctx.fillStyle = '#1d2338';
  roundRect(ctx, r.x - 8, r.y - 6, r.w + 16, r.h + 12, 12);
  ctx.fill();
  ctx.strokeStyle = '#3a4568';
  ctx.lineWidth = 2;
  roundRect(ctx, r.x - 8, r.y - 6, r.w + 16, r.h + 12, 12);
  ctx.stroke();
  text(ctx, 'PLATING COUNTER', r.x + r.w / 2, r.y + 12, 'bold 13px sans-serif', COL.gold);
  // Stacked plates, left.
  for (let i = 0; i < 3; i++) drawPlate(ctx, r.x + 52, r.y + 62 - i * 7, 24);
  text(ctx, 'PLATES', r.x + 52, r.y + 84, 'bold 11px sans-serif', '#9aa5c4');
  // Garnish bowls.
  const garnish = [
    { c: '#3f7d3a', label: 'HERBS' },
    { c: '#c94f3d', label: 'CHILI' },
    { c: '#e8b25e', label: 'LEMON' },
  ];
  garnish.forEach((g, i) => {
    const gx = r.x + 150 + i * 62;
    ctx.fillStyle = '#2e6da8';
    ctx.beginPath();
    ctx.ellipse(gx, r.y + 58, 24, 12, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = g.c;
    ctx.beginPath();
    ctx.ellipse(gx, r.y + 54, 18, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    text(ctx, g.label, gx, r.y + 84, 'bold 10px sans-serif', '#9aa5c4');
  });
  // The assembly plate, centre — shows the dish being built.
  const cx = r.x + 380;
  const cy = r.y + 56;
  if (state.plateDish) {
    const pulse = 1 + Math.sin(t * 5) * 0.06;
    ctx.save();
    ctx.translate(cx, cy);
    ctx.scale(pulse, pulse);
    ctx.strokeStyle = COL.gold;
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.ellipse(0, 0, 44, 22, 0, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
    drawDish(ctx, state.plateDish, cx, cy - 8, 1);
    drawSteam(ctx, cx, cy - 24, t, 3);
    text(ctx, `${recipeById(state.plateDish).name} — READY ✓`, cx, r.y + 84, 'bold 13px sans-serif', COL.green);
  } else if (state.plate.length) {
    drawPlate(ctx, cx, cy, 30);
    state.plate.forEach((id, i) => {
      drawIngredient(ctx, id, cx - 18 + i * 18, cy - 6, 0.75, true, true);
    });
    drawSteam(ctx, cx, cy - 24, t, 2);
    text(ctx, 'ADDING…', cx, r.y + 84, 'bold 13px sans-serif', COL.gold);
  } else {
    drawPlate(ctx, cx, cy, 30);
    text(ctx, 'Press E to build a dish', cx, r.y + 84, '11px sans-serif', '#9aa5c4');
  }
  // Second dish mid-assembly, right of centre.
  const dx = r.x + 520;
  drawPlate(ctx, dx, r.y + 56, 26);
  drawIngredient(ctx, 'noodle', dx - 8, r.y + 50, 0.8, false, true);
  drawIngredient(ctx, 'mushroom', dx + 10, r.y + 50, 0.7, true, false);
  drawSteam(ctx, dx, r.y + 30, t, 2);
  text(ctx, 'NOODLE BOWL — 2/3', dx, r.y + 84, 'bold 11px sans-serif', COL.gold);
  // Utensils: ladle, knife, tongs.
  const ux = r.x + 600;
  ctx.strokeStyle = '#c9c9d6';
  ctx.lineWidth = 3;
  ctx.beginPath(); ctx.moveTo(ux, r.y + 34); ctx.lineTo(ux, r.y + 62); ctx.stroke();
  ctx.fillStyle = '#c9c9d6';
  ctx.beginPath(); ctx.ellipse(ux, r.y + 68, 8, 6, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8e8f0';
  ctx.beginPath(); ctx.moveTo(ux + 24, r.y + 30); ctx.lineTo(ux + 34, r.y + 66); ctx.lineTo(ux + 28, r.y + 66); ctx.lineTo(ux + 18, r.y + 30); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#8a5a2a';
  ctx.fillRect(ux + 20, r.y + 66, 12, 10);
  text(ctx, 'TOOLS', ux + 26, r.y + 84, 'bold 10px sans-serif', '#9aa5c4');
  // Sauce bottles.
  ['#c94f3d', '#3f7d3a', '#e8b25e'].forEach((c, i) => {
    const bx = r.x + 660 + i * 22;
    ctx.fillStyle = c;
    roundRect(ctx, bx, r.y + 40, 14, 30, 4);
    ctx.fill();
    ctx.fillStyle = '#2b2b33';
    ctx.fillRect(bx + 4, r.y + 32, 6, 9);
  });
  // Chopped pepper pile.
  drawIngredient(ctx, 'pepper', r.x + 740 - 30, r.y + 60, 0.7, true, false);
  drawIngredient(ctx, 'pepper', r.x + 740 - 12, r.y + 64, 0.7, true, false);
  text(ctx, 'GARNISH', r.x + 700, r.y + 84, 'bold 10px sans-serif', '#9aa5c4');
  // Carrying hint.
  if (state.chef.carry?.kind === 'dish') {
    text(ctx, 'CARRYING A PLATE → SERVE', r.x + r.w - 8, r.y + 14, 'bold 12px sans-serif', COL.gold, 'right');
  }
}

function drawKitchen(ctx, state, t) {
  drawFloor(ctx);
  drawLanternRow(ctx, t);
  drawRug(ctx, 430, 380, 280, 110, 'MISO the cat');
  drawCat(ctx, 560, 432, t);
  // Woven mats under the hearth + baskets bottom-left.
  ctx.fillStyle = '#8a5a2a';
  ctx.fillRect(150, 470, 46, 46);
  ctx.strokeStyle = '#5a3a1a';
  ctx.lineWidth = 2;
  ctx.beginPath(); ctx.moveTo(150, 470); ctx.lineTo(196, 516); ctx.moveTo(196, 470); ctx.lineTo(150, 516); ctx.stroke();
  ctx.fillStyle = '#a8763e';
  ctx.beginPath(); ctx.arc(220, 520, 26, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(260, 528, 22, 0, Math.PI * 2); ctx.fill();
  // Plant by the serve window.
  ctx.fillStyle = '#8a5a2a';
  ctx.fillRect(1050, 480, 26, 22);
  ctx.fillStyle = '#3f7d3a';
  ctx.beginPath(); ctx.arc(1063, 468, 14, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(1052, 476, 10, 0, Math.PI * 2); ctx.fill();
  drawRouteArrows(ctx, t);
  drawPantry(ctx, state);
  // Hearth label + stations.
  text(ctx, '🔥 EMBER HEARTH', 620, 186, 'bold 14px sans-serif', COL.orange);
  drawChopBoard(ctx, STATIONS.chop1, state.stations.chop1, false, t);
  drawChopBoard(ctx, STATIONS.chop2, state.stations.chop2, true, t);
  drawCookSlot(ctx, STATIONS.grill1, state.stations.grill1, 'grill', t);
  drawCookSlot(ctx, STATIONS.grill2, state.stations.grill2, 'grill', t);
  drawCookSlot(ctx, STATIONS.pot, state.stations.pot, 'pot', t);
  drawServeWindow(ctx, state, t);
  drawBibi(ctx, state.bibi.x, state.bibi.y, state.bibi.busy, t);
  drawChef(ctx, state.chef.x, state.chef.y, state.chef.dir, state.chef.moving, t, state.chef.carry);
  // Rush banner during Dinner Rush.
  if (state.service === 2) {
    ctx.fillStyle = 'rgba(20,12,8,0.92)';
    ctx.fillRect(0, 556, W, 40);
    ctx.fillStyle = COL.orange;
    ctx.fillRect(0, 556, W, 2);
    ctx.fillRect(0, 594, W, 2);
    text(ctx, '🔥  DINNER RUSH — ORDERS COME FAST!  🔥', 640, 583, 'bold 22px sans-serif', COL.gold);
  }
  drawPlatingStrip(ctx, state, t);
  // Footer controls.
  ctx.fillStyle = '#10131f';
  ctx.fillRect(0, 694, W, 26);
  text(ctx, 'WASD / Arrows — move  ·  E / Space — use station (hold E to chop)  ·  Click — walk to a station & use it  ·  1–6 — pick pantry item  ·  M — mute', 640, 711, '12px sans-serif', '#9aa5c4');
  // Message line.
  if (state.messageT > 0) {
    ctx.fillStyle = 'rgba(16,19,31,0.85)';
    const w = ctx.measureText(state.message).width + 30;
    roundRect(ctx, 640 - w / 2, 168, w, 26, 8);
    ctx.fill();
    text(ctx, state.message, 640, 186, 'bold 14px sans-serif', COL.cream);
  }
  // Popups + particles.
  for (const p of state.popups) {
    const a = 1 - p.t / p.life;
    ctx.globalAlpha = Math.max(0, a);
    text(ctx, p.text, p.x, p.y - p.t * 40, 'bold 26px sans-serif', p.color);
    ctx.globalAlpha = 1;
  }
  for (const pt of state.particles) {
    ctx.globalAlpha = Math.max(0, 1 - pt.t / pt.life);
    ctx.fillStyle = pt.color;
    ctx.beginPath();
    ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 1;
  }
}

// ---------------------------------------------------------------- screens
function drawTitle(ctx, state, t) {
  drawMarketBackdrop(ctx, t);
  ctx.fillStyle = 'rgba(10,8,16,0.55)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, 'EMBER HEARTH', 640, 150, 'bold 84px sans-serif', COL.gold);
  text(ctx, 'A NIGHT-MARKET KITCHEN · COOK FAST, SERVE HOT', 640, 190, 'bold 20px sans-serif', COL.orange);
  text(ctx, 'GOAL — score 1000+ across 3 services to WIN the shift.', 640, 232, 'bold 19px sans-serif', COL.cream);
  text(ctx, 'LOSE — 6 orders walk out, or finish below 1000.', 640, 258, 'bold 19px sans-serif', '#ff9a8a');
  RECIPES.forEach((r, i) => {
    const x = 150 + i * 250;
    panel(ctx, x, 290, 230, 120, COL.panel, COL.orange);
    ctx.fillStyle = '#fff8e8';
    ctx.beginPath();
    ctx.arc(x + 115, 330, 24, 0, Math.PI * 2);
    ctx.fill();
    drawDish(ctx, r.id, x + 115, 326, 0.85);
    text(ctx, r.name, x + 115, 372, 'bold 14px sans-serif', COL.gold);
    text(ctx, r.needs.join(' + '), x + 115, 394, '13px sans-serif', COL.cream);
  });
  text(ctx, 'HOW TO PLAY — Grab food at the PANTRY · Chop it (hold E) · Grill or boil it at the HEARTH', 640, 448, 'bold 17px sans-serif', COL.cream);
  text(ctx, 'Plate it at the PLATING COUNTER · Serve it at the SERVE WINDOW before patience runs out', 640, 474, 'bold 17px sans-serif', COL.cream);
  text(ctx, 'CONTROLS — WASD / Arrows move · E / Space use a station · Click buttons & stations · M mute', 640, 502, '14px sans-serif', '#9aa5c4');
  const b = TITLE_START;
  const pulse = 1 + Math.sin(t * 3) * 0.03;
  ctx.save();
  ctx.translate(b.x + b.w / 2, b.y + b.h / 2);
  ctx.scale(pulse, pulse);
  ctx.fillStyle = COL.orange;
  roundRect(ctx, -b.w / 2, -b.h / 2, b.w, b.h, 12);
  ctx.fill();
  text(ctx, '▶  START THE SHIFT', 0, 9, 'bold 26px sans-serif', '#1d1206');
  ctx.restore();
  text(ctx, '3 services · final DINNER RUSH · pick an upgrade between services', 640, 622, '14px sans-serif', '#9aa5c4');
}

function drawUpgrade(ctx, state, t) {
  drawKitchen(ctx, state, t);
  ctx.fillStyle = 'rgba(10,8,16,0.78)';
  ctx.fillRect(0, 0, W, H);
  text(ctx, `SERVICE ${state.service} COMPLETE — PICK AN UPGRADE`, 640, 150, 'bold 34px sans-serif', COL.gold);
  text(ctx, `Score ${state.score} · Served ${state.served} · Next: ${SERVICES[state.service + 1]?.name ?? ''}`, 640, 188, 'bold 18px sans-serif', COL.cream);
  UPGRADES.forEach((u, i) => {
    const c = UPGRADE_CARDS[i];
    const taken = state.upgrades.includes(u.id);
    panel(ctx, c.x, c.y, c.w, c.h, taken ? '#2e3a2a' : COL.panel, COL.orange);
    text(ctx, u.icon, c.x + c.w / 2, c.y + 62, '40px sans-serif', COL.gold);
    text(ctx, u.name, c.x + c.w / 2, c.y + 100, 'bold 19px sans-serif', COL.gold);
    text(ctx, u.desc, c.x + c.w / 2, c.y + 132, '14px sans-serif', COL.cream);
    text(ctx, taken ? 'TAKEN' : `PRESS ${i + 1} OR CLICK`, c.x + c.w / 2, c.y + 166, 'bold 13px sans-serif', taken ? COL.green : '#9aa5c4');
  });
}

function drawResults(ctx, state, t) {
  drawMarketBackdrop(ctx, t);
  ctx.fillStyle = 'rgba(10,8,16,0.6)';
  ctx.fillRect(0, 0, W, H);
  const won = state.won;
  text(ctx, won ? 'SHIFT COMPLETE — YOU WIN!' : 'SHIFT OVER — YOU LOSE', 640, 130, 'bold 44px sans-serif', won ? COL.green : COL.red);
  text(ctx, `GRADE ${state.grade}`, 640, 205, 'bold 64px sans-serif', COL.gold);
  const rows = [
    ['FINAL SCORE', `${state.score}  (WIN ${WIN_SCORE})`],
    ['DISHES SERVED', String(state.served)],
    ['TIPS EARNED', `+${state.tips}`],
    ['BEST COMBO', `x${state.bestCombo.toFixed(2)}`],
    ['ORDERS MISSED', `${state.misses} / ${MAX_MISSES}`],
  ];
  rows.forEach((row, i) => {
    const y = 258 + i * 46;
    ctx.fillStyle = i % 2 ? '#232a44' : '#2b3352';
    ctx.fillRect(390, y, 500, 40);
    text(ctx, row[0], 410, y + 26, 'bold 16px sans-serif', '#9aa5c4', 'left');
    text(ctx, row[1], 870, y + 26, 'bold 16px sans-serif', COL.cream, 'right');
  });
  text(ctx, won ? 'The night market eats well tonight. The hearth stays lit.' : 'The orders walked out. Light the hearth and try again.', 640, 528, 'bold 18px sans-serif', COL.cream);
  const b = RESULTS_AGAIN;
  ctx.fillStyle = COL.orange;
  roundRect(ctx, b.x, b.y, b.w, b.h, 12);
  ctx.fill();
  text(ctx, '↻  COOK AGAIN', b.x + b.w / 2, b.y + 37, 'bold 26px sans-serif', '#1d1206');
  text(ctx, 'WASD / Arrows — move  ·  E / Space — use station  ·  M — mute', 640, 700, '12px sans-serif', '#9aa5c4');
}

export function render(ctx, state, t) {
  ctx.clearRect(0, 0, W, H);
  ctx.fillStyle = '#14101c';
  ctx.fillRect(0, 0, W, H);
  if (state.screen === 'title') {
    drawTitle(ctx, state, t);
    return;
  }
  if (state.screen === 'upgrade') {
    drawUpgrade(ctx, state, t);
    return;
  }
  if (state.screen === 'results') {
    drawResults(ctx, state, t);
    return;
  }
  drawHUD(ctx, state);
  drawOrders(ctx, state, t);
  drawKitchen(ctx, state, t);
}
