// Canvas-drawn food, characters and props. Everything is original art
// drawn by this code — no images, no network.
import { INGREDIENTS, RECIPES, ingredientById, recipeById } from './recipes.js';

export function drawPlate(ctx, x, y, r = 26) {
  ctx.fillStyle = '#f4ead6';
  ctx.beginPath();
  ctx.ellipse(x, y, r, r * 0.42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff8e8';
  ctx.beginPath();
  ctx.ellipse(x, y - 2, r * 0.72, r * 0.3, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#d8c49a';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.72, r * 0.3, 0, 0, Math.PI * 2);
  ctx.stroke();
}

export function drawIngredient(ctx, id, x, y, s = 1, chopped = false, cooked = false) {
  const ing = ingredientById(id);
  if (!ing) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(s, s);
  if (id === 'meat') {
    ctx.fillStyle = cooked ? '#8a3a28' : '#e2574c';
    ctx.beginPath();
    ctx.ellipse(0, 0, 16, 11, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f2b8a0';
    ctx.beginPath();
    ctx.ellipse(-3, -2, 7, 4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    if (chopped) { ctx.strokeStyle = '#7c2f22'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-6, -6); ctx.lineTo(6, 6); ctx.moveTo(6, -6); ctx.lineTo(-6, 6); ctx.stroke(); }
  } else if (id === 'pepper') {
    ctx.fillStyle = cooked ? '#c93a22' : '#ff5a3c';
    ctx.beginPath();
    ctx.moveTo(-12, 2);
    ctx.quadraticCurveTo(-14, -10, -2, -8);
    ctx.quadraticCurveTo(10, -6, 12, 2);
    ctx.quadraticCurveTo(4, 10, -6, 8);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = '#3f7d3a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(10, -6);
    ctx.quadraticCurveTo(16, -12, 14, -16);
    ctx.stroke();
    if (chopped) {
      ctx.fillStyle = '#ff8a6a';
      for (let i = 0; i < 3; i++) { ctx.beginPath(); ctx.arc(-8 + i * 8, 2, 3, 0, Math.PI * 2); ctx.fill(); }
    }
  } else if (id === 'mushroom') {
    ctx.fillStyle = '#e8dcc8';
    ctx.beginPath();
    ctx.ellipse(0, -4, 14, 9, 0, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#c94f3d';
    ctx.beginPath();
    ctx.arc(0, -4, 14, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath(); ctx.arc(-6, -9, 3, 0, Math.PI * 2); ctx.arc(5, -11, 2.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#f4ead6';
    ctx.fillRect(-4, -4, 8, 12);
    if (cooked) { ctx.fillStyle = 'rgba(120,60,20,0.35)'; ctx.beginPath(); ctx.arc(0, -4, 14, Math.PI, 0); ctx.fill(); }
  } else if (id === 'fish') {
    ctx.fillStyle = cooked ? '#d89a4a' : '#7cc7ff';
    ctx.beginPath();
    ctx.ellipse(0, 0, 17, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(15, 0); ctx.lineTo(24, -7); ctx.lineTo(24, 7); ctx.closePath();
    ctx.fill();
    ctx.fillStyle = '#12324a';
    ctx.beginPath(); ctx.arc(-10, -2, 2, 0, Math.PI * 2); ctx.fill();
    ctx.strokeStyle = 'rgba(18,50,74,0.6)';
    ctx.lineWidth = 1.5;
    ctx.beginPath(); ctx.moveTo(-2, -6); ctx.lineTo(-2, 6); ctx.moveTo(4, -6); ctx.lineTo(4, 6); ctx.stroke();
    if (cooked) { ctx.strokeStyle = '#5a2c10'; ctx.lineWidth = 2; ctx.beginPath(); ctx.moveTo(-8, -4); ctx.lineTo(8, 4); ctx.stroke(); }
  } else if (id === 'rice') {
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath();
    ctx.ellipse(0, 0, 14, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e8dcc0';
    for (let i = 0; i < 5; i++) { ctx.beginPath(); ctx.arc(-8 + i * 4, -2 + (i % 2) * 4, 2.5, 0, Math.PI * 2); ctx.fill(); }
  } else if (id === 'noodle') {
    ctx.strokeStyle = '#ffd76a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.moveTo(-13, -4 + i * 5);
      ctx.bezierCurveTo(-5, -8 + i * 5, 5, 2 + i * 4, 13, -3 + i * 5);
      ctx.stroke();
    }
  }
  ctx.restore();
}

export function drawDish(ctx, recipeId, x, y, s = 1) {
  const r = recipeById(recipeId);
  if (!r) return;
  drawPlate(ctx, x, y + 6, 30 * s);
  if (recipeId === 'skewer') {
    ctx.strokeStyle = '#c9a86a';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(x - 22 * s, y - 2); ctx.lineTo(x + 22 * s, y - 2); ctx.stroke();
    drawIngredient(ctx, 'meat', x - 8 * s, y - 4, s * 0.9, true, true);
    drawIngredient(ctx, 'pepper', x + 10 * s, y - 4, s * 0.9, true, false);
  } else if (recipeId === 'ricebowl') {
    ctx.fillStyle = '#c96a1e';
    ctx.beginPath(); ctx.ellipse(x, y - 2, 22 * s, 10 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#fff3d6';
    ctx.beginPath(); ctx.ellipse(x, y - 6, 18 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    drawIngredient(ctx, 'mushroom', x + 2, y - 8, s * 0.85, true, false);
    drawIngredient(ctx, 'mushroom', x - 10, y - 6, s * 0.6, true, false);
  } else if (recipeId === 'fishplate') {
    drawIngredient(ctx, 'fish', x - 2, y - 4, s * 1.05, false, true);
    drawIngredient(ctx, 'pepper', x + 12, y - 8, s * 0.7, true, false);
  } else if (recipeId === 'noodle') {
    ctx.fillStyle = '#2e6da8';
    ctx.beginPath(); ctx.ellipse(x, y - 2, 24 * s, 11 * s, 0, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#ffd76a';
    ctx.beginPath(); ctx.ellipse(x, y - 5, 19 * s, 8 * s, 0, 0, Math.PI * 2); ctx.fill();
    drawIngredient(ctx, 'mushroom', x + 8, y - 8, s * 0.7, true, false);
    drawIngredient(ctx, 'pepper', x - 10, y - 8, s * 0.6, true, false);
  }
}

export function drawChef(ctx, x, y, dir, moving, t, carry) {
  const bob = moving ? Math.sin(t * 12) * 3 : Math.sin(t * 2) * 1;
  ctx.save();
  ctx.translate(x, y + bob * 0.3);
  // shadow
  ctx.fillStyle = 'rgba(0,0,0,0.35)';
  ctx.beginPath(); ctx.ellipse(0, 26, 24, 7, 0, 0, Math.PI * 2); ctx.fill();
  // legs
  ctx.fillStyle = '#2e3a5c';
  ctx.fillRect(-12, 10, 9, 16);
  ctx.fillRect(3, 10, 9, 16);
  // body + apron
  ctx.fillStyle = '#f4ead6';
  ctx.beginPath(); ctx.ellipse(0, 0, 17, 18, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#ff7a2f';
  ctx.beginPath();
  ctx.moveTo(-11, -6); ctx.lineTo(11, -6); ctx.lineTo(9, 14); ctx.lineTo(-9, 14); ctx.closePath();
  ctx.fill();
  // arms
  ctx.fillStyle = '#f4ead6';
  ctx.beginPath(); ctx.ellipse(-19 * dir, 2, 6, 9, 0.3 * dir, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.ellipse(19 * dir, 2, 6, 9, -0.3 * dir, 0, Math.PI * 2); ctx.fill();
  // head + hat
  ctx.fillStyle = '#f2c79a';
  ctx.beginPath(); ctx.arc(0, -26, 13, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#fff8e8';
  ctx.beginPath(); ctx.ellipse(0, -34, 15, 9, 0, Math.PI, 0); ctx.fill();
  ctx.fillRect(-15, -38, 30, 7);
  ctx.fillStyle = '#12324a';
  ctx.beginPath(); ctx.arc(-4 * dir, -26, 1.8, 0, Math.PI * 2); ctx.arc(4 * dir, -26, 1.8, 0, Math.PI * 2); ctx.fill();
  ctx.strokeStyle = '#7c4a22';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.arc(0, -23, 5, 0.15 * Math.PI, 0.85 * Math.PI); ctx.stroke();
  // carried item / dish above the head
  if (carry) {
    ctx.fillStyle = 'rgba(255,197,61,0.25)';
    ctx.beginPath(); ctx.arc(0, -58, 22, 0, Math.PI * 2); ctx.fill();
    if (carry.kind === 'dish') drawDish(ctx, carry.recipeId, 0, -62, 0.8);
    else drawIngredient(ctx, carry.id, 0, -58, 0.9, carry.chopped, carry.grilled || carry.boiled);
  }
  ctx.restore();
}

export function drawBibi(ctx, x, y, busy, t) {
  const bob = busy ? Math.sin(t * 14) * 2 : 0;
  ctx.save();
  ctx.translate(x, y + bob);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 22, 18, 5, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3f7d5a';
  ctx.beginPath(); ctx.ellipse(0, 0, 14, 15, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f4ead6';
  ctx.beginPath(); ctx.ellipse(0, 4, 10, 10, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#e8b25e';
  ctx.beginPath(); ctx.arc(0, -20, 11, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#3f7d5a';
  ctx.beginPath(); ctx.arc(-8, -30, 4, 0, Math.PI * 2); ctx.arc(8, -30, 4, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#12324a';
  ctx.beginPath(); ctx.arc(-4, -20, 1.6, 0, Math.PI * 2); ctx.arc(4, -20, 1.6, 0, Math.PI * 2); ctx.fill();
  if (busy) {
    ctx.strokeStyle = '#fff3d6';
    ctx.lineWidth = 3;
    ctx.beginPath(); ctx.moveTo(14, -6); ctx.lineTo(26, -14); ctx.stroke();
  }
  ctx.fillStyle = 'rgba(255,233,196,0.8)';
  ctx.font = '11px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('BIBI · helper', 0, 38);
  ctx.restore();
}

export function drawCat(ctx, x, y, t) {
  const breathe = Math.sin(t * 1.4) * 1.5;
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = 'rgba(0,0,0,0.3)';
  ctx.beginPath(); ctx.ellipse(0, 12, 52, 8, 0, 0, Math.PI * 2); ctx.fill();
  ctx.fillStyle = '#f2b25c';
  ctx.beginPath(); ctx.ellipse(0, 0, 46, 15 + breathe * 0.3, 0, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.arc(38, -8, 13, 0, Math.PI * 2); ctx.fill();
  ctx.beginPath(); ctx.moveTo(30, -18); ctx.lineTo(33, -28); ctx.lineTo(38, -19); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(42, -19); ctx.lineTo(47, -28); ctx.lineTo(50, -18); ctx.closePath(); ctx.fill();
  ctx.strokeStyle = '#7c4a22';
  ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(34, -8); ctx.lineTo(30, -8); ctx.moveTo(42, -8); ctx.lineTo(46, -8); ctx.stroke();
  ctx.beginPath(); ctx.moveTo(-44, -4); ctx.quadraticCurveTo(-58, -14, -52, -26); ctx.stroke();
  // "Z" sleep puffs
  ctx.fillStyle = 'rgba(255,233,196,0.85)';
  ctx.font = 'bold 13px sans-serif';
  ctx.fillText('z', 52, -26 - Math.sin(t * 1.4) * 3);
  ctx.font = 'bold 10px sans-serif';
  ctx.fillText('z', 62, -36);
  ctx.restore();
}

export function drawSteam(ctx, x, y, t, n = 3) {
  ctx.strokeStyle = 'rgba(230,240,255,0.5)';
  ctx.lineWidth = 2;
  ctx.lineCap = 'round';
  for (let i = 0; i < n; i++) {
    const off = Math.sin(t * 2 + i * 2.1) * 4;
    const yy = y - ((t * 14 + i * 12) % 26);
    ctx.beginPath();
    ctx.moveTo(x + off - 6 + i * 6, yy);
    ctx.quadraticCurveTo(x + off + i * 6, yy - 6, x + off - 3 + i * 6, yy - 12);
    ctx.stroke();
  }
}
