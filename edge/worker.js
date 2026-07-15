const API_BASE = 'https://community-api-axuaystczl.cn-hangzhou.fcapp.run';
const SITE_ORIGIN = 'https://link.pythonide.xin';
const DEFAULT_INDEX_URL = 'https://raw.githubusercontent.com/Python-IDE/pythonide-link/main/index.html';
const DEFAULT_IMAGE = `${SITE_ORIGIN}/assets/app-icon.png`;
const DEFAULT_TITLE = 'Python IDE 社区作品';
const DEFAULT_DESCRIPTION = '在 Python IDE 中查看、运行和导入社区作品。';

const CATEGORY_LABELS = {
  python: 'PYTHON', miniapp: 'MINIAPP', appui: 'APPUI', html: 'HTML',
  scene: 'SCENE', pygame: 'PYGAME', widget: 'WIDGET', other: 'COMMUNITY',
};

const FONT = {
  ' ': ['00000','00000','00000','00000','00000','00000','00000'],
  '-': ['00000','00000','00000','11111','00000','00000','00000'],
  '.': ['00000','00000','00000','00000','00000','01100','01100'],
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

function socialPayload(script, scriptId, origin = SITE_ORIGIN) {
  const title = String(script?.title || DEFAULT_TITLE).trim().slice(0, 90) || DEFAULT_TITLE;
  const description = String(script?.ai_summary || script?.summary || DEFAULT_DESCRIPTION).trim().slice(0, 160) || DEFAULT_DESCRIPTION;
  const cover = safeHTTPSURL(script?.cover_image_url || script?.preview_image_url || script?.thumbnail_url);
  return {
    title,
    documentTitle: title === DEFAULT_TITLE ? title : `${title} · Python IDE`,
    description,
    url: `${origin}/s/${encodeURIComponent(scriptId)}`,
    image: cover || `${origin}/og/script/${encodeURIComponent(scriptId)}.png`,
    isGeneratedImage: !cover,
    author: String(script?.author_name || '').trim().slice(0, 60),
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
    programmingLanguage: 'Python',
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
    ${dimensions}
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${escapeHTML(meta.title)}">
    <meta name="twitter:description" content="${escapeHTML(meta.description)}">
    <meta name="twitter:image" content="${escapeHTML(meta.image)}">
    <link rel="canonical" href="${escapeHTML(meta.url)}">
    <script type="application/ld+json">${jsonLD}</script>
    <!-- edge:meta-end -->`;
}

function injectMetadata(html, meta) {
  const blockPattern = /<!-- edge:meta-start -->[\s\S]*?<!-- edge:meta-end -->/;
  const withMeta = blockPattern.test(html) ? html.replace(blockPattern, buildMetaBlock(meta)) : html;
  return withMeta.replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHTML(meta.documentTitle)}</title>`);
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

function drawCodeArtwork(target, script, scriptId) {
  const seed = stableHash(`${scriptId}:${script?.content || script?.title || ''}`);
  fillRoundedRect(target, 64, 190, 1072, 364, 24, '#171717');
  fillRect(target, 64, 254, 1072, 1, '#30302f');
  drawText(target, 'READ ONLY PREVIEW', 92, 215, 2, '#777774', 24);

  const lines = String(script?.content || '').replace(/\r\n?/g, '\n').split('\n').filter((line) => line.trim()).slice(0, 10);
  const fallback = ['python ide community', 'share clean useful code', 'open in the app', 'build something great'];
  const source = lines.length ? lines : fallback;
  source.slice(0, 9).forEach((line, index) => {
    const y = 286 + (index * 27);
    const lineHash = stableHash(`${seed}:${line}:${index}`);
    const indent = Math.min(3, (line.match(/^\s*/)?.[0].length || 0) / 2);
    const start = 105 + (indent * 24);
    const available = 730 - (indent * 24);
    const length = Math.max(80, Math.min(available, 100 + ((line.length * 8 + (lineHash % 130)) % available)));
    fillRoundedRect(target, start, y, length, 9, 4, index % 4 === 1 ? '#8fb9d8' : '#e6e6e1');
    if (lineHash % 3 === 0) fillRoundedRect(target, start + length + 12, y, 54 + (lineHash % 80), 9, 4, '#d9a735');
  });

  const category = CATEGORY_LABELS[String(script?.category || 'other').toLowerCase()] || 'COMMUNITY';
  fillRoundedRect(target, 875, 214, 220, 40, 10, '#f7f7f5');
  drawText(target, category, 895, 224, 2, '#171717', 16);
  fillCircle(target, 1002, 386, 84, '#20201f');
  fillCircle(target, 1002, 386, 50, '#171717');
  const orbit = [[1002,307],[1070,346],[1070,426],[1002,465],[934,426],[934,346]];
  orbit.forEach(([x, y], index) => fillCircle(target, x, y, 11, index === 1 ? '#e8aa24' : '#1f5f95'));
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
  const category = CATEGORY_LABELS[String(script?.category || 'other').toLowerCase()] || 'COMMUNITY';
  drawText(target, `${category} COMMUNITY WORK`, 68, 142, 3, '#6f6f6f', 30);
  drawCodeArtwork(target, script, scriptId);
  drawText(target, 'PYTHON IDE', 74, 584, 2, '#6f6f6f', 20);
  drawText(target, 'OPEN IN APP', 952, 584, 2, '#6f6f6f', 20);
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
  return new Response(injectMetadata(html, meta), {
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
  injectMetadata,
  renderCard,
  safeHTTPSURL,
  socialPayload,
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
