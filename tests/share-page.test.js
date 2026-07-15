'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const core = require('../assets/share-page.js');

test('restores only safe same-origin fallback paths', () => {
  assert.equal(core.safeForwardedPath('/s/scr_123?from=wechat'), '/s/scr_123?from=wechat');
  assert.equal(core.safeForwardedPath('//evil.example/s/123'), '');
  assert.equal(core.safeForwardedPath('https://evil.example/s/123'), '');
  assert.equal(core.safeForwardedPath(''), '');
});

test('parses every supported share route', () => {
  assert.deepEqual(core.parseRoutePath('/s/scr_abc'), { type: 'script', id: 'scr_abc', path: '/s/scr_abc' });
  assert.deepEqual(core.parseRoutePath('/l/PY8K29'), { type: 'short', code: 'PY8K29', path: '/l/PY8K29' });
  assert.deepEqual(core.parseRoutePath('/import?url=https%3A%2F%2Fexample.com%2Fdemo.zip'), {
    type: 'import',
    remote: 'https://example.com/demo.zip',
    path: '/import?url=https%3A%2F%2Fexample.com%2Fdemo.zip',
  });
  assert.deepEqual(core.parseRoutePath('/unknown'), { type: 'home', path: '/' });
  assert.equal(core.parseRoutePath('/s/%E0%A4%A').id, '%E0%A4%A');
});

test('creates encoded app deep links', () => {
  assert.equal(
    core.customURLFor({ type: 'script', id: 'scr 1&2' }),
    'pythonide://community/script?id=scr%201%262',
  );
  assert.equal(
    core.customURLFor({ type: 'import', remote: 'https://example.com/a b.zip' }),
    'pythonide://import?url=https%3A%2F%2Fexample.com%2Fa%20b.zip',
  );
});

test('detects embedded browsers that block custom schemes', () => {
  assert.equal(core.detectEmbeddedBrowser('MicroMessenger/8.0.54').key, 'wechat');
  assert.equal(core.detectEmbeddedBrowser('MQQBrowser/14.9').key, 'qq');
  assert.equal(core.detectEmbeddedBrowser('Mobile Safari').embedded, false);
});

test('chooses Chinese or English from the URL, saved choice, or browser language', () => {
  assert.equal(core.preferredLanguage('/s/demo?lang=en', 'zh-CN', 'zh'), 'en');
  assert.equal(core.preferredLanguage('/s/demo', 'en-US', 'zh'), 'zh');
  assert.equal(core.preferredLanguage('/s/demo', 'fr-FR', ''), 'en');
  assert.equal(core.preferredLanguage('/s/demo', 'zh-Hans', ''), 'zh');
});

test('builds safe bounded code previews', () => {
  const lines = core.previewLines('print(1)\nprint(2)\nprint(3)', 2, 100);
  assert.deepEqual(lines, ['print(1)', 'print(2)']);
  assert.equal(core.previewLines('\u0000\n', 20, 100).length, 0);
  assert.equal(core.previewLines('x'.repeat(500), 20, 100)[0].length, 100);
});

test('prefers AI summary and normalizes presentation data', () => {
  const script = {
    summary: '普通简介',
    ai_summary: '智能速览',
    category: 'python',
    file_type: 'py',
    tags: ['工具', 'Python'],
    ai_tags: ['python', '自动化'],
  };
  assert.equal(core.socialDescription(script), '智能速览');
  assert.deepEqual(core.normalizedTags(script), ['python', '自动化', '工具']);
  assert.deepEqual(core.filePresentation(script), {
    badge: 'PY',
    categoryLabel: 'Python',
    detail: '.py',
    language: 'py',
  });
});

test('accepts only HTTPS cover images', () => {
  assert.equal(core.safeImageURL('https://cdn.example.com/cover.png'), 'https://cdn.example.com/cover.png');
  assert.equal(core.safeImageURL('http://cdn.example.com/cover.png'), '');
  assert.equal(core.safeImageURL('javascript:alert(1)'), '');
});

test('the page contains every DOM hook used by the controller', () => {
  const siteRoot = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
  const script = fs.readFileSync(path.join(siteRoot, 'assets/share-page.js'), 'utf8');
  const hookBlock = script.match(/\[\s*'eyebrow'[\s\S]*?\]\.forEach/);
  assert.ok(hookBlock, 'DOM hook declaration is missing');
  const ids = [...hookBlock[0].matchAll(/'([A-Za-z][A-Za-z0-9]+)'/g)].map((match) => match[1]);
  const uniqueIDs = [...new Set(ids)];
  uniqueIDs.forEach((id) => assert.match(html, new RegExp(`id=["']${id}["']`), `missing #${id}`));
  assert.match(html, /assets\/brand-mark\.svg/);
  assert.doesNotMatch(html, /class="logo">Py</);
});

test('mobile share layout keeps one compact content flow with the primary action visible', () => {
  const siteRoot = path.resolve(__dirname, '..');
  const html = fs.readFileSync(path.join(siteRoot, 'index.html'), 'utf8');
  const css = fs.readFileSync(path.join(siteRoot, 'assets/share-page.css'), 'utf8');
  assert.match(html, /class="preview-viewport"/);
  assert.match(html, /class="author-row"[^>]*id="authorRow"/);
  assert.match(html, /class="button primary" id="openApp"/);
  assert.match(html, /class="button secondary"[^>]*id="downloadApp"/);
  assert.match(html, /class="language-toggle"/);
  assert.doesNotMatch(html, /class="header-link"/);
  assert.doesNotMatch(html, /class="embedded-guide/);
  assert.doesNotMatch(html, /class="work-header/);
  assert.match(html, /share-page\.css\?v=20260716-pill-buttons/);
  assert.match(html, /share-page\.js\?v=20260716-pill-buttons/);
  assert.match(css, /min-height:\s*100svh/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
  assert.match(css, /\.site-footer\s*\{\s*display:\s*none;/);
  assert.match(css, /\.language-toggle::before/);
  assert.match(css, /background-size:\s*64px 64px/);
  assert.match(css, /\.button\s*\{[\s\S]*?border-radius:\s*999px/);
  assert.match(css, /\.button\.primary\s*\{[\s\S]*?justify-content:\s*center/);
  assert.doesNotMatch(css, /\.button\.primary\s*\{[\s\S]*?justify-content:\s*space-between/);
  assert.match(css, /\.modal-actions \.button\s*\{[\s\S]*?text-align:\s*center/);
});

test('404 fallback and controller cooperate to restore a clean path', () => {
  const siteRoot = path.resolve(__dirname, '..');
  const fallback = fs.readFileSync(path.join(siteRoot, '404.html'), 'utf8');
  const controller = fs.readFileSync(path.join(siteRoot, 'assets/share-page.js'), 'utf8');
  assert.match(fallback, /\?path=/);
  assert.match(controller, /history\.replaceState/);
});
