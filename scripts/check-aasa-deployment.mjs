#!/usr/bin/env node

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const AASA_ATTESTATION_FORMAT = 'pythonide-aasa-deployment-attestation-v1';
export const DEFAULT_DOMAIN = 'link.pythonide.xin';
export const DEFAULT_APP_ID = '8GYAXFCC2W.app.pythonide';
export const REQUIRED_COMMUNITY_PATH = '/community/*';

function stableValue(value) {
  if (Array.isArray(value)) return value.map(stableValue);
  if (value && typeof value === 'object') {
    const result = {};
    for (const key of Object.keys(value).sort()) result[key] = stableValue(value[key]);
    return result;
  }
  return value;
}

export function semanticDigest(document) {
  return crypto.createHash('sha256').update(JSON.stringify(stableValue(document))).digest('hex');
}

function parseDocument(text, label) {
  if (Buffer.byteLength(text, 'utf8') > 128 * 1024) {
    throw new Error(`${label} exceeds the 128 KiB AASA limit`);
  }
  try {
    const value = JSON.parse(text);
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('not an object');
    return value;
  } catch (error) {
    throw new Error(`${label} is not valid AASA JSON: ${error.message}`);
  }
}

export function validateAASADocument(
  document,
  { expectedAppID = DEFAULT_APP_ID, requiredPath = REQUIRED_COMMUNITY_PATH } = {}
) {
  const details = document?.applinks?.details;
  if (!Array.isArray(details)) throw new Error('AASA applinks.details must be an array');
  const matchingDetails = details.filter((detail) => (
    Array.isArray(detail?.appIDs) && detail.appIDs.includes(expectedAppID)
  ));
  if (matchingDetails.length === 0) throw new Error(`AASA does not register app ID ${expectedAppID}`);
  const hasRequiredPath = matchingDetails.some((detail) => (
    Array.isArray(detail.components)
    && detail.components.some((component) => component?.['/'] === requiredPath)
  ));
  if (!hasRequiredPath) throw new Error(`AASA does not register ${requiredPath}`);
  return Object.freeze({
    appID: expectedAppID,
    requiredPath,
    semanticDigest: semanticDigest(document),
  });
}

function normalizedContentType(headers) {
  const value = headers && typeof headers.get === 'function'
    ? headers.get('content-type')
    : headers?.['content-type'] || headers?.['Content-Type'];
  return String(value || '').toLowerCase();
}

async function inspectResponse(response, label, expected) {
  const status = Number(response?.status || 0);
  if (status !== 200) throw new Error(`${label} returned HTTP ${status || 'unknown'}`);
  if (response.redirected === true) throw new Error(`${label} must not redirect`);
  const contentType = normalizedContentType(response.headers);
  if (!/^application\/json(?:\s*;|$)/.test(contentType)) {
    throw new Error(`${label} must use application/json, received ${contentType || 'missing'}`);
  }
  const text = await response.text();
  const document = parseDocument(text, label);
  const validation = validateAASADocument(document, expected);
  return Object.freeze({
    contentType,
    redirected: false,
    semanticDigest: validation.semanticDigest,
    status,
    url: String(response.url || ''),
  });
}

export async function checkAASADeployment({
  domain = DEFAULT_DOMAIN,
  expectedAppID = DEFAULT_APP_ID,
  fetchImpl = globalThis.fetch,
  localPath,
  now = () => new Date(),
  requiredPath = REQUIRED_COMMUNITY_PATH,
} = {}) {
  if (typeof fetchImpl !== 'function') throw new Error('fetch implementation is required');
  if (!/^(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(domain)) {
    throw new Error('AASA domain is invalid');
  }
  const resolvedLocalPath = path.resolve(localPath || path.join(
    path.dirname(fileURLToPath(import.meta.url)),
    '..',
    '.well-known',
    'apple-app-site-association'
  ));
  const localDocument = parseDocument(fs.readFileSync(resolvedLocalPath, 'utf8'), 'local AASA');
  const expected = { expectedAppID, requiredPath };
  const local = validateAASADocument(localDocument, expected);
  const originURL = `https://${domain}/.well-known/apple-app-site-association`;
  const appleCDNURL = `https://app-site-association.cdn-apple.com/a/v1/${domain}`;
  const request = (url) => fetchImpl(url, {
    headers: { accept: 'application/json' },
    redirect: 'manual',
  });
  const [origin, appleCDN] = await Promise.all([
    request(originURL).then((response) => inspectResponse(response, 'AASA origin', expected)),
    request(appleCDNURL).then((response) => inspectResponse(response, 'Apple AASA CDN', expected)),
  ]);
  if (origin.semanticDigest !== local.semanticDigest) {
    throw new Error('AASA origin does not match the reviewed local document');
  }
  if (appleCDN.semanticDigest !== local.semanticDigest) {
    throw new Error('Apple AASA CDN does not match the reviewed local document');
  }
  return Object.freeze({
    appleCDN,
    appleCDNURL,
    appID: expectedAppID,
    domain,
    format: AASA_ATTESTATION_FORMAT,
    localSemanticDigest: local.semanticDigest,
    origin,
    originURL,
    requiredPath,
    verifiedAt: now().toISOString(),
  });
}

function parseArguments(argv) {
  const result = { mode: 'plan' };
  for (let index = 0; index < argv.length; index += 1) {
    const argument = argv[index];
    if (argument === '--help' || argument === '-h') result.help = true;
    else if (argument === '--plan') result.mode = 'plan';
    else if (argument === '--verify-live') result.mode = 'verify-live';
    else if (['--environment', '--confirm-domain', '--domain', '--app-id', '--output', '--local'].includes(argument)) {
      const value = argv[index + 1];
      if (!value || value.startsWith('--')) throw new Error(`${argument} requires a value`);
      result[argument.slice(2).replace(/-([a-z])/g, (_, value) => value.toUpperCase())] = value;
      index += 1;
    } else throw new Error(`unknown argument: ${argument}`);
  }
  return result;
}

async function main(argv = process.argv.slice(2), logger = console) {
  const args = parseArguments(argv);
  if (args.help) {
    logger.log('Usage: node link-site/scripts/check-aasa-deployment.mjs [--plan] | --verify-live --environment production --confirm-domain link.pythonide.xin [--output attestation.json]');
    return null;
  }
  const domain = args.domain || DEFAULT_DOMAIN;
  const localPath = args.local;
  const localDocument = parseDocument(fs.readFileSync(path.resolve(localPath || path.join(
    path.dirname(fileURLToPath(import.meta.url)), '..', '.well-known', 'apple-app-site-association'
  )), 'utf8'), 'local AASA');
  const local = validateAASADocument(localDocument, {
    expectedAppID: args.appId || DEFAULT_APP_ID,
  });
  if (args.mode === 'plan') {
    logger.log('[aasa:check] plan only; no network request was sent');
    logger.log(`[aasa:check] domain: ${domain}`);
    logger.log(`[aasa:check] local semantic digest: ${local.semanticDigest}`);
    logger.log(`[aasa:check] origin: https://${domain}/.well-known/apple-app-site-association`);
    logger.log(`[aasa:check] Apple CDN: https://app-site-association.cdn-apple.com/a/v1/${domain}`);
    return Object.freeze({ mode: 'plan', domain, localSemanticDigest: local.semanticDigest });
  }
  if (args.environment !== 'production' || args.confirmDomain !== domain) {
    throw new Error('--verify-live requires --environment production and an exact --confirm-domain');
  }
  const attestation = await checkAASADeployment({
    domain,
    expectedAppID: args.appId || DEFAULT_APP_ID,
    localPath,
  });
  if (args.output) {
    fs.writeFileSync(path.resolve(args.output), `${JSON.stringify(attestation, null, 2)}\n`, {
      encoding: 'utf8', mode: 0o600, flag: 'wx',
    });
    logger.log(`[aasa:check] wrote sanitized attestation: ${path.resolve(args.output)}`);
  }
  logger.log(`[aasa:check] verified origin and Apple CDN for ${domain}`);
  logger.log(`[aasa:check] semantic digest: ${attestation.localSemanticDigest}`);
  return attestation;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch((error) => {
    console.error(`[aasa:check] ${error.message}`);
    process.exitCode = 1;
  });
}

export { main, parseArguments };
