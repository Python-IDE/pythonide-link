const API_BASE = 'https://community-api-axuaystczl.cn-hangzhou.fcapp.run';
const SITE_ORIGIN = 'https://link.pythonide.xin';
const DEFAULT_INDEX_URL = 'https://raw.githubusercontent.com/Python-IDE/pythonide-link/main/index.html';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/app-icon.png`;
const DEFAULT_TITLE = 'Python IDE 社区作品';
const DEFAULT_DESCRIPTION = '在 Python IDE 中查看、运行和导入社区作品。';

const FONT = {
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '.': ['00000','00000','00000','00000','00000','01100','01100'],
  '/': ['00001','00010','00100','01000','10000','00000','00000'],
  '<': ['00001','00010','00100','01000','00100','00010','00001'],
  '>': ['10000','01000','00100','00010','00100','01000','10000'],
  '{': ['00011','00100','00100','11000','00100','00100','00011'],
  '}': ['11000','00100','00100','00011','00100','00100','11000'],
  '0': ['01110','10001','10011','10101','11001','10001','01110'],
  '1': ['00100','01100','00100','00100','00100','00100','01110'],
  '2': ['01110','10001','00001','00010','00100','01000','11111'],
  '3': ['11110','00001','00001','01110','00001','00001','11110'],
  '4': ['00010','00110','01010','10010','11111','00010','00010'],
  '5': ['11111','10000','10000','11110','00001','00001','11110'],
  '6': ['01110','10000','10000','11110','10001','10001','01110'],
  '7': ['11111','00001','00010','00100','01000','01000','01000'],
  '8': ['01110','10001','10001','01110','10001','10001','01110'],
  '9': ['01110','10001','10001','01111','00001','00001','01110'],
  A: ['01110','10001','10001','11111','10001','10001','10001'],
  B: ['11110','10001','10001','11110','10001','10001','11110'],
  C: ['01111','10000','10000','10000','10000','10000','01111'],
  D: ['11110','10001','10001','10001','10001','10001','11110'],
  E: ['11111','10000','10000','11110','10000','10000','11111'],
  F: ['11111','10000','10000','11110','10000','10000','10000'],
  G: ['01111','10000','10000','10111','10001','10001','01111'],
  H: ['10001','10001','10001','11111','10001','10001','10001'],
  I: ['01110','00100','00100','00100','00100','00100','01110'],
  J: ['00111','00010','00010','00010','10010','10010','01100'],
  K: ['10001','10010','10100','11000','10100','10010','10001'],
  L: ['10000','10000','10000','10000','10000','10000','11111'],
  M: ['10001','11011','10101','10101','10001','10001','10001'],
  N: ['10001','11001','10101','10011','10001','10001','10001'],
  O: ['01110','10001','10001','10001','10001','10001','01110'],
  P: ['11110','10001','10001','11110','10000','10000','10000'],
  Q: ['01110','10001','10001','10001','10101','10010','01101'],
  R: ['11110','10001','10001','11110','10100','10010','10001'],
  S: ['01111','10000','10000','01110','00001','00001','11110'],
  T: ['11111','00100','00100','00100','00100','00100','00100'],
  U: ['10001','10001','10001','10001','10001','10001','01110'],
  V: ['10001','10001','10001','10001','10001','01010','00100'],
  W: ['10001','10001','10001','10101','10101','10101','01010'],
  X: ['10001','10001','01010','00100','01010','10001','10001'],
  Y: ['10001','10001','01010','00100','00100','00100','00100'],
  Z: ['11111','00001','00010','00100','01000','10000','11111'],
};

function escapeHTML(value) {
  return String(value || '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function safeHTTPSURL(value) {
  try {
    const url = new URL(String(value || ''));
    return url.protocol === 'https:' ? url.href : '';
  } catch {
    return '';
  }
}

function decodeSegment(value) {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

function isProjectScript(script) {
  const tags = [...(script?.tags || []), ...(script?.ai_tags || [])]
    .map((value) => String(value || '').trim().toLowerCase());
  return String(script?.content_mode || '').trim().toLowerCase() === 'project_package'
    || Boolean(script?.package_id)
    || tags.includes('project')
    || tags.includes('project_package')
    || tags.includes('community_content_mode:project_package');
}

function workPresentation(script) {
  const category = String(script?.category || '').trim().toLowerCase();
  const fileType = String(script?.file_type || '').trim().replace(/^\./, '').toLowerCase();
  const tags = [...(script?.tags || []), ...(script?.ai_tags || [])]
    .map((value) => String(value || '').trim().toLowerCase());
  const taggedRuntime = tags.find((value) => value.startsWith('community_runtime:'))
    ?.split(':').slice(1).join(':') || '';
  const runtime = String(script?.runtime || taggedRuntime).trim().toLowerCase();
  const project = isProjectScript(script);
  const format = project ? 'PROJECT' : 'SINGLE FILE';
  const matches = (...values) => values.some((value) => (
    value === category || value === fileType || value === runtime || tags.includes(value)
  ));
  if (matches('pygame', 'scene', 'game')) {
    const runtimeLabel = matches('pygame') ? 'PYGAME ' : (matches('scene') ? 'SCENE ' : '');
    return { kind: 'game', label: `GAME · ${runtimeLabel}${format}`, preview: project ? 'WORK PREVIEW' : 'CODE PREVIEW', project, language: runtimeLabel.trim() || 'GAME' };
  }
  if (matches('miniapp', 'minip')) return { kind: 'miniapp', label: `MINIAPP · ${format}`, preview: project ? 'WORK PREVIEW' : 'CODE PREVIEW', project, language: 'MINIAPP' };
  if (matches('appui', 'ui')) return { kind: 'appui', label: `APPUI · ${format}`, preview: project ? 'WORK PREVIEW' : 'CODE PREVIEW', project, language: 'PYTHON' };
  if (matches('widget', 'widgets')) return { kind: 'widget', label: `WIDGET · ${format}`, preview: project ? 'WORK PREVIEW' : 'CODE PREVIEW', project, language: 'PYTHON' };
  if (matches('html', 'htm')) return { kind: 'html', label: `HTML · ${format}`, preview: project ? 'WORK PREVIEW' : 'CODE PREVIEW', project, language: 'HTML' };
  if (matches('python', 'py', 'pyw')) return { kind: 'python', label: `PYTHON · ${format}`, preview: project ? 'WORK PREVIEW' : 'CODE PREVIEW', project, language: 'PYTHON' };
  return { kind: 'other', label: `PYTHONIDE · ${format}`, preview: 'WORK PREVIEW', project, language: 'SOURCE CODE' };
}

function shareRevision(script, scriptId = '') {
  const source = String(script?.content_hash || script?.updated_at || script?.approved_at || script?.version || scriptId || 'preview');
  return stableHash(source).toString(36);
}

function socialPayload(script, scriptId, origin = SITE_ORIGIN) {
  const title = String(script?.title || DEFAULT_TITLE).trim().slice(0, 90) || DEFAULT_TITLE;
  const description = String(script?.ai_summary || script?.summary || DEFAULT_DESCRIPTION).trim().slice(0, 160) || DEFAULT_DESCRIPTION;
  const cover = safeHTTPSURL(script?.cover_image_url || script?.preview_image_url || script?.thumbnail_url);
  const presentation = workPresentation(script);
  return {
    title,
    documentTitle: title === DEFAULT_TITLE ? title : `${title} · Python IDE`,
    description,
    url: `${origin}/s/${encodeURIComponent(scriptId)}`,
    image: cover || `${origin}/og/script/${encodeURIComponent(scriptId)}.png?v=${shareRevision(script, scriptId)}`,
    isGeneratedImage: !cover,
    author: String(script?.author_name || '').trim().slice(0, 60),
    programmingLanguage: presentation.language,
  };
}

function buildMetaBlock(meta) {
  const dimensions = meta.isGeneratedImage
    ? '<meta property="og:image:width" content="1200">\n    <meta property="og:image:height" content="630">'
    : '';
  const jsonLD = JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'SoftwareSourceCode',
    name: meta.title,
    description: meta.description,
    url: meta.url,
    author: meta.author ? { '@type': 'Person', name: meta.author } : undefined,
    programmingLanguage: meta.programmingLanguage || 'Source code',
    codeRepository: meta.url,
  }).replaceAll('<', '\\u003c');
  return `<!-- edge:meta-start -->
    <meta name="description" content="${escapeHTML(meta.description)}">
    <meta property="og:type" content="article">
    <meta property="og:site_name" content="Python IDE">
    <meta property="og:title" content="${escapeHTML(meta.title)}">
    <meta property="og:description" content="${escapeHTML(meta.description)}">
    <meta property="og:url" content="${escapeHTML(meta.url)}">
    <meta property="og:image" content="${escapeHTML(meta.image)}">
    <meta property="og:image:secure_url" content="${escapeHTML(meta.image)}">
    <meta property="og:image:alt" content="${escapeHTML(`${meta.title} · PythonIDE 作品预览`)}">
    ${dimensions}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHTML(meta.title)}">
    <meta name="twitter:description" content="${escapeHTML(meta.description)}">
    <meta name="twitter:image" content="${escapeHTML(meta.image)}">
    <meta name="twitter:image:alt" content="${escapeHTML(`${meta.title} · PythonIDE 作品预览`)}">
    <link rel="canonical" href="${escapeHTML(meta.url)}">
    <script type="application/ld+json">${jsonLD}</script>
    <!-- edge:meta-end -->`;
}

function injectMetadata(html, meta) {
  const blockPattern = /<!-- edge:meta-start -->[\s\S]*?<!-- edge:meta-end -->/;
  const withMeta = blockPattern.test(html) ? html.replace(blockPattern, buildMetaBlock(meta)) : html;
  return withMeta.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHTML(meta.documentTitle)}</title>`);
}

function injectInitialScriptData(html, script) {
  const serialized = JSON.stringify(script || {})
    .replaceAll('<', '\\u003c')
    .replaceAll('\u2028', '\\u2028')
    .replaceAll('\u2029', '\\u2029');
  return html.replace(
    /(<script\b[^>]*\bid=["']initial-script-data["'][^>]*>)[\s\S]*?(<\/script>)/i,
    (_match, openingTag, closingTag) => `${openingTag}${serialized}${closingTag}`,
  );
}

async function fetchScript(scriptId, fetcher = fetch) {
  const response = await fetcher(`${API_BASE}/v1/scripts/${encodeURIComponent(scriptId)}`, {
    headers: { Accept: 'application/json', 'User-Agent': 'PythonIDE-Link-Edge/1.0' },
    cf: { cacheTtl: 120, cacheEverything: true },
  });
  if (!response.ok) throw new Error(`Community API ${response.status}`);
  const payload = await response.json();
  if (!payload?.script) throw new Error('Missing script payload');
  return payload.script;
}

function hex(value) {
  const normalized = value.replace('#', '');
  return [
    parseInt(normalized.slice(0, 2), 16),
    parseInt(normalized.slice(2, 4), 16),
    parseInt(normalized.slice(4, 6), 16),
    255,
  ];
}

function canvas(width, height, background) {
  const pixels = new Uint8Array(width * height * 4);
  const color = hex(background);
  for (let index = 0; index < pixels.length; index += 4) pixels.set(color, index);
  return { width, height, pixels };
}

function fillRect(target, x, y, width, height, colorValue) {
  const color = Array.isArray(colorValue) ? colorValue : hex(colorValue);
  const left = Math.max(0, Math.floor(x));
  const top = Math.max(0, Math.floor(y));
  const right = Math.min(target.width, Math.ceil(x + width));
  const bottom = Math.min(target.height, Math.ceil(y + height));
  for (let row = top; row < bottom; row += 1) {
    for (let column = left; column < right; column += 1) {
      target.pixels.set(color, (row * target.width + column) * 4);
    }
  }
}

function fillCircle(target, centerX, centerY, radius, color) {
  const squared = radius * radius;
  for (let y = Math.floor(centerY - radius); y <= Math.ceil(centerY + radius); y += 1) {
    for (let x = Math.floor(centerX - radius); x <= Math.ceil(centerX + radius); x += 1) {
      const dx = x - centerX;
      const dy = y - centerY;
      if ((dx * dx) + (dy * dy) <= squared) fillRect(target, x, y, 1, 1, color);
    }
  }
}

function fillRoundedRect(target, x, y, width, height, radius, color) {
  fillRect(target, x + radius, y, width - (radius * 2), height, color);
  fillRect(target, x, y + radius, width, height - (radius * 2), color);
  fillCircle(target, x + radius, y + radius, radius, color);
  fillCircle(target, x + width - radius - 1, y + radius, radius, color);
  fillCircle(target, x + radius, y + height - radius - 1, radius, color);
  fillCircle(target, x + width - radius - 1, y + height - radius - 1, radius, color);
}

function drawText(target, text, x, y, scale, color, maxCharacters = 40) {
  let cursor = x;
  for (const rawCharacter of String(text || '').toUpperCase().slice(0, maxCharacters)) {
    const glyph = FONT[rawCharacter] || FONT[' '];
    glyph.forEach((row, rowIndex) => {
      Array.from(row).forEach((bit, columnIndex) => {
        if (bit === '1') fillRect(target, cursor + (columnIndex * scale), y + (rowIndex * scale), scale, scale, color);
      });
    });
    cursor += scale * 6;
  }
}

function stableHash(value) {
  let hash = 2166136261;
  for (const character of String(value || '')) {
    hash ^= character.codePointAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function drawBrand(target) {
  const blue = '#1f5f95';
  const yellow = '#e8aa24';
  const points = [[86,61],[108,61],[119,80],[108,99],[86,99],[75,80]];
  points.forEach(([x, y], index) => fillCircle(target, x, y, 8, index === 2 ? yellow : blue));
  drawText(target, 'PYTHON IDE', 145, 62, 4, '#0d0d0d', 12);
}

function drawTypeGlyph(target, presentation, x, y, size, color, background) {
  if (presentation.kind === 'html') {
    drawText(target, '</>', x, y + Math.round(size * 0.28), Math.max(2, Math.round(size / 16)), color, 3);
    return;
  }
  if (presentation.kind === 'python' || presentation.kind === 'other') {
    drawText(target, presentation.kind === 'python' ? 'PY' : '{ }', x, y + Math.round(size * 0.28), Math.max(2, Math.round(size / 16)), color, 3);
    return;
  }
  if (presentation.kind === 'game') {
    fillRoundedRect(target, x, y + (size * 0.23), size, size * 0.56, size * 0.18, color);
    fillRect(target, x + (size * 0.2), y + (size * 0.43), size * 0.22, size * 0.07, background);
    fillRect(target, x + (size * 0.275), y + (size * 0.355), size * 0.07, size * 0.24, background);
    fillCircle(target, x + (size * 0.72), y + (size * 0.42), size * 0.055, background);
    fillCircle(target, x + (size * 0.82), y + (size * 0.54), size * 0.055, background);
    return;
  }
  if (presentation.kind === 'miniapp' || presentation.kind === 'appui') {
    fillRoundedRect(target, x, y + (size * 0.08), size, size * 0.84, size * 0.13, color);
    fillRoundedRect(target, x + (size * 0.07), y + (size * 0.16), size * 0.86, size * 0.68, size * 0.08, background);
    fillRect(target, x + (size * 0.07), y + (size * 0.31), size * 0.86, size * 0.055, color);
    if (presentation.kind === 'appui') {
      fillRect(target, x + (size * 0.37), y + (size * 0.16), size * 0.055, size * 0.68, color);
    }
    return;
  }
  if (presentation.kind === 'widget') {
    const cell = size * 0.42;
    fillRoundedRect(target, x, y, cell, cell, size * 0.1, color);
    fillRoundedRect(target, x + (size * 0.54), y, cell, size * 0.3, size * 0.1, color);
    fillRoundedRect(target, x, y + (size * 0.54), cell, cell, size * 0.1, color);
    fillRoundedRect(target, x + (size * 0.54), y + (size * 0.4), cell, size * 0.56, size * 0.1, color);
  }
}

function formatCardCount(value) {
  const count = Math.max(0, Number(value) || 0);
  if (count >= 1000000) return `${Math.floor(count / 100000) / 10}M`;
  if (count >= 10000) return `${Math.floor(count / 1000)}K`;
  return String(Math.round(count));
}

function drawUnifiedArtwork(target, script, scriptId) {
  const presentation = workPresentation(script);
  const cardX = 64;
  const cardY = 176;
  const cardWidth = 1072;
  const cardHeight = 390;
  const headerHeight = 66;
  const statsHeight = 58;
  const previewY = cardY + headerHeight;
  const previewHeight = cardHeight - headerHeight - statsHeight;
  fillRoundedRect(target, cardX, cardY, cardWidth, cardHeight, 24, '#ffffff');
  fillRect(target, cardX, previewY, cardWidth, previewHeight, '#202123');
  fillRect(target, cardX, previewY, cardWidth, 1, '#ddddda');
  fillRect(target, cardX, previewY + previewHeight, cardWidth, 1, '#ddddda');

  fillRoundedRect(target, cardX + 22, cardY + 13, 40, 40, 10, '#f1f1ef');
  drawTypeGlyph(target, presentation, cardX + 30, cardY + 21, 24, '#111111', '#f1f1ef');
  drawText(target, presentation.label.replace('·', '-'), cardX + 80, cardY + 24, 2, '#171717', 38);
  drawText(target, presentation.preview, cardX + 842, cardY + 24, 2, '#747474', 20);

  const seed = stableHash(`${scriptId}:${script?.content || script?.title || ''}`);
  const lines = String(script?.content || '').replace(/\r\n?/g, '\n').split('\n').filter((line) => line.trim()).slice(0, 8);
  const fallback = ['python ide community', 'share clean useful code', 'open in the app'];
  const source = lines.length ? lines : fallback;
  source.slice(0, presentation.project ? 3 : 7).forEach((line, index) => {
    const lineHash = stableHash(`${seed}:${line}:${index}`);
    const y = previewY + 48 + (index * 29);
    const indent = presentation.project ? 0 : Math.min(3, Math.floor((line.match(/^\s*/)?.[0].length || 0) / 2));
    const start = cardX + 42 + (indent * 22);
    const available = presentation.project ? 520 : 650 - (indent * 22);
    const length = Math.max(110, Math.min(available, 140 + ((line.length * 7 + (lineHash % 140)) % available)));
    fillRoundedRect(target, start, y, length, 9, 4, index % 4 === 1 ? '#a9a9a6' : '#e6e6e1');
    if (!presentation.project && lineHash % 3 === 0) {
      fillRoundedRect(target, start + length + 12, y, 48 + (lineHash % 72), 9, 4, '#777779');
    }
  });

  fillRoundedRect(target, cardX + 844, previewY + 46, 142, 142, 30, '#2b2c2e');
  drawTypeGlyph(target, presentation, cardX + 874, previewY + 76, 82, '#ededeb', '#2b2c2e');

  const stats = [
    [script?.view_count, 'VIEWS'], [script?.like_count, 'LIKES'],
    [script?.run_count, 'RUNS'], [script?.download_count, 'IMPORTS'],
  ];
  stats.forEach(([value, label], index) => {
    const center = cardX + 40 + (index * 266);
    drawText(target, formatCardCount(value), center, cardY + cardHeight - 36, 2, '#171717', 7);
    drawText(target, label, center + 72, cardY + cardHeight - 36, 1, '#747474', 10);
  });
}

function crc32(bytes) {
  let crc = 0xffffffff;
  for (const byte of bytes) {
    crc ^= byte;
    for (let bit = 0; bit < 8; bit += 1) crc = (crc >>> 1) ^ (0xedb88320 & -(crc & 1));
  }
  return (crc ^ 0xffffffff) >>> 0;
}

function uint32(value) {
  return new Uint8Array([(value >>> 24) & 255, (value >>> 16) & 255, (value >>> 8) & 255, value & 255]);
}

function concat(parts) {
  const length = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(length);
  let offset = 0;
  parts.forEach((part) => { output.set(part, offset); offset += part.length; });
  return output;
}

function pngChunk(type, data) {
  const typeBytes = new TextEncoder().encode(type);
  const body = concat([typeBytes, data]);
  return concat([uint32(data.length), body, uint32(crc32(body))]);
}

async function encodePNG(target) {
  const stride = (target.width * 4) + 1;
  const raw = new Uint8Array(stride * target.height);
  for (let y = 0; y < target.height; y += 1) {
    const destination = y * stride;
    raw[destination] = 0;
    raw.set(target.pixels.subarray(y * target.width * 4, (y + 1) * target.width * 4), destination + 1);
  }
  const compressed = new Uint8Array(await new Response(
    new Blob([raw]).stream().pipeThrough(new CompressionStream('deflate')),
  ).arrayBuffer());
  const header = new Uint8Array(13);
  header.set(uint32(target.width), 0);
  header.set(uint32(target.height), 4);
  header.set([8, 6, 0, 0, 0], 8);
  return concat([
    new Uint8Array([137,80,78,71,13,10,26,10]),
    pngChunk('IHDR', header),
    pngChunk('IDAT', compressed),
    pngChunk('IEND', new Uint8Array()),
  ]);
}

async function renderCard(script, scriptId) {
  const target = canvas(1200, 630, '#f7f7f5');
  drawBrand(target);
  drawText(target, 'PYTHONIDE COMMUNITY WORK', 68, 132, 3, '#6f6f6f', 30);
  drawUnifiedArtwork(target, script, scriptId);
  drawText(target, 'PYTHON IDE', 74, 592, 2, '#6f6f6f', 20);
  drawText(target, 'OPEN IN APP', 952, 592, 2, '#6f6f6f', 20);
  return encodePNG(target);
}

async function handleSharePage(request, scriptId, env, fetcher = fetch) {
  const indexURL = env?.STATIC_INDEX_URL || DEFAULT_INDEX_URL;
  const [indexResponse, scriptResult] = await Promise.all([
    fetcher(indexURL, { cf: { cacheTtl: 60, cacheEverything: true } }),
    fetchScript(scriptId, fetcher).catch(() => null),
  ]);
  if (!indexResponse.ok) return new Response('Share page is temporarily unavailable.', { status: 502 });
  const html = await indexResponse.text();
  const meta = socialPayload(scriptResult, scriptId, new URL(request.url).origin);
  return new Response(injectInitialScriptData(injectMetadata(html, meta), scriptResult), {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=utf-8',
      'Cache-Control': 'public, max-age=60, s-maxage=180, stale-while-revalidate=600',
      'Content-Language': 'zh-CN',
      'X-Content-Type-Options': 'nosniff',
      'Referrer-Policy': 'strict-origin-when-cross-origin',
    },
  });
}

async function handleOGImage(scriptId, fetcher = fetch) {
  try {
    const script = await fetchScript(scriptId, fetcher);
    const cover = safeHTTPSURL(script.cover_image_url || script.preview_image_url || script.thumbnail_url);
    if (cover) return Response.redirect(cover, 302);
    const png = await renderCard(script, scriptId);
    return new Response(png, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=300, s-maxage=3600, stale-while-revalidate=86400',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch {
    return Response.redirect(DEFAULT_IMAGE, 302);
  }
}

export {
  buildMetaBlock,
  encodePNG,
  handleOGImage,
  handleSharePage,
  injectInitialScriptData,
  injectMetadata,
  renderCard,
  safeHTTPSURL,
  shareRevision,
  socialPayload,
  workPresentation,
};

export default {
  async fetch(request, env) {
    if (request.method !== 'GET' && request.method !== 'HEAD') {
      return new Response('Method not allowed', { status: 405, headers: { Allow: 'GET, HEAD' } });
    }
    const url = new URL(request.url);
    const shareMatch = /^\/s\/([^/]+)\/?$/.exec(url.pathname);
    if (shareMatch) return handleSharePage(request, decodeSegment(shareMatch[1]), env);
    const imageMatch = /^\/og\/script\/([^/]+)\.png$/.exec(url.pathname);
    if (imageMatch) return handleOGImage(decodeSegment(imageMatch[1]));
    return new Response('Not found', { status: 404 });
  },
};
