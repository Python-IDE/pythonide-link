# PythonIDE Link Site

This directory is the static GitHub Pages origin for:

- `https://link.pythonide.xin/s/{scriptID}` community work shares
- `https://link.pythonide.xin/l/{code}` reserved short links
- `https://link.pythonide.xin/import?url=...` remote import links
- `https://link.pythonide.xin/.well-known/apple-app-site-association` iOS Universal Links
- `https://link.pythonide.xin/mcp-oauth/client.json` MCP OAuth Client ID Metadata Document
- `https://link.pythonide.xin/mcp-oauth/callback` MCP OAuth HTTPS callback

## Repository and deployment

The canonical repository is
[`Python-IDE/pythonide-link`](https://github.com/Python-IDE/pythonide-link). GitHub
Pages deploys from the default branch root with the custom domain
`link.pythonide.xin` and enforced HTTPS.

The companion `../link-edge/` Cloudflare Worker intercepts only `/s/*` and
`/og/*`. It server-renders per-script Open Graph metadata for crawlers and
creates a 1200×630 PNG card from the existing public community API. All other
routes, including AASA and MCP OAuth, continue to come directly from GitHub
Pages. This split is required because GitHub Pages cannot generate a different
HTML `<head>` for each script and WeChat does not reliably execute page
JavaScript when building a link preview.

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

After publishing the static site, deploy `../link-edge/worker.js` with the
routes declared in `../link-edge/wrangler.jsonc`. The Cloudflare zone must keep
the `link` record proxied for Worker routes to run. The Worker does not replace
or proxy the AASA and OAuth paths.

Before either deployment, run:

```bash
node --test link-site/tests/share-page.test.js link-edge/tests/worker.test.js
```

## iOS Requirement

The app entitlements must include:

```text
applinks:link.pythonide.xin
webcredentials:link.pythonide.xin
```

The AASA file currently registers `/s/*` and `/import`. Keep `/l/*` out of AASA until the short-link resolver backend is connected, so unfinished short links still open the web fallback instead of launching the app with no resolved target.

The AASA file must be reachable without redirects:

```text
https://link.pythonide.xin/.well-known/apple-app-site-association
```

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
