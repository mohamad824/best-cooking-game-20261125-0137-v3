// Pantry ingredients and the four dishes they combine into.
// Every ingredient has the preparation it needs before it can be plated:
// chop, grill and/or boil. A dish is ready when its plate holds exactly
// the prepared ingredients the recipe names.
export const INGREDIENTS = [
  { id: 'meat', name: 'MEAT', verb: 'grill it', color: '#e2574c', emoji: '🥩', prep: ['chop', 'grill'] },
  { id: 'pepper', name: 'PEPPER', verb: 'chop it', color: '#ff5a3c', emoji: '🌶️', prep: ['chop'] },
  { id: 'mushroom', name: 'MUSHROOM', verb: 'chop or grill', color: '#e8dcc8', emoji: '🍄', prep: ['chop'] },
  { id: 'fish', name: 'FISH', verb: 'grill it', color: '#7cc7ff', emoji: '🐟', prep: ['grill'] },
  { id: 'rice', name: 'RICE', verb: 'boil it', color: '#fff3d6', emoji: '🍚', prep: ['boil'] },
  { id: 'noodle', name: 'NOODLE', verb: 'boil it', color: '#ffd76a', emoji: '🍜', prep: ['boil'] },
];

export const RECIPES = [
  { id: 'skewer', name: 'EMBER SKEWER', needs: ['meat', 'pepper'], color: '#ff8a4c', emoji: '🍢' },
  { id: 'ricebowl', name: 'MUSHROOM RICE BOWL', needs: ['rice', 'mushroom'], color: '#ffe9a8', emoji: '🍚' },
  { id: 'fishplate', name: 'CHAR FISH PLATE', needs: ['fish', 'pepper'], color: '#9fd8ff', emoji: '🐟' },
  { id: 'noodle', name: 'MARKET NOODLE BOWL', needs: ['noodle', 'mushroom', 'pepper'], color: '#ffd76a', emoji: '🍜' },
];

export function ingredientById(id) {
  return INGREDIENTS.find((i) => i.id === id);
}

export function recipeById(id) {
  return RECIPES.find((r) => r.id === id);
}

// Is this set of plated ingredient ids exactly one recipe? Returns the
// recipe or null. Order does not matter; duplicates do not count.
export function matchRecipe(ids) {
  const set = [...new Set(ids)].sort().join(',');
  return RECIPES.find((r) => [...r.needs].sort().join(',') === set) ?? null;
}

// Could this set still grow into some recipe? Used for the mismatch hint.
export function isRecipePrefix(ids) {
  const set = new Set(ids);
  return RECIPES.some((r) => r.needs.every((n) => set.has(n) || true) && ids.every((id) => r.needs.includes(id)));
}
