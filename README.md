# @really-bad-apps/pg-podcaster-api

TypeScript client for the Podcast Guru podcaster portal REST API
(podcaster.podcastguru.io). Fetch-based, so it runs unchanged in browsers,
Next.js (server and client), and Node 20+.

## Installation

Always from GitHub, pinned to a commit:

```json
"@really-bad-apps/pg-podcaster-api": "github:Really-Bad-Apps/pg-podcaster-api-ts#<sha>"
```

`dist/` is not committed; the `prepare` script builds it on install.

## Usage

```ts
import { PgPodcasterClient, PgPodcasterAuthError } from '@really-bad-apps/pg-podcaster-api';

const client = new PgPodcasterClient({
  baseUrl: 'https://podcaster.podcastguru.io/api/v1',
  apiKey: process.env.PG_PODCASTER_API_KEY,
});

await client.health();      // { status: 'ok' }
await client.dashboard();   // { generated_at: 1760000000, podcasts: [] }
```

Errors extend `PgPodcasterError`; HTTP failures carry `statusCode` and `body`.
Pass `fetch` in the options to inject a custom implementation (tests, Next.js caching).

## Development

```bash
npm install
npm test        # builds, then runs node --test against dist/
```

## Conventions

- Every method mirrors the Python client (`pg-podcaster-api-python`) by name and shape.
- Wire types in `src/types.ts` mirror `pg-podcaster-models`; timestamps are unix seconds.
- No runtime dependencies.

## License

MIT
