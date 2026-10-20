/**
 * Wire types for the podcaster portal REST API.
 *
 * These mirror pg-podcaster-models. All timestamps are unix epoch seconds.
 */

export interface HealthResponse {
  status: string;
}

export interface DashboardSummary {
  /** Unix timestamp (seconds) when the summary was generated. */
  generated_at: number;
  /** v1: always empty. Populated once stats are wired in. */
  podcasts: unknown[];
}

export interface PodcastInfo {
  id: string;
  name: string;
  artwork_url: string | null;
}

export type PodcastLookup =
  | { status: 'found'; podcast: PodcastInfo; retry_after: null }
  | { status: 'pending'; podcast: null; retry_after: number };
