# Python IDE link edge renderer

This worker adds server-rendered Open Graph metadata and dynamic PNG preview
cards to the existing `link.pythonide.xin` GitHub Pages site. It does not change
the community API and only intercepts the AASA endpoint, `/s/*`,
`/community/*`, and `/og/*`.

The same module also supports Cloudflare Pages advanced mode. When the Pages
`ASSETS` binding is present, it reads the share template from the local Pages
deployment and forwards all non-edge routes (including the public OAuth
metadata and callback pages) to the static asset service. This permits the
`link.pythonide.xin` subdomain to use an external-DNS CNAME without moving the
`pythonide.xin` nameservers.

Community V2 posts use `/community/{postID}`. Stable creator profiles use
`/community/user/{userID}` rather than mutable handles. Both routes fetch only
the corresponding public V2 representation at request time; no community
content or user record is committed to this repository.

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
