import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { fileURLToPath } from 'node:url';

let renderer;
try {
  renderer = await import('../edge/worker.js');
} catch (error) {
  if (error?.code !== 'ERR_MODULE_NOT_FOUND') throw error;
  renderer = await import('../../link-edge/worker.js');
}
const { injectInitialScriptData, injectMetadata, renderCard, socialPayload } = renderer;

const API_BASE = process.env.COMMUNITY_API_BASE
  || 'https://community-api-axuaystczl.cn-hangzhou.fcapp.run';
const SITE_ORIGIN = 'https://link.pythonide.xin';
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(repositoryRoot, 'index.html');
const shareRoot = path.join(repositoryRoot, 's');
const imageRoot = path.join(repositoryRoot, 'og', 'script');

async function responseJSON(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PythonIDE-Link-Generator/1.0',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Community API ${response.status}: ${url}`);
  return response.json();
}

async function listScripts() {
  const scripts = [];
  let cursor = '';
  do {
    const url = new URL('/v1/scripts', API_BASE);
    url.searchParams.set('limit', '50');
    url.searchParams.set('sort', 'updated');
    if (cursor) url.searchParams.set('cursor', cursor);
    const payload = await responseJSON(url);
    if (!Array.isArray(payload.scripts)) throw new Error('Community API returned no scripts array');
    scripts.push(...payload.scripts);
    cursor = String(payload.next_cursor || '');
  } while (cursor);
  return scripts;
}

function safeScriptID(value) {
  const id = String(value || '').trim();
  return /^[A-Za-z0-9_-]{3,160}$/.test(id) ? id : '';
}

async function generateScriptPage(template, script) {
  const scriptID = safeScriptID(script.script_id);
  if (!scriptID) return false;
  const meta = socialPayload(script, scriptID, SITE_ORIGIN);

  const pageDirectory = path.join(shareRoot, scriptID);
  await mkdir(pageDirectory, { recursive: true });
  const page = injectInitialScriptData(injectMetadata(template, meta), script);
  await writeFile(path.join(pageDirectory, 'index.html'), page);

  const image = await renderCard(script, scriptID);
  await writeFile(path.join(imageRoot, `${scriptID}.png`), image);
  return true;
}

async function main() {
  const template = await readFile(indexPath, 'utf8');
  const scripts = await listScripts();
  await rm(shareRoot, { recursive: true, force: true });
  await rm(path.join(repositoryRoot, 'og'), { recursive: true, force: true });
  await mkdir(shareRoot, { recursive: true });
  await mkdir(imageRoot, { recursive: true });

  let generated = 0;
  const batchSize = 8;
  for (let index = 0; index < scripts.length; index += batchSize) {
    const batch = scripts.slice(index, index + batchSize);
    const results = await Promise.all(batch.map((script) => generateScriptPage(template, script)));
    generated += results.filter(Boolean).length;
  }
  process.stdout.write(`Generated ${generated} share pages and PNG cards.\n`);
}

await main();
