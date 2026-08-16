# Python IDE link edge renderer

This worker adds server-rendered Open Graph metadata and dynamic PNG preview
cards to the existing `link.pythonide.xin` GitHub Pages site. It does not change
the community API and only intercepts the AASA endpoint, `/s/*`, and `/og/*`.

The AASA route serves the reviewed association document directly with an
`application/json` content type. Keep it semantically equivalent to
`../link-site/.well-known/apple-app-site-association`; the worker test enforces
that contract before deployment.

The worker fetches the published `index.html` from the `pythonide-link`
repository, reads public script details from the existing community API, and
replaces the `edge:meta` block before returning the page. Social crawlers such
as WeChat therefore receive the script title and description without executing
JavaScript.

Run `npm test` before deploying. Deploy with Wrangler after authenticating the
Cloudflare account that owns `pythonide.xin`.
