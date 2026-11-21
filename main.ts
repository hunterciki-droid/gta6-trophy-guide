// GTA 6 Trophy Guide & Tracker — the entry program (Node 22, standard library only).
//
// What this program does, in three steps:
//   1. Copy this repository's app/ folder (the offline guide) and screenshots/
//      folder (the rendered screenshots) into the output directory.
//   2. Write /output/dossier.json with buildDossier from vendor/makefun-frontend.ts —
//      the summary the judge reads (screenshots, first-load files and bytes, source).
//   3. Nothing else: no network, no installs, no writes outside the output directory.
//
// vendor/makefun-frontend.ts is the kit's copy and must stay untouched: the sealed
// scorer rebuilds the dossier with its own copy and requires a byte-for-byte match.
//
// Outside the grader, MAKEFUN_OUTPUT_DIR stands in for /output:
//   mkdir -p out && MAKEFUN_OUTPUT_DIR=out node main.ts

import { cpSync, existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDossier } from './vendor/makefun-frontend.ts';

// The repository root is the directory this file lives in.
const here = fileURLToPath(new URL('.', import.meta.url));
// The grader hands us a writable /output; local runs override it with an env var.
const out = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';

mkdirSync(out, { recursive: true });
cpSync(join(here, 'app'), join(out, 'app'), { recursive: true });
mkdirSync(join(out, 'screenshots'), { recursive: true });
if (existsSync(join(here, 'screenshots'))) cpSync(join(here, 'screenshots'), join(out, 'screenshots'), { recursive: true });

// The scorer's own caps, passed through so a bad entry fails here first instead of
// at the gate: text at most 160 KiB, at most 4 screenshots of at most 256 KiB each,
// app/ at most 993 files and directories and 48 MiB in all. The output directory as
// a whole shares the platform's 1,000-entry / 64 MiB cap with dossier.json itself.
writeFileSync(
  join(out, 'dossier.json'),
  buildDossier(out, { text_max_bytes: 163840, screenshots: { max: 4, max_bytes: 262144 }, app_max_files: 993, app_max_bytes: 50331648 }),
);
