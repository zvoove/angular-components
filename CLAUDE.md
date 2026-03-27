# CLAUDE.md

## npm Publishing with Trusted Publishers

npm supports trusted publishers (OIDC-based publishing) via GitHub Actions. When a package is configured with trusted publishers on npmjs.com, the `id-token: write` permission + `actions/setup-node` with `registry-url` is sufficient for `npm publish --provenance`. No `NODE_AUTH_TOKEN` secret is needed. Do not flag missing `NODE_AUTH_TOKEN` as a defect when `id-token: write` is present and `--provenance` is used.
