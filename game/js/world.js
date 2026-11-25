// The kitchen floor and the night-market backdrop.
// V3 FIX (a): the floor is ONE continuous warm wooden-plank surface —
// long boards with varied warm tones and grain, drawn as a single pass.
// There is no repeating checkerboard grid anywhere in this file.
import { COL, W, H } from './config.js';

// Deterministic pseudo-random so the floor looks identical every run.
function mulberry(seed) {
  let a = seed;
  return () => {
    a |= 0; a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const plankTones = ['#6b4a2f', '#755232', '#63452c', '#7d5736', '#6f4d30', '#5d3f27'];
const _prand = mulberry(20261125);
// Grain streaks, precomputed once so the floor is identical every frame.
const grainLines = [];
for (let row = 0; row < 14; row++) {
  for (let g = 0; g < 3; g++) {
    grainLines.push({ row, y: 6 + _prand() * 22, w1: (_prand() - 0.5) * 6, w2: (_prand() - 0.5) * 6 });
  }
}

export function drawFloor(ctx) {
  // Base wash, only across the kitchen band (y 168..600). The HUD and
  // order board above it are painted by their own draw calls and must
  // never be covered by the floor.
  const top = 168;
  const bottom = 600;
  ctx.fillStyle = '#241a12';
  ctx.fillRect(0, top, W, bottom - top);
  // Long horizontal planks: each board spans the full width, staggered
  // butt joints only, so the eye reads boards, never tiles.
  const plankH = 34;
  let row = 0;
  for (let y = top; y < bottom; y += plankH, row++) {
    const tone = plankTones[row % plankTones.length];
    ctx.fillStyle = tone;
    ctx.fillRect(0, y, W, plankH);
    // Grain: a few soft darker streaks inside the board (precomputed).
    ctx.strokeStyle = 'rgba(40,22,10,0.25)';
    ctx.lineWidth = 1;
    for (const g of grainLines) {
      if (g.row !== row) continue;
      const gy = y + g.y;
      ctx.beginPath();
      ctx.moveTo(0, gy);
      ctx.bezierCurveTo(W * 0.3, gy + g.w1, W * 0.7, gy + g.w2, W, gy);
      ctx.stroke();
    }
    // One butt joint per board, staggered left/right by row.
    const jx = row % 2 === 0 ? W * 0.38 : W * 0.66;
    ctx.strokeStyle = 'rgba(40,22,10,0.5)';
    ctx.beginPath();
    ctx.moveTo(jx, y);
    ctx.lineTo(jx, y + plankH);
    ctx.stroke();
    // Board separator: a single warm shadow line.
    ctx.fillStyle = 'rgba(30,16,8,0.55)';
    ctx.fillRect(0, y + plankH - 2, W, 2);
    ctx.fillStyle = 'rgba(255,190,120,0.06)';
    ctx.fillRect(0, y, W, 2);
  }
  // Warm hearth glow pooling on the boards.
  const glow = ctx.createRadialGradient(620, 240, 20, 620, 240, 420);
  glow.addColorStop(0, 'rgba(255,140,50,0.20)');
  glow.addColorStop(1, 'rgba(255,140,50,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, top, W, bottom - top);
}

export function drawRug(ctx, x, y, w, h, label) {
  ctx.fillStyle = COL.rugEdge;
  roundRect(ctx, x - 6, y - 6, w + 12, h + 12, 14);
  ctx.fill();
  ctx.fillStyle = COL.rug;
  roundRect(ctx, x, y, w, h, 10);
  ctx.fill();
  ctx.strokeStyle = '#e8b25e';
  ctx.lineWidth = 2;
  ctx.setLineDash([8, 6]);
  roundRect(ctx, x + 8, y + 8, w - 16, h - 16, 8);
  ctx.stroke();
  ctx.setLineDash([]);
  if (label) {
    ctx.fillStyle = 'rgba(255,233,196,0.75)';
    ctx.font = '11px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label, x + w / 2, y + h - 6);
  }
}

export function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// V3 FIX (c): a filled night-market backdrop for title / results screens:
// string lanterns, stall awnings, crowd silhouettes, warm glow.
export function drawMarketBackdrop(ctx, t) {
  const sky = ctx.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, '#171226');
  sky.addColorStop(0.55, '#241527');
  sky.addColorStop(1, '#160f1c');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H);
  // Distant rooftops.
  ctx.fillStyle = '#1b1428';
  for (let i = 0; i < 8; i++) {
    const rx = i * 170 - 20;
    ctx.beginPath();
    ctx.moveTo(rx, 300);
    ctx.lineTo(rx + 60, 240);
    ctx.lineTo(rx + 120, 300);
    ctx.closePath();
    ctx.fill();
  }
  // Stall awnings across the middle.
  const awnings = ['#a83232', '#c96a1e', '#7c5aa8', '#2e7d5b', '#a83232', '#c96a1e'];
  for (let i = 0; i < 6; i++) {
    const sx = i * 220 - 10;
    const sy = 330 + (i % 2) * 30;
    ctx.fillStyle = '#241a12';
    ctx.fillRect(sx + 10, sy + 40, 180, 150);
    ctx.fillStyle = awnings[i];
    ctx.beginPath();
    ctx.moveTo(sx, sy + 40);
    ctx.lineTo(sx + 200, sy + 40);
    ctx.lineTo(sx + 185, sy);
    ctx.lineTo(sx + 15, sy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = 'rgba(255,200,110,0.85)';
    for (let s = 0; s < 3; s++) ctx.fillRect(sx + 30 + s * 55, sy + 60, 34, 26);
    // Stall sign.
    ctx.fillStyle = '#ffe9c4';
    ctx.font = 'bold 13px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(['NOODLES', 'SKEWERS', 'FISH', 'RICE', 'TEA', 'SWEETS'][i], sx + 100, sy + 118);
  }
  // String lanterns along the top, gently swaying.
  for (let i = 0; i < 9; i++) {
    const lx = 60 + i * 145;
    const sway = Math.sin(t * 0.9 + i * 1.3) * 6;
    const ly = 118 + (i % 3) * 14;
    ctx.strokeStyle = 'rgba(255,220,150,0.5)';
    ctx.beginPath();
    ctx.moveTo(lx, 0);
    ctx.lineTo(lx + sway, ly - 14);
    ctx.stroke();
    const g = ctx.createRadialGradient(lx + sway, ly, 2, lx + sway, ly, 46);
    g.addColorStop(0, 'rgba(255,170,80,0.55)');
    g.addColorStop(1, 'rgba(255,170,80,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(lx + sway, ly, 46, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = i % 2 ? '#ff7a2f' : '#e2483d';
    ctx.beginPath();
    ctx.ellipse(lx + sway, ly, 13, 16, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.ellipse(lx + sway, ly, 6, 9, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  // Crowd silhouettes along the bottom.
  ctx.fillStyle = '#0e0a14';
  for (let i = 0; i < 22; i++) {
    const cx = i * 62 + (i % 2) * 18;
    const ch = 52 + ((i * 37) % 26);
    ctx.beginPath();
    ctx.arc(cx, H - ch - 8, 13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillRect(cx - 16, H - ch, 32, ch);
  }
  // Warm floor glow.
  const glow = ctx.createRadialGradient(640, 640, 40, 640, 640, 560);
  glow.addColorStop(0, 'rgba(255,140,50,0.16)');
  glow.addColorStop(1, 'rgba(255,140,50,0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, W, H);
}

export function drawLanternRow(ctx, t) {
  for (let i = 0; i < 7; i++) {
    const lx = 90 + i * 185;
    const sway = Math.sin(t * 0.8 + i) * 4;
    ctx.strokeStyle = 'rgba(255,220,150,0.4)';
    ctx.beginPath();
    ctx.moveTo(lx, 168);
    ctx.lineTo(lx + sway, 196);
    ctx.stroke();
    ctx.fillStyle = i % 2 ? '#ff7a2f' : '#e2483d';
    ctx.beginPath();
    ctx.ellipse(lx + sway, 206, 11, 13, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#ffe9a8';
    ctx.beginPath();
    ctx.ellipse(lx + sway, 206, 5, 7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
