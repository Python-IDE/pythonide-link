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
  || 'https://community-api.pythonide.xin/v2/community';
const SITE_ORIGIN = 'https://link.pythonide.xin';
const repositoryRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(repositoryRoot, 'index.html');
const shareRoot = path.join(repositoryRoot, 's');
const imageRoot = path.join(repositoryRoot, 'og', 'script');

async function responseJSON(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'User-Agent': 'PythonIDE-Link-Generator/2.0',
    },
    signal: AbortSignal.timeout(30000),
  });
  if (!response.ok) throw new Error(`Community API ${response.status}: ${url}`);
  return response.json();
}

function shareSnapshotFromPost(post) {
  const attachment = post?.attachment;
  const runtime = attachment?.runtimeArtifact;
  const scriptID = String(runtime?.scriptID || '').trim();
  if (!scriptID) return null;
  const coverURL = attachment?.mediaReferences
    ?.map((media) => media?.posterImage?.urlString || media?.originalImage?.urlString)
    .find((value) => String(value || '').startsWith('https://')) || null;
  return {
    id: scriptID,
    postID: String(post.id || ''),
    title: String(attachment.title || post.title || ''),
    summary: String(attachment.summary || post.body || ''),
    body: String(post.body || ''),
    category: String(post.category || ''),
    attachmentKind: String(attachment.kind || ''),
    runtimeKind: String(runtime.kind || ''),
    fileName: String(runtime.fileName || ''),
    contentMode: attachment.style === 'project' ? 'project_package' : 'single_file',
    miniAppRuntime: runtime.miniAppRuntime || null,
    sourcePreview: '',
    sourcePreviewTruncated: false,
    coverURL,
    author: post.author || null,
    attachment,
    viewCount: Number(post.viewCount || 0),
    likeCount: Number(post.likeCount || 0),
    runCount: Number(post.runCount || 0),
    downloadCount: Number(post.downloadCount || 0),
    createdAt: post.createdAt || null,
    updatedAt: post.updatedAt || null,
    revision: Number(post.revision || 0),
  };
}

async function listScripts() {
  const scriptsByID = new Map();
  let cursor = '';
  do {
    const url = new URL(`${API_BASE.replace(/\/$/, '')}/feed`);
    url.searchParams.set('mode', 'latest');
    url.searchParams.set('limit', '50');
    if (cursor) url.searchParams.set('cursor', cursor);
    const payload = await responseJSON(url);
    if (!Array.isArray(payload?.data?.items)) {
      throw new Error('Community V2 API returned no feed items array');
    }
    payload.data.items.forEach((post) => {
      const snapshot = shareSnapshotFromPost(post);
      if (snapshot && !scriptsByID.has(snapshot.id)) scriptsByID.set(snapshot.id, snapshot);
    });
    cursor = String(payload.data.nextCursor || '');
  } while (cursor);
  return [...scriptsByID.values()];
}

function safeScriptID(value) {
  const id = String(value || '').trim();
  return /^[A-Za-z0-9_-]{3,160}$/.test(id) ? id : '';
}

async function generateScriptPage(template, script) {
  const scriptID = safeScriptID(script.id || script.script_id);
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
