'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const html = fs.readFileSync(
  path.resolve(__dirname, '../ai-oauth/callback/index.html'),
  'utf8',
);
const client = JSON.parse(fs.readFileSync(
  path.resolve(__dirname, '../ai-oauth/client.json'),
  'utf8',
));

test('keeps the AI OAuth callback bridge exact and lossless', () => {
  assert.match(
    html,
    /const destination = `pythonide:\/\/oauth\/custom-ai\$\{window\.location\.search\}`;/,
  );
  assert.match(html, /window\.location\.replace\(destination\)/);
  assert.doesNotMatch(html, /new URLSearchParams\(window\.location\.search\)/);
});

test('keeps the callback isolated and free of credential inputs', () => {
  assert.match(html, /default-src 'none'/);
  assert.match(html, /form-action 'none'/);
  assert.match(html, /object-src 'none'/);
  assert.match(html, /name="referrer" content="no-referrer"/);
  assert.doesNotMatch(html, /<(?:script|link|img)\b[^>]+(?:src|href)=["']https?:/i);
  assert.doesNotMatch(html, /<(?:form|input|textarea)\b/i);
});

test('publishes matching client metadata', () => {
  assert.equal(client.client_id, 'https://link.pythonide.xin/ai-oauth/client.json');
  assert.deepEqual(client.redirect_uris, ['https://link.pythonide.xin/ai-oauth/callback']);
  assert.equal(client.token_endpoint_auth_method, 'none');
});
