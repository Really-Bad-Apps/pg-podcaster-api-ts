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
