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
  /** Optional additive public catalog/OP3 summary; absent on older servers. */
  overview?: PodcastOverview | null;
}

export type PodcastLookup =
  | { status: 'found'; podcast: PodcastInfo; retry_after: null }
  | { status: 'pending'; podcast: null; retry_after: number };

export interface PodcastOverview {
  catalog: {
    episode_count: number | null;
    feed_checked_at: number | null;
    episodes_status: 'ready' | 'pending' | 'unavailable';
    latest_episode: { title: string; published_at: number | null; duration_seconds: number | null } | null;
  };
  op3: {
    status: 'ready' | 'partial' | 'not_tracked' | 'not_configured' | 'unavailable';
    stats_url?: string;
    retrieved_at?: number;
    as_of?: number | null;
    monthly_downloads?: number | null;
    weekly_average?: number | null;
    complete_weeks?: number | null;
    weekly_downloads?: (number | null)[] | null;
    apps?: { name: string; downloads: number }[] | null;
    episodes?: { title: string; published_at: number | null; downloads_7: number | null; downloads_30: number | null; downloads_all: number | null }[] | null;
  };
}
