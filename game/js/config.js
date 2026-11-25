// Shared constants: canvas size, services, upgrades, colours.
export const W = 1280;
export const H = 720;

export const WIN_SCORE = 1000;
export const MAX_MISSES = 6;
export const MAX_TICKETS = 4;

export const SERVICES = [
  { name: 'LUNCH SERVICE', short: 'Lunch', time: 90, spawnEvery: 12, patience: 45 },
  { name: 'EVENING SERVICE', short: 'Evening', time: 90, spawnEvery: 9, patience: 38 },
  { name: 'DINNER RUSH', short: 'Dinner Rush', time: 80, spawnEvery: 6, patience: 30 },
];

export const UPGRADES = [
  { id: 'chop', name: 'SHARP KNIVES', desc: 'Chopping is twice as fast', icon: '🔪' },
  { id: 'patience', name: 'WARM WELCOME', desc: 'Customers wait 25% longer', icon: '♥' },
  { id: 'tips', name: 'GOLDEN LADLE', desc: 'Tips are worth 50% more', icon: '★' },
];

export const COL = {
  bg: '#14101c',
  floorA: '#6b4a2f',
  floorB: '#7d5736',
  floorC: '#5d3f27',
  plankLine: '#4a2f1d',
  hud: '#161a2e',
  hudLine: '#ff7a2f',
  panel: '#232a44',
  panelEdge: '#3a4568',
  cream: '#ffe9c4',
  gold: '#ffc53d',
  orange: '#ff7a2f',
  ember: '#ff5a2a',
  green: '#7be495',
  red: '#ff6b5e',
  blue: '#7cc7ff',
  rug: '#a83232',
  rugEdge: '#7c1f1f',
};
