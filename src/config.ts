import { PgPodcasterConfigError } from './errors';

export const DEFAULT_TIMEOUT_MS = 30_000;

/** Minimal fetch signature so callers can inject their own (tests, Next.js). */
export type FetchLike = (input: string, init?: RequestInit) => Promise<Response>;

export interface ClientOptions {
  /** API root without trailing slash, e.g. https://podcaster.podcastguru.io/api/v1 */
  baseUrl: string;
  /** Sent as a bearer token. Optional for unauthenticated endpoints such as health. */
  apiKey?: string;
  /** Per-request timeout. Default 30s. */
  timeoutMs?: number;
  /** Override fetch (defaults to globalThis.fetch). */
  fetch?: FetchLike;
}

/**
 * Browsers require fetch to be invoked with the global object as `this`;
 * calling a stored reference as `config.fetch(...)` throws "Illegal invocation".
 * Wrapping it in an arrow keeps the default fetch bound correctly everywhere.
 */
function defaultFetch(): FetchLike | undefined {
  if (typeof globalThis.fetch !== 'function') {
    return undefined;
  }
  return (input: string, init?: RequestInit): Promise<Response> => globalThis.fetch(input, init);
}

/** Normalised, validated client configuration. */
export class ClientConfig {
  readonly baseUrl: string;
  readonly apiKey?: string;
  readonly timeoutMs: number;
  readonly fetch: FetchLike;

  constructor(options: ClientOptions) {
    if (!options.baseUrl) {
      throw new PgPodcasterConfigError('baseUrl is required');
    }
    const fetchImpl = options.fetch ?? defaultFetch();
    if (!fetchImpl) {
      throw new PgPodcasterConfigError('No fetch implementation available; pass options.fetch');
    }
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.apiKey = options.apiKey;
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.fetch = fetchImpl;
  }

  headers(): Record<string, string> {
    const headers: Record<string, string> = { Accept: 'application/json' };
    if (this.apiKey) {
      headers.Authorization = `Bearer ${this.apiKey}`;
    }
    return headers;
  }

  url(path: string): string {
    return `${this.baseUrl}/${path.replace(/^\/+/, '')}`;
  }
}
