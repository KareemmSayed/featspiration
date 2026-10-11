#!/usr/bin/env node
// Builds a feature-findings page: checks a findings.json file and injects it into assets/template.html.
// No dependencies. Needs Node 18 or newer.
//
//   node build.mjs findings.json                 -> findings.html next to the JSON (a complete HTML document)
//   node build.mjs findings.json -o out.html     -> choose the output path
//   node build.mjs findings.json --fragment      -> page without <html>/<head>/<body>, for hosts that add
//                                                   their own document shell (for example Claude's Artifact tool)
//   node build.mjs findings.json --check         -> validate only, write nothing

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const flags = new Set(args.filter(a => a.startsWith('--')));
const outIndex = args.findIndex(a => a === '-o' || a === '--out');
const outArg = outIndex >= 0 ? args[outIndex + 1] : null;
const input = args.find((a, i) => !a.startsWith('-') && (outIndex < 0 || i !== outIndex + 1));

if (!input || flags.has('--help')) {
  console.log('Usage: node build.mjs <findings.json> [-o out.html] [--fragment] [--check]');
  process.exit(input ? 0 : 1);
}

const here = dirname(fileURLToPath(import.meta.url));
const templatePath = resolve(here, '..', 'assets', 'template.html');

let data;
try {
  data = JSON.parse(readFileSync(resolve(input), 'utf8'));
} catch (e) {
  console.error(`Cannot read ${input}: ${e.message}`);
  process.exit(1);
}

const errors = [];
const warnings = [];
const isStr = v => typeof v === 'string' && v.trim().length > 0;
const isList = v => Array.isArray(v);
const words = s => String(s || '').trim().split(/\s+/).filter(Boolean).length;
const AURAS = ['violet', 'graphite', 'ember', 'moss', 'amber', 'azure', 'flame'];
const TONES = ['num', 'good', 'bad', 'warn', 'muted'];

if (!data || typeof data !== 'object' || isList(data)) {
  errors.push('The file must contain one JSON object.');
} else {
  for (const key of ['project', 'title', 'headline']) {
    if (!isStr(data[key])) errors.push(`"${key}" is required (a non-empty string).`);
  }
  if (isStr(data.title) && data.title.length > 60) warnings.push('"title" is the page name: keep it to a few words.');
  if (data.aura !== undefined && !AURAS.includes(data.aura)) errors.push(`"aura" must be one of: ${AURAS.join(', ')}.`);
  if (data.dir !== undefined && !['ltr', 'rtl'].includes(data.dir)) errors.push('"dir" must be "ltr" or "rtl".');
  if (data.labels !== undefined && (typeof data.labels !== 'object' || isList(data.labels))) errors.push('"labels" must be an object.');

  // Short read
  const blocks = data.read && data.read.blocks;
  if (!isList(blocks) || blocks.length === 0) {
    errors.push('"read.blocks" needs at least one block: the short read is half the page.');
  } else {
    let readWords = 0;
    blocks.forEach((b, i) => {
      const at = `read.blocks[${i}]`;
      if (!isStr(b.title)) errors.push(`${at}: "title" is required.`);
      const hasBody = (isList(b.bullets) && b.bullets.length) || b.table || isStr(b.text);
      if (!hasBody) errors.push(`${at}: add "bullets", "table" or "text".`);
      if (b.bullets !== undefined && !(isList(b.bullets) && b.bullets.every(isStr))) errors.push(`${at}: "bullets" must be a list of strings.`);
      if (b.table) {
        const cols = b.table.columns, rows = b.table.rows;
        if (!isList(cols) || !cols.every(isStr)) errors.push(`${at}.table: "columns" must be a list of strings.`);
        if (!isList(rows) || rows.length === 0) errors.push(`${at}.table: "rows" must be a non-empty list.`);
        else rows.forEach((row, r) => {
          if (!isList(row)) return errors.push(`${at}.table.rows[${r}] must be a list of cells.`);
          if (isList(cols) && row.length !== cols.length) errors.push(`${at}.table.rows[${r}] has ${row.length} cells for ${cols.length} columns.`);
          row.forEach(cell => {
            if (cell && typeof cell === 'object') {
              if (typeof cell.text !== 'string') errors.push(`${at}.table.rows[${r}]: an object cell needs "text".`);
              if (cell.tone !== undefined && !TONES.includes(cell.tone)) errors.push(`${at}.table.rows[${r}]: "tone" must be one of ${TONES.join(', ')}.`);
            } else if (typeof cell !== 'string') errors.push(`${at}.table.rows[${r}]: cells are strings or {"text", "tone"} objects.`);
          });
        });
      }
      readWords += words(b.title) + words(b.text) + words(b.note) + (isList(b.bullets) ? b.bullets.reduce((n, x) => n + words(x), 0) : 0);
    });
    if (readWords > 650) warnings.push(`The short read is ${readWords} words. It is meant to be skimmed: aim for 350 to 500.`);
  }

  // Tiers
  const tierIds = [];
  if (!isList(data.tiers) || data.tiers.length === 0) {
    errors.push('"tiers" needs at least one group, for example {"id": "a", "label": "Start here"}.');
  } else {
    data.tiers.forEach((t, i) => {
      if (!isStr(t.id) || !isStr(t.label)) errors.push(`tiers[${i}] needs "id" and "label".`);
      else if (tierIds.includes(t.id)) errors.push(`tiers[${i}]: duplicate id "${t.id}".`);
      else tierIds.push(t.id);
    });
  }

  // Features
  const seen = [];
  const promptWords = [];
  if (!isList(data.features) || data.features.length === 0) {
    errors.push('"features" needs at least one feature.');
  } else {
    let lastTierRank = -1;
    data.features.forEach((f, i) => {
      const at = `features[${i}]${isStr(f.id) ? ` (${f.id})` : ''}`;
      if (!isStr(f.id)) errors.push(`${at}: "id" is required, as a string such as "01".`);
      else if (seen.includes(f.id)) errors.push(`${at}: duplicate id.`);
      for (const key of ['title', 'description', 'prompt']) if (!isStr(f[key])) errors.push(`${at}: "${key}" is required.`);
      if (!tierIds.includes(f.tier)) errors.push(`${at}: "tier" must be one of the tier ids (${tierIds.join(', ') || 'none defined'}).`);
      else {
        const rank = tierIds.indexOf(f.tier);
        if (rank < lastTierRank) warnings.push(`${at}: features should be listed tier by tier, in the order the tiers are defined.`);
        lastTierRank = Math.max(lastTierRank, rank);
      }
      if (!['S', 'M', 'L'].includes(f.size)) errors.push(`${at}: "size" must be "S", "M" or "L". Split anything larger.`);
      for (const key of ['sources', 'inSource', 'better', 'landsIn', 'needs', 'helps']) {
        if (f[key] !== undefined && !(isList(f[key]) && f[key].every(isStr))) errors.push(`${at}: "${key}" must be a list of strings.`);
      }
      for (const key of ['needs', 'helps']) {
        (isList(f[key]) ? f[key] : []).forEach(dep => {
          if (dep === f.id) errors.push(`${at}: lists itself in "${key}".`);
          else if (!data.features.some(x => x.id === dep)) errors.push(`${at}: "${key}" names "${dep}", which is not a feature id.`);
          else if (key === 'needs' && !seen.includes(dep)) errors.push(`${at}: needs "${dep}", which comes later. The list is the build order, so move "${dep}" above it.`);
        });
      }
      if (!(isList(f.landsIn) && f.landsIn.length)) warnings.push(`${at}: no "landsIn" paths. A prompt that names no files usually means the project was not read.`);
      if (!(isList(f.better) && f.better.length)) warnings.push(`${at}: no "better" bullets. Say how this is improved for this project.`);
      if (isStr(f.description) && words(f.description) > 70) warnings.push(`${at}: the description is ${words(f.description)} words. Two or three sentences is enough.`);
      if (isStr(f.prompt)) {
        const n = words(f.prompt);
        promptWords.push(n);
        if (n < 80) warnings.push(`${at}: the prompt is only ${n} words. It has to stand alone in a session that has seen nothing else.`);
        if (/\b(TODO|TBD|FIXME)\b|<[a-z_ -]*(path|file|name)[a-z_ -]*>|\bas (discussed|mentioned) (above|earlier)\b/i.test(f.prompt)) {
          warnings.push(`${at}: the prompt has a placeholder or refers to context the next session will not have.`);
        }
      }
      if (isStr(f.id)) seen.push(f.id);
    });
  }
  if (!isStr(data.groundRules)) warnings.push('No "groundRules". Every prompt should end with the project\'s rules (layout, conventions, how to verify).');

  if (!errors.length) {
    const sizes = ['S', 'M', 'L'].map(s => `${data.features.filter(f => f.size === s).length} ${s}`).join(', ');
    console.log(`${data.features.length} features (${sizes}) in ${tierIds.length} tier${tierIds.length === 1 ? '' : 's'}; prompts ${Math.min(...promptWords)} to ${Math.max(...promptWords)} words before ground rules.`);
  }
}

warnings.forEach(w => console.warn(`warning: ${w}`));
if (errors.length) {
  errors.forEach(e => console.error(`error: ${e}`));
  console.error(`\n${errors.length} error${errors.length === 1 ? '' : 's'}. Nothing was written.`);
  process.exit(1);
}
if (flags.has('--check')) {
  console.log('OK.');
  process.exit(0);
}

const template = readFileSync(templatePath, 'utf8');
const [head, body] = template.split('<!--BODY-->');
if (body === undefined || !head.includes('__TITLE__') || !body.includes('__DATA__')) {
  console.error(`The template at ${templatePath} is missing its markers (<!--BODY-->, __TITLE__, __DATA__).`);
  process.exit(1);
}
const escapeHtml = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
// "<" is escaped so no string in the data can close the script element that carries it.
const json = JSON.stringify(data).replace(/</g, '\\u003c');
const headOut = head.replace('__TITLE__', () => escapeHtml(data.title));
const bodyOut = body.replace('__DATA__', () => json);

const lang = isStr(data.lang) ? data.lang : 'en';
const dir = data.dir === 'rtl' ? ' dir="rtl"' : '';
const page = flags.has('--fragment')
  ? headOut + bodyOut
  : `<!doctype html>\n<html lang="${escapeHtml(lang)}"${dir}>\n<head>\n<meta charset="utf-8">\n<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">\n${headOut}</head>\n<body>${bodyOut}</body>\n</html>\n`;

const suffix = flags.has('--fragment') ? '.fragment.html' : '.html';
const out = resolve(outArg || input.replace(/\.json$/i, '') + suffix);
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, page);
console.log(`Wrote ${out} (${Math.round(page.length / 1024)} KB${flags.has('--fragment') ? ', fragment' : ''}).`);
