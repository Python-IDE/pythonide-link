# PythonIDE Link Site

This directory is a zero-cost GitHub Pages site for:

- `https://link.pythonide.xin/s/{scriptID}` community work shares
- `https://link.pythonide.xin/l/{code}` reserved short links
- `https://link.pythonide.xin/import?url=...` remote import links
- `https://link.pythonide.xin/.well-known/apple-app-site-association` iOS Universal Links

## GitHub Pages Setup

1. Create a new public GitHub repository, for example `pythonide-link`.
2. Copy the contents of this `link-site/` directory to the repository root.
3. In GitHub repository settings, enable Pages from the default branch root.
4. Set the custom domain to `link.pythonide.xin`.
5. Enable **Enforce HTTPS** after GitHub issues the certificate.
6. In the DNS provider for `pythonide.xin`, add:

```text
Type: CNAME
Host: link
Value: <your-github-username>.github.io
TTL: 10 minutes
```

Do not change the root `@` or `www` records used by the main website.

## iOS Requirement

The app entitlements must include:

```text
applinks:link.pythonide.xin
```

The AASA file currently registers `/s/*` and `/import`. Keep `/l/*` out of AASA until the short-link resolver backend is connected, so unfinished short links still open the web fallback instead of launching the app with no resolved target.

The AASA file must be reachable without redirects:

```text
https://link.pythonide.xin/.well-known/apple-app-site-association
```
