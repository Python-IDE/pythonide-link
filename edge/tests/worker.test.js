import test from 'node:test';
import assert from 'node:assert/strict';
import {
  handleSharePage,
  injectInitialScriptData,
  injectMetadata,
  renderCard,
  safeHTTPSURL,
  shareRevision,
  socialPayload,
  workPresentation,
} from '../worker.js';

test('embeds safe first-paint work data into generated pages', () => {
  const template = '<script id="initial-script-data" type="application/json">{}</script>';
  const html = injectInitialScriptData(template, { script_id: 'scr_1', title: '$1</script><b>unsafe</b>' });
  assert.match(html, /"script_id":"scr_1"/);
  assert.match(html, /"title":"\$1\\u003c\/script>/);
  assert.doesNotMatch(html, /<b>unsafe<\/b>/);
  assert.match(html, /\\u003c\/script>/);
});

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
  assert.equal(meta.image, `https://link.pythonide.xin/og/script/scr_123.png?v=${shareRevision(script, 'scr_123')}`);
  assert.equal(meta.isGeneratedImage, true);
  assert.equal(meta.programmingLanguage, 'PYTHON');
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
  assert.match(output, /og:image:alt/);
  assert.match(output, /application\/ld\+json/);
  assert.doesNotMatch(output, /<title>Old<\/title>/);
});

test('uses one semantic type system for generated cards', () => {
  assert.deepEqual(workPresentation({ category: 'html', file_type: 'html' }), {
    kind: 'html', label: 'HTML · SINGLE FILE', preview: 'CODE PREVIEW', project: false, language: 'HTML',
  });
  assert.deepEqual(workPresentation({
    category: 'pygame', runtime: 'pygame', file_type: 'py', content_mode: 'project_package',
  }), {
    kind: 'game', label: 'GAME · PYGAME PROJECT', preview: 'WORK PREVIEW', project: true, language: 'PYGAME',
  });
  assert.deepEqual(workPresentation({
    category: 'python', file_type: 'py', tags: ['pygame', 'game', 'project'],
  }), {
    kind: 'game', label: 'GAME · PYGAME PROJECT', preview: 'WORK PREVIEW', project: true, language: 'PYGAME',
  });
  assert.deepEqual(workPresentation({ category: 'miniapp', package_id: 'pkg_1' }), {
    kind: 'miniapp', label: 'MINIAPP · PROJECT', preview: 'WORK PREVIEW', project: true, language: 'MINIAPP',
  });
});

test('renders a valid 1200 by 630 PNG social card', async () => {
  const bytes = await renderCard(script, 'scr_123');
  assert.deepEqual(Array.from(bytes.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  assert.equal(view.getUint32(16), 1200);
  assert.equal(view.getUint32(20), 630);
  assert.ok(bytes.byteLength > 10000);
});

test('server-renders metadata and first-paint data before a client receives the page', async () => {
  const staticHTML = '<html><head><!-- edge:meta-start --><meta name="description" content="old"><!-- edge:meta-end --><title>Old</title><script id="initial-script-data" type="application/json">{}</script></head><body>Share page</body></html>';
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
  assert.match(html, /"title":"天气卡片 \\u003c测试>"/);
});
