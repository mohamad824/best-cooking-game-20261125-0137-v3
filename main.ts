// Ember Hearth — Night Market Kitchen, entry v3.
// Node 22, standard library only. Copies game/ and screenshots/ into the
// output directory the grader gives it, then writes dossier.json there
// with the buildDossier helper from the kit's vendor file.
import { cpSync, existsSync, mkdirSync, readdirSync, rmSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-game.ts';

const repoDir = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(process.argv[2] ?? process.env.MAKEFUN_OUTPUT ?? join(repoDir, 'output'));

function clearContents(dir: string): void {
  // Clear only the contents of the output directory, never the directory itself.
  if (!existsSync(dir)) {
    mkdirSync(dir, { recursive: true });
    return;
  }
  for (const entry of readdirSync(dir)) {
    rmSync(join(dir, entry), { recursive: true, force: true });
  }
}

function countEntries(dir: string): number {
  let n = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    n += 1;
    if (entry.isDirectory()) n += countEntries(join(dir, entry.name));
  }
  return n;
}

function copyTree(src: string, dest: string, label: string): number {
  if (!existsSync(src)) throw new Error(`missing ${label} directory: ${src}`);
  const n = countEntries(src);
  cpSync(src, dest, { recursive: true });
  return n;
}

function main(): void {
  const gameSrc = join(repoDir, 'game');
  const shotsSrc = join(repoDir, 'screenshots');
  clearContents(outDir);
  const gameN = copyTree(gameSrc, join(outDir, 'game'), 'game');
  const shotN = copyTree(shotsSrc, join(outDir, 'screenshots'), 'screenshots');
  const dossier = buildDossier(outDir, {
    text_max_bytes: 163840,
    screenshots: { max: 4, max_bytes: 262144 },
    game_max_files: 993,
    game_max_bytes: 50331648,
  });
  writeFileSync(join(outDir, 'dossier.json'), dossier);
  console.log(`copied ${gameN} game entries and ${shotN} screenshots`);
  console.log(`wrote ${join(outDir, 'dossier.json')} (${dossier.length} bytes)`);
}

main();
