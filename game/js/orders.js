// Order tickets: spawn, drain patience, walk out.
import { MAX_TICKETS } from './config.js';
import { RECIPES } from './recipes.js';
import { applyMiss } from './score.js';
import { serviceOf } from './state.js';

export function spawnOrder(state, rng = Math.random) {
  if (state.orders.length >= MAX_TICKETS) return null;
  const recipe = RECIPES[Math.floor(rng() * RECIPES.length)];
  const svc = serviceOf(state);
  const patience = svc.patience * (state.upgrades.includes('patience') ? 1.25 : 1);
  const order = { id: state.nextOrderId++, recipeId: recipe.id, patience, max: patience };
  state.orders.push(order);
  return order;
}

// Drain patience; returns 'lose' when the 6th walk-out happens.
export function tickOrders(state, dt, rng = Math.random) {
  const svc = serviceOf(state);
  state.spawnIn -= dt;
  if (state.spawnIn <= 0) {
    spawnOrder(state, rng);
    state.spawnIn = svc.spawnEvery;
  }
  for (const order of [...state.orders]) {
    order.patience -= dt;
    if (order.patience <= 0) {
      state.orders.splice(state.orders.indexOf(order), 1);
      state.popups.push({ x: 640, y: 200, text: 'WALKED OUT!', color: '#ff6b5e', t: 0, life: 1.4 });
      if (applyMiss(state) === 'lose') return 'lose';
    }
  }
  return null;
}

export function findOrderFor(state, recipeId) {
  return state.orders.find((o) => o.recipeId === recipeId) ?? null;
}
