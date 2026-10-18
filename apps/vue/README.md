# Vue app

Start the [server](../server/README.md), then run from the repository root:

```sh
pnpm install
pnpm --filter @uno/vue dev
```

Vite proxies `/graphql` (HTTP/WebSocket) and `/api/auth` to `localhost:3000`. Set `VITE_SERVER_URL` to override the server origin.

To build and preview:

```sh
pnpm --filter @uno/vue build
pnpm --filter @uno/vue preview
```

Production hosting must serve `index.html` for SPA routes and proxy the server endpoints as described in the [server deployment instructions](../server/README.md#deployment).
