// Chef movement (WASD / arrows / click-to-walk) and Bibi the helper.
export function tickChef(state, dt, keys) {
  const chef = state.chef;
  let vx = 0;
  let vy = 0;
  if (keys.left) vx -= 1;
  if (keys.right) vx += 1;
  if (keys.up) vy -= 1;
  if (keys.down) vy += 1;
  if (chef.target) {
    const dx = chef.target.x - chef.x;
    const dy = chef.target.y - chef.y;
    const d = Math.hypot(dx, dy);
    if (d < 8) {
      chef.target = null;
    } else {
      vx = dx / d;
      vy = dy / d;
    }
  }
  const len = Math.hypot(vx, vy);
  chef.moving = len > 0;
  if (len > 0) {
    const speed = 265;
    chef.x += (vx / len) * speed * dt;
    chef.y += (vy / len) * speed * dt;
    if (vx !== 0) chef.dir = vx > 0 ? 1 : -1;
  }
  // Kitchen floor bounds (below the order board, above the plating strip).
  chef.x = Math.max(140, Math.min(1080, chef.x));
  chef.y = Math.max(300, Math.min(585, chef.y));
  // Bibi drifts between her board and the cat rug, staying clear of the
  // CHOP labels above the boards.
  const bibi = state.bibi;
  const homeX = bibi.busy ? 310 : 275;
  const homeY = bibi.busy ? 335 : 350;
  bibi.x += (homeX - bibi.x) * dt * 2;
  bibi.y += (homeY - bibi.y) * dt * 2;
}
