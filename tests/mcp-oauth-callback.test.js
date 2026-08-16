'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.resolve(__dirname, '../mcp-oauth/callback/index.html'),
  'utf8',
);

test('keeps the OAuth callback bridge exact and lossless', () => {
  assert.match(
    html,
    /const destination = `pythonide:\/\/mcp-oauth\/callback\$\{window\.location\.search\}`;/,
  );
  assert.match(html, /window\.location\.replace\(destination\)/);
  assert.doesNotMatch(html, /new URLSearchParams\(window\.location\.search\)/);
});

test('keeps the callback page isolated from external resources', () => {
  assert.match(html, /default-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.doesNotMatch(html, /<(?:script|link|img)\b[^>]+(?:src|href)=["']https?:/i);
  assert.doesNotMatch(html, /<(?:form|input|textarea)\b/i);
});

test('ships branded returning, fallback, and invalid-response states', () => {
  assert.match(html, /class="brand-mark"/);
  assert.match(html, /data-state="returning"/);
  assert.match(html, /body\.dataset\.state = 'fallback'/);
  assert.match(html, /body\.dataset\.state = 'error'/);
  assert.match(html, /id="status" role="status" aria-live="polite"/);
  assert.match(html, /prefers-reduced-motion: reduce/);
  assert.match(html, /navigator\.languages/);
});
