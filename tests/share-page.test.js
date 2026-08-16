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
  assert.deepEqual(core.parseRoutePath('/community/pst_abc'), {
    type: 'community',
    postID: 'pst_abc',
    commentID: '',
    path: '/community/pst_abc',
  });
  assert.deepEqual(core.parseRoutePath('/community/pst_abc?commentID=cmt_7&lang=en'), {
    type: 'community',
    postID: 'pst_abc',
    commentID: 'cmt_7',
    path: '/community/pst_abc?commentID=cmt_7',
  });
  assert.deepEqual(core.parseRoutePath('/community/user/usr2_abc?lang=en'), {
    type: 'profile',
    userID: 'usr2_abc',
    path: '/community/user/usr2_abc',
  });
  assert.deepEqual(core.parseRoutePath('/l/PY8K29'), { type: 'short', code: 'PY8K29', path: '/l/PY8K29' });
  assert.deepEqual(core.parseRoutePath('/import?url=https%3A%2F%2Fexample.com%2Fdemo.zip'), {
    type: 'import',
    remote: 'https://example.com/demo.zip',
    path: '/import?url=https%3A%2F%2Fexample.com%2Fdemo.zip',
  });
  assert.deepEqual(core.parseRoutePath('/unknown'), { type: 'home', path: '/' });
  assert.equal(core.parseRoutePath('/s/%E0%A4%A').id, '%E0%A4%A');
});

test('keeps browser and copied paths clean while preserving English links', () => {
  const scriptRoute = core.parseRoutePath('/s/scr_123?v=stale');
  assert.equal(core.routeDisplayPath(scriptRoute, 'zh'), '/s/scr_123');
  assert.equal(core.routeDisplayPath(scriptRoute, 'en'), '/s/scr_123?lang=en');
  const importRoute = core.parseRoutePath('/import?url=https%3A%2F%2Fexample.com%2Fdemo.zip');
  assert.equal(
    core.routeDisplayPath(importRoute, 'en'),
    '/import?url=https%3A%2F%2Fexample.com%2Fdemo.zip&lang=en',
  );
  const communityRoute = core.parseRoutePath('/community/pst_123?commentID=cmt_9&v=stale');
  assert.equal(
    core.routeDisplayPath(communityRoute, 'en'),
    '/community/pst_123?commentID=cmt_9&lang=en',
  );
  const profileRoute = core.parseRoutePath('/community/user/usr2_123?v=stale');
  assert.equal(
    core.routeDisplayPath(profileRoute, 'en'),
    '/community/user/usr2_123?lang=en',
  );
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
  assert.equal(
    core.customURLFor({ type: 'community', postID: 'pst:1', commentID: 'cmt:2' }),
    'pythonide://community/post/pst%3A1?commentID=cmt%3A2',
  );
  assert.equal(
    core.customURLFor({ type: 'community', postID: 'pst_1', commentID: '' }),
    'pythonide://community/post/pst_1',
  );
  assert.equal(
    core.customURLFor({ type: 'profile', userID: 'usr2:1' }),
    'pythonide://community/user/usr2%3A1',
  );
});

test('Community web fallback rejects malformed or ambiguous routes', () => {
  [
    '/community',
    '/community/',
    '/Community/pst_1',
    '/community/pst_1/',
    '/community/pst_1/extra',
    '/community/%2Fprivate',
    '/community/pst%5Cprivate',
    '/community/%20',
    '/community/pst_1#fragment',
    '/community/pst_1?commentID=',
    '/community/pst_1?commentID=cmt_1%2Fprivate',
    '/community/pst_1?commentID=cmt_1&commentID=cmt_2',
    '/community/pst_1?lang=fr',
    '/community/pst_1?redirect=https%3A%2F%2Fevil.example',
    '/community/user',
    '/community/user/',
    '/community/user/usr_1/',
    '/community/user/usr_1/extra',
    '/community/user/%2Fprivate',
    '/community/user/usr%5Cprivate',
    '/community/user/%20',
    '/community/user/usr_1#fragment',
    '/community/user/usr_1?commentID=cmt_1',
    '/community/user/usr_1?lang=fr',
    '/community/user/usr_1?lang=en&lang=zh',
  ].forEach((rawPath) => {
    assert.deepEqual(core.parseRoutePath(rawPath), { type: 'home', path: '/' }, rawPath);
  });
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

test('maps every community work into one stable card type system', () => {
  assert.deepEqual(core.typePresentation({ category: 'html', file_type: 'html' }, 'zh'), {
    kind: 'html', symbol: '</>', label: 'HTML · 单文件', isProject: false,
  });
  assert.deepEqual(core.typePresentation({ category: 'python', file_type: 'py' }, 'en'), {
    kind: 'python', symbol: 'PY', label: 'Python · single file', isProject: false,
  });
  assert.deepEqual(core.typePresentation({
    category: 'pygame', file_type: 'py', runtime: 'pygame', content_mode: 'project_package',
  }, 'zh'), {
    kind: 'game', symbol: '', label: 'Game · Pygame 项目', isProject: true,
  });
  assert.deepEqual(core.typePresentation({
    category: 'miniapp', file_type: 'miniapp', package_id: 'pkg_1',
  }, 'zh'), {
    kind: 'miniapp', symbol: '', label: 'MiniApp · 项目', isProject: true,
  });
  assert.equal(core.isProjectScript({ tags: ['pygame', 'project'] }), true);
});

test('versions generated share images but keeps real HTTPS covers', () => {
  const script = { updated_at: '2026-07-16T12:00:00Z' };
  const image = core.shareImageURL(script, 'scr_123');
  assert.match(image, /^https:\/\/link\.pythonide\.xin\/og\/script\/scr_123\.png\?v=[a-z0-9]+$/);
  assert.equal(core.shareImageURL({ ...script, cover_image_url: 'https://cdn.example.com/work.png' }, 'scr_123'), 'https://cdn.example.com/work.png');
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
  assert.match(html, /class="work-typebar"/);
  assert.match(html, /class="poster-preview hidden" id="posterPreview"/);
  assert.match(html, /class="author-row"[^>]*id="authorRow"/);
  assert.match(html, /class="button primary" id="openApp"/);
  assert.match(html, /class="button secondary"[^>]*id="downloadApp"/);
  assert.match(html, /class="language-toggle"/);
  assert.doesNotMatch(html, /class="header-link"/);
  assert.doesNotMatch(html, /class="embedded-guide/);
  assert.doesNotMatch(html, /class="work-header/);
  assert.match(html, /id="initial-script-data" type="application\/json">\{\}<\/script>/);
  assert.match(html, /id="initial-community-data" type="application\/json">\{\}<\/script>/);
  assert.match(html, /share-page\.css\?v=20260716-unified-work-card-2/);
  assert.match(html, /share-page\.js\?v=20260817-community-links-1/);
  assert.doesNotMatch(html, /id="projectTitle"/);
  assert.doesNotMatch(html, /id="projectDescription"/);
  assert.match(css, /min-height:\s*100svh/);
  assert.match(css, /-webkit-line-clamp:\s*2/);
  assert.match(css, /\.site-footer\s*\{\s*display:\s*none;/);
  assert.match(css, /\.language-toggle::before/);
  assert.match(css, /background-size:\s*64px 64px/);
  assert.match(css, /\.button\s*\{[\s\S]*?border-radius:\s*999px/);
  assert.match(css, /\.button\.primary\s*\{[\s\S]*?justify-content:\s*center/);
  assert.doesNotMatch(css, /\.button\.primary\s*\{[\s\S]*?justify-content:\s*space-between/);
  assert.match(css, /\.modal-actions \.button\s*\{[\s\S]*?text-align:\s*center/);
  assert.match(css, /\.work-typebar\s*\{[\s\S]*?height:\s*46px/);
  assert.match(css, /\.stats\s*\{[\s\S]*?height:\s*42px/);
});

test('404 fallback and controller cooperate to restore a clean path', () => {
  const siteRoot = path.resolve(__dirname, '..');
  const fallback = fs.readFileSync(path.join(siteRoot, '404.html'), 'utf8');
  const controller = fs.readFileSync(path.join(siteRoot, 'assets/share-page.js'), 'utf8');
  assert.match(fallback, /\?path=/);
  assert.match(controller, /history\.replaceState/);
});

test('AASA hands Community V2 shares to the app without claiming reserved short links', () => {
  const siteRoot = path.resolve(__dirname, '..');
  const association = JSON.parse(
    fs.readFileSync(path.join(siteRoot, '.well-known/apple-app-site-association'), 'utf8'),
  );
  const components = association.applinks.details[0].components;
  const paths = components.map((component) => component['/']);
  assert.ok(paths.includes('/community/*'));
  assert.ok(paths.includes('/s/*'));
  assert.ok(paths.includes('/import'));
  assert.ok(!paths.includes('/l/*'));
});
