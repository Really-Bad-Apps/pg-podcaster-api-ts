import assert from 'node:assert/strict';
import { test } from 'node:test';

import {
  ClientConfig,
  PgPodcasterApiError,
  PgPodcasterAuthError,
  PgPodcasterClient,
  PgPodcasterConfigError,
  PgPodcasterNotFoundError,
  throwForStatus,
} from '../dist/index.js';

function fakeFetch(status, body, onCall) {
  return async (url, init) => {
    if (onCall) onCall(url, init);
    return new Response(body, { status, headers: { 'Content-Type': 'application/json' } });
  };
}

test('config strips trailing slash, builds urls and bearer header', () => {
  const config = new ClientConfig({ baseUrl: 'https://example.test/api/v1/', apiKey: 'abc', fetch: fakeFetch(200, '{}') });
  assert.equal(config.url('/health'), 'https://example.test/api/v1/health');
  assert.equal(config.headers().Authorization, 'Bearer abc');
});

test('config requires baseUrl', () => {
  assert.throws(() => new ClientConfig({ baseUrl: '' }), PgPodcasterConfigError);
});

test('throwForStatus maps codes', () => {
  assert.doesNotThrow(() => throwForStatus(200, ''));
  assert.throws(() => throwForStatus(401, ''), PgPodcasterAuthError);
  assert.throws(() => throwForStatus(404, ''), PgPodcasterNotFoundError);
  assert.throws(() => throwForStatus(500, ''), PgPodcasterApiError);
});

test('health() hits /health with headers and parses JSON', async () => {
  let seen;
  const client = new PgPodcasterClient({
    baseUrl: 'https://example.test/api/v1',
    apiKey: 'k',
    fetch: fakeFetch(200, '{"status":"ok"}', (url, init) => { seen = { url, init }; }),
  });
  const result = await client.health();
  assert.deepEqual(result, { status: 'ok' });
  assert.equal(seen.url, 'https://example.test/api/v1/health');
  assert.equal(seen.init.headers.Authorization, 'Bearer k');
});

test('dashboard() surfaces API errors', async () => {
  const client = new PgPodcasterClient({ baseUrl: 'https://example.test/api/v1', fetch: fakeFetch(401, '{}') });
  await assert.rejects(client.dashboard(), PgPodcasterAuthError);
});

test('default fetch is never invoked with the config as `this` (browser Illegal invocation)', async () => {
  const realFetch = globalThis.fetch;
  let seenThis = 'unset';
  globalThis.fetch = function patched() { seenThis = this; return Promise.resolve(new Response('{"status":"ok"}', { status: 200 })); };
  try {
    const client = new PgPodcasterClient({ baseUrl: 'https://example.test/api/v1' });
    await client.health();
  } finally {
    globalThis.fetch = realFetch;
  }
  assert.ok(seenThis === undefined || seenThis === globalThis, 'fetch must be called unbound or on globalThis');
});

test('podcast() encodes IDs, sends bearer, and preserves pending responses', async () => {
  let seen;
  const body = { status: 'pending', podcast: null, retry_after: 3 };
  const client = new PgPodcasterClient({
    baseUrl: 'https://example.test/api/v1', apiKey: 'caller',
    fetch: fakeFetch(202, JSON.stringify(body), (url, init) => { seen = { url, init }; }),
  });
  assert.deepEqual(await client.podcast('123/?'), body);
  assert.equal(seen.url, 'https://example.test/api/v1/podcasts/123%2F%3F');
  assert.equal(seen.init.headers.Authorization, 'Bearer caller');
});

test('podcast preserves additive overview fields and unavailable counts', async () => {
  const body = { status: 'found', podcast: { id: '123', name: 'Example', artwork_url: null,
    overview: { catalog: { episode_count: 0 }, op3: { status: 'partial', monthly_downloads: null } } }, retry_after: null };
  const client = new PgPodcasterClient({ baseUrl: 'https://example.test/api/v1', fetch: fakeFetch(200, JSON.stringify(body)) });
  assert.deepEqual(await client.podcast('123'), body);
});
