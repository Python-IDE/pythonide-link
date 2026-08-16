import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import {
  AASA_DOCUMENT,
  communityRoute,
  communityPostSocialPayload,
  communityProfileSocialPayload,
  handleAssociationFile,
  handleCommunityPage,
  handleSharePage,
  handleRequest,
  injectInitialCommunityData,
  injectInitialScriptData,
  injectMetadata,
  renderCard,
  renderCommunityCard,
  safeHTTPSURL,
  shareRevision,
  socialPayload,
  workPresentation,
} from '../worker.js';

test('serves the reviewed AASA document with the required JSON content type', async () => {
  const reviewedDocument = JSON.parse(fs.readFileSync(
    new URL('../../link-site/.well-known/apple-app-site-association', import.meta.url),
    'utf8',
  ));
  const response = handleAssociationFile(new Request(
    'https://link.pythonide.xin/.well-known/apple-app-site-association',
  ));

  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /^application\/json\b/);
  assert.deepEqual(AASA_DOCUMENT, reviewedDocument);
  assert.deepEqual(await response.json(), reviewedDocument);
});

test('serves AASA HEAD requests without a response body', async () => {
  const response = handleAssociationFile(new Request(
    'https://link.pythonide.xin/.well-known/apple-app-site-association',
    { method: 'HEAD' },
  ));

  assert.equal(response.status, 200);
  assert.equal(await response.text(), '');
});

test('embeds safe first-paint work data into generated pages', () => {
  const template = '<script id="initial-script-data" type="application/json">{}</script>';
  const html = injectInitialScriptData(template, { script_id: 'scr_1', title: '$1</script><b>unsafe</b>' });
  assert.match(html, /"script_id":"scr_1"/);
  assert.match(html, /"title":"\$1\\u003c\/script>/);
  assert.doesNotMatch(html, /<b>unsafe<\/b>/);
  assert.match(html, /\\u003c\/script>/);
});

test('embeds typed Community data without allowing script-tag injection', () => {
  const template = '<script id="initial-community-data" type="application/json">{}</script>';
  const html = injectInitialCommunityData(template, 'profile', {
    id: 'usr2_1',
    name: '</script><b>unsafe</b>',
  });
  assert.match(html, /"type":"profile"/);
  assert.match(html, /"id":"usr2_1"/);
  assert.doesNotMatch(html, /<b>unsafe<\/b>/);
  assert.match(html, /\\u003c\/script>/);
});

const communityPost = {
  id: 'pst_123',
  title: '分享测试 <帖子>',
  body: '帖子正文与说明',
  category: 'all',
  author: { id: 'usr2_1', name: '创作者', handle: 'maker' },
  likeCount: 8,
  commentCount: 3,
  runCount: 2,
  viewCount: 21,
  createdAt: '2026-08-17T00:00:00Z',
  updatedAt: '2026-08-17T01:00:00Z',
};

const communityUser = {
  id: 'usr2_1',
  name: '创作者',
  handle: 'maker',
  bio: '分享 PythonIDE 作品',
  followerCount: 12,
  followingCount: 4,
  workCount: 7,
  isPro: true,
  updatedAt: '2026-08-17T01:00:00Z',
};

test('builds canonical Community post and stable user-ID profile metadata', () => {
  const postMeta = communityPostSocialPayload(communityPost, communityPost.id);
  assert.equal(postMeta.url, 'https://link.pythonide.xin/community/pst_123');
  assert.equal(postMeta.title, '分享测试 <帖子>');
  assert.match(postMeta.image, /\/og\/community\/post\/pst_123\.png\?v=/);
  assert.equal(postMeta.schemaType, 'SocialMediaPosting');

  const profileMeta = communityProfileSocialPayload(communityUser, communityUser.id);
  assert.equal(profileMeta.url, 'https://link.pythonide.xin/community/user/usr2_1');
  assert.equal(profileMeta.title, '创作者 (@maker)');
  assert.match(profileMeta.image, /\/og\/community\/user\/usr2_1\.png\?v=/);
  assert.equal(profileMeta.schemaType, 'Person');
});

test('accepts only canonical Community post and profile edge routes', () => {
  assert.deepEqual(
    communityRoute(new URL('https://link.pythonide.xin/community/pst_1?commentID=cmt_1&lang=en')),
    { type: 'community', identifier: 'pst_1' },
  );
  assert.deepEqual(
    communityRoute(new URL('https://link.pythonide.xin/community/user/usr2_1?lang=zh')),
    { type: 'profile', identifier: 'usr2_1' },
  );
  [
    '/community',
    '/community/',
    '/community/user',
    '/community/user/',
    '/community/user/usr2_1/',
    '/community/user/%2Fprivate',
    '/community/user/usr2_1?commentID=cmt_1',
    '/community/pst_1/',
    '/community/%2Fprivate',
    '/community/pst_1?commentID=',
    '/community/pst_1?lang=fr',
    '/community/pst_1?redirect=https%3A%2F%2Fevil.example',
  ].forEach((path) => {
    assert.equal(communityRoute(new URL(path, 'https://link.pythonide.xin')), null, path);
  });
});

test('server-renders Community post metadata and first-paint payload', async () => {
  const staticHTML = '<html><head><!-- edge:meta-start --><meta name="description" content="old"><!-- edge:meta-end --><title>Old</title><script id="initial-community-data" type="application/json">{}</script></head><body>Share page</body></html>';
  const fetcher = async (url) => {
    if (String(url).includes('/v2/community/posts/')) {
      return new Response(JSON.stringify({ data: communityPost }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    }
    return new Response(staticHTML, { status: 200, headers: { 'Content-Type': 'text/html' } });
  };
  const response = await handleCommunityPage(
    new Request('https://link.pythonide.xin/community/pst_123'),
    'community',
    'pst_123',
    { STATIC_INDEX_URL: 'https://static.example/index.html' },
    fetcher,
  );
  const html = await response.text();
  assert.equal(response.status, 200);
  assert.match(response.headers.get('content-type'), /text\/html/);
  assert.match(html, /分享测试 &lt;帖子&gt;/);
  assert.match(html, /"type":"community"/);
  assert.match(html, /"id":"pst_123"/);
  assert.match(html, /SocialMediaPosting/);
});

test('server-renders stable profile metadata and first-paint payload', async () => {
  const staticHTML = '<html><head><!-- edge:meta-start --><meta name="description" content="old"><!-- edge:meta-end --><title>Old</title><script id="initial-community-data" type="application/json">{}</script></head></html>';
  const fetcher = async (url) => {
    if (String(url).includes('/v2/community/users/')) {
      return new Response(JSON.stringify({ data: { user: communityUser } }), { status: 200 });
    }
    return new Response(staticHTML, { status: 200 });
  };
  const response = await handleCommunityPage(
    new Request('https://link.pythonide.xin/community/user/usr2_1'),
    'profile',
    'usr2_1',
    { STATIC_INDEX_URL: 'https://static.example/index.html' },
    fetcher,
  );
  const html = await response.text();
  assert.match(html, /property="og:type" content="profile"/);
  assert.match(html, /https:\/\/link\.pythonide\.xin\/community\/user\/usr2_1/);
  assert.match(html, /"type":"profile"/);
  assert.match(html, /"id":"usr2_1"/);
});

test('uses Pages assets for the share template and forwards static routes', async () => {
  const staticHTML = '<html><head><!-- edge:meta-start --><!-- edge:meta-end --><title>Old</title><script id="initial-community-data" type="application/json">{}</script></head></html>';
  const assetRequests = [];
  const env = {
    ASSETS: {
      async fetch(request) {
        assetRequests.push(new URL(request.url).pathname);
        if (new URL(request.url).pathname === '/') return new Response(staticHTML, { status: 200 });
        return new Response('static asset', { status: 200 });
      },
    },
  };
  const fetcher = async (url) => {
    if (String(url).includes('/v2/community/posts/')) {
      return new Response(JSON.stringify({ data: communityPost }), { status: 200 });
    }
    throw new Error(`Unexpected network request: ${url}`);
  };

  const dynamicResponse = await handleRequest(
    new Request('https://link.pythonide.xin/community/pst_123'),
    env,
    fetcher,
  );
  assert.equal(dynamicResponse.status, 200);
  assert.match(await dynamicResponse.text(), /"id":"pst_123"/);

  const staticResponse = await handleRequest(
    new Request('https://link.pythonide.xin/mcp-oauth/callback/'),
    env,
    fetcher,
  );
  assert.equal(await staticResponse.text(), 'static asset');
  assert.deepEqual(assetRequests, ['/', '/mcp-oauth/callback/']);
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

test('renders valid post and profile social cards without storing public records', async () => {
  for (const [type, value, identifier] of [
    ['community', communityPost, communityPost.id],
    ['profile', communityUser, communityUser.id],
  ]) {
    const bytes = await renderCommunityCard(type, value, identifier);
    assert.deepEqual(Array.from(bytes.slice(0, 8)), [137, 80, 78, 71, 13, 10, 26, 10]);
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    assert.equal(view.getUint32(16), 1200);
    assert.equal(view.getUint32(20), 630);
  }
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
