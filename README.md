# PythonIDE Link Site

This directory is the static GitHub Pages origin for:

- `https://link.pythonide.xin/s/{scriptID}` community work shares
- `https://link.pythonide.xin/community/{postID}` Community V2 post and comment shares
- `https://link.pythonide.xin/community/user/{userID}` stable Community V2 creator profiles
- `https://link.pythonide.xin/l/{code}` reserved short links
- `https://link.pythonide.xin/import?url=...` remote import links
- `https://link.pythonide.xin/.well-known/apple-app-site-association` iOS Universal Links
- `https://link.pythonide.xin/mcp-oauth/client.json` MCP OAuth Client ID Metadata Document
- `https://link.pythonide.xin/mcp-oauth/callback` MCP OAuth HTTPS callback
- `https://link.pythonide.xin/ai-oauth/client.json` custom AI OAuth Client ID Metadata Document
- `https://link.pythonide.xin/ai-oauth/callback` custom AI OAuth HTTPS callback

## Repository and deployment

The canonical repository is
[`Python-IDE/pythonide-link`](https://github.com/Python-IDE/pythonide-link). GitHub
Pages deploys from the default branch root with the custom domain
`link.pythonide.xin` and enforced HTTPS.

The companion `../link-edge/` renderer server-renders per-script Open Graph
metadata and creates a 1200×630 PNG card from the restricted public Community
V2 work-share projection. The GitHub Actions workflow in `.github/workflows/`
runs this renderer on every source publish and every six hours, committing
generated `/s/*/` pages and `/og/*` cards to GitHub Pages. Dynamic edge
rendering remains immediate; the generated files are only a fallback for
crawlers such as WeChat that do not reliably execute page JavaScript. The six-
hour cadence avoids waking the Community database every five minutes.

To publish changes, copy the contents of this `link-site/` directory to that
repository root and verify the Pages deployment. The DNS record is:

```text
Type: CNAME
Host: link
Value: Python-IDE.github.io
TTL: 10 minutes
```

Do not change the root `@` or `www` records used by the main website. Do not
recreate a repository named `pythonide-link` under the previous owner because
that would break GitHub's repository-transfer redirects.

The publish script copies `../link-edge/` into the link repository as `edge/`
so the workflow and renderer always use the same tested implementation. Both
the browser fallback and edge renderer use `community-api.pythonide.xin` V2;
they must never restore a direct `fcapp.run` or `/v1/scripts` dependency.

Before either deployment, run:

```bash
node --test \
  link-site/tests/share-page.test.js \
  link-site/tests/aasa-deployment.test.js \
  link-edge/tests/worker.test.js
```

## iOS Requirement

The app entitlements must include:

```text
applinks:link.pythonide.xin
webcredentials:link.pythonide.xin
```

The AASA file registers `/s/*`, `/community/*`, and `/import`. The
`/community/*` contract includes both posts and stable user-ID profile links.
Keep `/l/*` out of AASA until the short-link resolver backend is connected, so
unfinished short links still open the web fallback instead of launching the app
with no resolved target.

The AASA file must be reachable without redirects:

```text
https://link.pythonide.xin/.well-known/apple-app-site-association
```

The local check is network-free by default:

```bash
node link-site/scripts/check-aasa-deployment.mjs --plan
```

After Pages has deployed, create the production release attestation with an explicit live opt-in:

```bash
node link-site/scripts/check-aasa-deployment.mjs \
  --verify-live \
  --environment production \
  --confirm-domain link.pythonide.xin \
  --output /controlled-temporary-directory/aasa-attestation.json
```

The verifier requests both the no-redirect origin URL and Apple's AASA CDN, requires HTTP 200 with `application/json`, validates the app ID plus `/community/*`, and compares their semantic JSON digests with the reviewed local file. The output contains only URLs, status/content-type, timestamps, and digests. It never contains credentials. Community's production release gate rejects missing or older-than-24-hour attestations.

## MCP OAuth

The app and hosted files share one callback contract:

```text
Client ID:    https://link.pythonide.xin/mcp-oauth/client.json
Redirect URI: https://link.pythonide.xin/mcp-oauth/callback
```

iOS 17.4 and later match the HTTPS callback directly through
`ASWebAuthenticationSession.Callback.https(host:path:)`. On iOS 16.2–17.3,
the callback page forwards the OAuth query to the app-owned
`pythonide://mcp-oauth/callback` compatibility URL. The app converts it back to
the canonical HTTPS URL before the official MCP SDK validates state and PKCE.

Both MCP OAuth files and the AASA file must be deployed together. Do not add
the OAuth callback path to `applinks`; the compatibility page must remain
loadable on iOS versions earlier than 17.4.

## Custom AI OAuth

Custom AI connections use a separate callback and credential namespace:

```text
Client ID:    https://link.pythonide.xin/ai-oauth/client.json
Redirect URI: https://link.pythonide.xin/ai-oauth/callback
```

On iOS 16.2–17.3, the callback page forwards the query losslessly to
`pythonide://oauth/custom-ai`. Keep the AI and MCP paths separate even though
they intentionally share the same visual treatment.
