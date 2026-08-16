'use strict';

const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const { pathToFileURL } = require('node:url');

const modulePromise = import(pathToFileURL(path.resolve(
  __dirname,
  '..',
  'scripts',
  'check-aasa-deployment.mjs'
)));
const localPath = path.resolve(
  __dirname,
  '..',
  '.well-known',
  'apple-app-site-association'
);

function response(body, {
  contentType = 'application/json',
  redirected = false,
  status = 200,
  url = 'https://example.test/aasa',
} = {}) {
  return {
    headers: { get: (name) => name.toLowerCase() === 'content-type' ? contentType : null },
    redirected,
    status,
    text: async () => body,
    url,
  };
}

test('AASA verifier requires /community/* and matches origin plus Apple CDN', async () => {
  const { checkAASADeployment, REQUIRED_COMMUNITY_PATH } = await modulePromise;
  const body = fs.readFileSync(localPath, 'utf8');
  const requested = [];
  const attestation = await checkAASADeployment({
    fetchImpl: async (url, options) => {
      requested.push({ url, options });
      return response(body, { url });
    },
    localPath,
    now: () => new Date('2026-08-12T00:00:00.000Z'),
  });

  assert.equal(attestation.requiredPath, REQUIRED_COMMUNITY_PATH);
  assert.equal(attestation.origin.semanticDigest, attestation.localSemanticDigest);
  assert.equal(attestation.appleCDN.semanticDigest, attestation.localSemanticDigest);
  assert.equal(attestation.verifiedAt, '2026-08-12T00:00:00.000Z');
  assert.equal(requested.length, 2);
  assert.ok(requested.every(({ options }) => options.redirect === 'manual'));
});

test('AASA verifier fails closed for a stale CDN or redirecting origin', async () => {
  const { checkAASADeployment } = await modulePromise;
  const body = fs.readFileSync(localPath, 'utf8');
  const stale = JSON.stringify({
    applinks: {
      details: [{ appIDs: ['8GYAXFCC2W.app.pythonide'], components: [{ '/': '/s/*' }] }],
    },
  });

  await assert.rejects(
    checkAASADeployment({
      fetchImpl: async (url) => response(url.includes('cdn-apple') ? stale : body, { url }),
      localPath,
    }),
    /does not register \/community\/\*/
  );
  await assert.rejects(
    checkAASADeployment({
      fetchImpl: async (url) => response(body, {
        redirected: !url.includes('cdn-apple'),
        url,
      }),
      localPath,
    }),
    /must not redirect/
  );
});

test('AASA verifier rejects a non-JSON response even when the body is JSON', async () => {
  const { checkAASADeployment } = await modulePromise;
  const body = fs.readFileSync(localPath, 'utf8');
  await assert.rejects(
    checkAASADeployment({
      fetchImpl: async (url) => response(body, {
        contentType: url.includes('cdn-apple') ? 'text/plain' : 'application/json',
        url,
      }),
      localPath,
    }),
    /must use application\/json/
  );
});
