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
