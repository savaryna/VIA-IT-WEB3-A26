# UNO server

From the repository root:

```sh
pnpm install
cp apps/server/.env.example apps/server/.env
# Fill BETTER_AUTH_SECRET with a secret from: openssl rand -base64 32
pnpm --filter @uno/server db:migrate
pnpm --filter @uno/server dev
```

`apps/server/.env` is required for server startup, auth generation, and database commands. Set every value from `.env.example`; there are no fallback settings. Use a random `BETTER_AUTH_SECRET` of at least 32 characters in every environment, including development. For production, set `NODE_ENV=production` and use the deployment’s public HTTPS URL and client origins. Relative `DATABASE_PATH` values resolve from `apps/server/`.
HTTP and WebSocket GraphQL share `/graphql`; Better Auth uses `/api/auth`.

For a tunnel to the Vite client, add its exact HTTPS origin to `CLIENT_ORIGINS` in `.env`, alongside localhost (for example, `CLIENT_ORIGINS=http://localhost:5173,https://your-tunnel.trycloudflare.com`). This list is shared by Better Auth, CORS, and the GraphQL WebSocket origin check. Restart the server after changing `.env`, and reconnect the client. Update the origin when the temporary tunnel URL changes. For other tunnel providers, add the hostname to `server.allowedHosts` in the [Vite config](../vue/vite.config.ts).

## Database changes

`src/db/schema/auth.ts` is generated from the Better Auth configuration; `src/db/schema/room.ts` is maintained by hand. After changing auth options or plugins, regenerate the auth schema before generating a migration. Keep the CLI version in `auth:generate` aligned with the installed Better Auth version.

```sh
pnpm --filter @uno/server auth:generate  # after changing auth configuration
pnpm --filter @uno/server db:generate   # after changing either schema
pnpm --filter @uno/server db:migrate
```

## Deployment

Run one server process: subscriptions are in memory. Put the client and server behind the same origin, proxying `/graphql` (including WebSocket upgrades) and `/api/auth`.

```sh
pnpm --filter @uno/server check
pnpm --filter @uno/server start
```
