import { ClientConfig, ClientOptions } from './config';
import { throwForStatus } from './errors';
import { DashboardSummary, HealthResponse, PodcastLookup } from './types';

/**
 * Client for the podcaster portal REST API.
 *
 * Every method on the Python client (pg-podcaster-api-python) has a twin here
 * with the same name and shape.
 */
export class PgPodcasterClient {
  private readonly config: ClientConfig;

  constructor(options: ClientOptions) {
    this.config = new ClientConfig(options);
  }

  private async get<T>(path: string): Promise<T> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.timeoutMs);
    try {
      const response = await this.config.fetch(this.config.url(path), {
        method: 'GET',
        headers: this.config.headers(),
        signal: controller.signal,
      });
      const body = await response.text();
      throwForStatus(response.status, body);
      return JSON.parse(body) as T;
    } finally {
      clearTimeout(timer);
    }
  }

  /** GET /health: liveness check, no auth required. */
  health(): Promise<HealthResponse> {
    return this.get<HealthResponse>('health');
  }

  /** GET /dashboard: the signed-in podcaster's dashboard. */
  dashboard(): Promise<DashboardSummary> {
    return this.get<DashboardSummary>('dashboard');
  }

  /** Lookup by Apple podcast ID or canonical podcast ID. */
  podcast(id: string): Promise<PodcastLookup> {
    return this.get<PodcastLookup>(`podcasts/${encodeURIComponent(id)}`);
  }
}
