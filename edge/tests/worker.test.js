import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleSharePage,
  injectMetadata,
  renderCard,
  safeHTTPSURL,
  socialPayload,
} from '../worker.js';

const script = {
  title: '天气卡片 <测试>',
  summary: '展示未来天气',
  ai_summary: '一个简洁的天气卡片作品',
  category: 'appui',
  file_type: 'py',
  author_name: '社区作者',
  content: 'from appui import App\n\napp = App()\napp.run()',
  like_count: 12,
  run_count: 34,
};

test('builds canonical per-script social metadata', () => {
  const meta = socialPayload(script, 'scr_123', 'https://link.pythonide.xin');
  assert.equal(meta.title, '天气卡片 <测试>');
  assert.equal(meta.description, '一个简洁的天气卡片作品');
  assert.equal(meta.url, 'https://link.pythonide.xin/s/scr_123');
  assert.equal(meta.image, 'https://link.pythonide.xin/og/script/scr_123.png');
  assert.equal(meta.isGeneratedImage, true);
});

test('uses an existing HTTPS cover as the share thumbnail', () => {
  const meta = socialPayload({ ...script, cover_image_url: 'https://cdn.example.com/cover.png' }, 'scr_123');
  assert.equal(meta.image, 'https://cdn.example.com/cover.png');
  assert.equal(meta.isGeneratedImage, false);
  assert.equal(safeHTTPSURL('http://cdn.example.com/cover.png'), '');
});

test('injects escaped metadata into the static share page', () => {
  const html = '<html><head><!-- edge:meta-start --><meta name="description" content="old"><!-- edge:meta-end --><title>Old</title></head></html>';
  const output = injectMetadata(html, socialPayload(script, 'scr_123'));
  assert.match(output, /天气卡片 &lt;测试&gt;/);
  assert.match(output, /og:image/);
  assert.match(output, /application\/ld\+json/);
  assert.doesNotMatch(output, /<title>Old<\/title>/);
});

test('renders a valid 1200 by 630 PNG social card', async () => {
  const bytes = await renderCard(script, 'scr_123');
  assert.deepEqual(Array.from(bytes.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getUint32(16), 1200);
  assert.equal(view.getUint32(20), 630);
  assert.ok(bytes.byteLength > 10000);
});

test('server-renders metadata before a social crawler receives the page', async () => {
  const staticHTML = '<html><head><!-- edge:meta-start --><meta name="description" content="old"><!-- edge:meta-end --><title>Old</title></head><body>Share page</body></html>';
  const fetcher = async (url) => {
    if (String(url).includes('/v1/scripts/')) {
      return new Response(JSON.stringify({ script }), { status: 200, headers: { 'Content-Type': 'application/json' } });
    }
    return new Response(staticHTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
  };
  const response = await handleSharePage(
    new Request('https://link.pythonide.xin/s/scr_123'),
    'scr_123',
    { STATIC_INDEX_URL: 'https://static.example/index.html' },
    fetcher,
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(html, /天气卡片 &lt;测试&gt;/);
  assert.match(html, /https:\/\/link\.pythonide\.xin\/og\/script\/scr_123\.png/);
});
