// Using native fetch API (Node.js 18+)

export interface GolfGeniusConfig {
  apiKey: string;
  baseUrl?: string;
}

export interface GolfGeniusSeason {
  id: string;
  name: string;
  current: boolean;
}

export interface GolfGeniusCategory {
  id: string;
  name: string;
  color: string;
  events: number;
  archived?: boolean;
}

export interface GolfGeniusPlayer {
  id: string;
  first_name: string;
  last_name: string;
  email?: string;
  handicap_index?: number;
  custom_fields?: Record<string, any>;
}

export interface GolfGeniusEvent {
  id: string;
  name: string;
  season?: GolfGeniusSeason;
  category?: GolfGeniusCategory;
  type: 'event' | 'league' | 'trip';
  registration_status: 'invitation_list' | 'open' | 'closed';
  start_date?: string;
  end_date?: string;
  archived?: boolean;
  external_id?: string;
}

export interface GolfGeniusEventRound {
  id: string;
  name: string;
  date: string;
  status: 'not started' | 'in progress' | 'completed';
  pairing_group_size: number;
  most_recent: boolean;
  handicap_updates_allowed: boolean;
  tee_sheet_released: boolean;
  mobile_score_entry_enabled: boolean;
  results_released: boolean;
  round_type: 'golf' | 'social';
  external_id?: string;
}

export interface GolfGeniusCourse {
  id: string;
  name: string;
  abbreviation?: string;
  tee_time_interval?: number;
  pace_of_play?: Record<string, any>;
  hole_labels?: string[];
  shotgun_priority?: number;
  default_tees?: Record<string, any>;
}

export interface GolfGeniusTee {
  id: string;
  name: string;
  abbreviation?: string;
  color?: string;
  slope?: number;
  rating?: number;
  hole_data?: Array<{
    hole: number;
    par: number;
    yardage: number;
    handicap: number;
  }>;
}

export interface GolfGeniusTournament {
  id: string;
  name: string;
  settings?: Record<string, any>;
}

export interface GolfGeniusScore {
  player_id: string;
  course_id?: string;
  tee_id?: string;
  scores: number[];
  total_score?: number;
  net_score?: number;
  handicap_used?: number;
  tee_time?: string;
  starting_hole?: number;
}

export interface GolfGeniusTournamentResult {
  player_id: string;
  position?: number;
  score?: number;
  points?: number;
  prize?: number;
  additional_data?: Record<string, any>;
}

export interface PaginatedResponse<T> {
  data: T[];
  page?: number;
  total_pages?: number;
  total_count?: number;
}

export class GolfGeniusApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message);
    this.name = 'GolfGeniusApiError';
  }
}

export class GolfGeniusApi {
  private config: GolfGeniusConfig;
  private baseUrl: string;

  constructor(config: GolfGeniusConfig) {
    this.config = config;
    this.baseUrl = config.baseUrl || 'https://www.golfgenius.com/api/v2';
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const headers = {
      'Authorization': `Bearer ${this.config.apiKey}`,
      'Content-Type': 'application/json',
      ...options.headers,
    };

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new GolfGeniusApiError(
          `API request failed: ${response.status} ${response.statusText}`,
          response.status,
          errorData
        );
      }

      const data = await response.json();
      return data as T;
    } catch (error) {
      if (error instanceof GolfGeniusApiError) {
        throw error;
      }
      throw new GolfGeniusApiError(
        `Request failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
        undefined,
        error
      );
    }
  }

  // Seasons API
  async getSeasons(): Promise<GolfGeniusSeason[]> {
    const response = await this.makeRequest<{ seasons: GolfGeniusSeason[] }>('/seasons');
    return response.seasons || [];
  }

  // Categories API
  async getCategories(): Promise<GolfGeniusCategory[]> {
    const response = await this.makeRequest<{ categories: GolfGeniusCategory[] }>('/categories');
    return response.categories || [];
  }

  // Players API (Master Roster)
  async getPlayers(page: number = 1): Promise<PaginatedResponse<GolfGeniusPlayer>> {
    const response = await this.makeRequest<{
      golfers: GolfGeniusPlayer[];
      page?: number;
      total_pages?: number;
      total_count?: number;
    }>(`/master_roster?page=${page}`);
    
    return {
      data: response.golfers || [],
      page: response.page,
      total_pages: response.total_pages,
      total_count: response.total_count,
    };
  }

  async getPlayer(playerId: string): Promise<GolfGeniusPlayer> {
    const response = await this.makeRequest<{ golfer: GolfGeniusPlayer }>(`/master_roster/${playerId}`);
    return response.golfer;
  }

  // Events API
  async getEvents(filters: {
    season_id?: string;
    category_id?: string;
    directory_id?: string;
    archived?: boolean;
    page?: number;
  } = {}): Promise<PaginatedResponse<GolfGeniusEvent>> {
    const queryParams = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined) {
        queryParams.append(key, value.toString());
      }
    });

    const queryString = queryParams.toString();
    const endpoint = `/events${queryString ? `?${queryString}` : ''}`;
    
    const response = await this.makeRequest<{
      events: GolfGeniusEvent[];
      page?: number;
      total_pages?: number;
      total_count?: number;
    }>(endpoint);
    
    return {
      data: response.events || [],
      page: response.page,
      total_pages: response.total_pages,
      total_count: response.total_count,
    };
  }

  // Event Roster API
  async getEventRoster(eventId: string, page: number = 1): Promise<PaginatedResponse<GolfGeniusPlayer>> {
    const response = await this.makeRequest<{
      golfers: GolfGeniusPlayer[];
      page?: number;
      total_pages?: number;
      total_count?: number;
    }>(`/events/${eventId}/roster?page=${page}`);
    
    return {
      data: response.golfers || [],
      page: response.page,
      total_pages: response.total_pages,
      total_count: response.total_count,
    };
  }

  // Event Rounds API
  async getEventRounds(eventId: string): Promise<GolfGeniusEventRound[]> {
    const response = await this.makeRequest<{ rounds: GolfGeniusEventRound[] }>(`/events/${eventId}/rounds`);
    return response.rounds || [];
  }

  // Event Courses and Tees API
  async getEventCoursesAndTees(eventId: string): Promise<{
    courses: GolfGeniusCourse[];
    tees: GolfGeniusTee[];
  }> {
    const response = await this.makeRequest<{
      courses: GolfGeniusCourse[];
      tees: GolfGeniusTee[];
    }>(`/events/${eventId}/courses_and_tees`);
    
    return {
      courses: response.courses || [],
      tees: response.tees || [],
    };
  }

  // Event Round Tournaments API
  async getEventRoundTournaments(eventId: string, roundId: string): Promise<GolfGeniusTournament[]> {
    const response = await this.makeRequest<{ tournaments: GolfGeniusTournament[] }>(
      `/events/${eventId}/rounds/${roundId}/tournaments`
    );
    return response.tournaments || [];
  }

  // Round Tee Sheet and Scores API
  async getRoundScores(eventId: string, roundId: string): Promise<GolfGeniusScore[]> {
    const response = await this.makeRequest<{ scores: GolfGeniusScore[] }>(
      `/events/${eventId}/rounds/${roundId}/tee_sheet_and_scores`
    );
    return response.scores || [];
  }

  // Tournament Results API
  async getTournamentResults(eventId: string, roundId: string, tournamentId: string): Promise<GolfGeniusTournamentResult[]> {
    const response = await this.makeRequest<{ results: GolfGeniusTournamentResult[] }>(
      `/events/${eventId}/rounds/${roundId}/tournaments/${tournamentId}/results`
    );
    return response.results || [];
  }

  // Player Events API
  async getPlayerEvents(playerId: string): Promise<GolfGeniusEvent[]> {
    const response = await this.makeRequest<{ events: GolfGeniusEvent[] }>(`/players/${playerId}/events`);
    return response.events || [];
  }

  // Utility method to fetch all pages of a paginated resource
  async getAllPages<T>(
    fetchFunction: (page: number) => Promise<PaginatedResponse<T>>,
    maxPages: number = 100
  ): Promise<T[]> {
    const allData: T[] = [];
    let page = 1;
    let hasMorePages = true;

    while (hasMorePages && page <= maxPages) {
      const response = await fetchFunction(page);
      allData.push(...response.data);

      if (response.total_pages && page >= response.total_pages) {
        hasMorePages = false;
      } else if (!response.data.length) {
        hasMorePages = false;
      } else {
        page++;
      }
    }

    return allData;
  }

  // Helper method to test API connectivity
  async testConnection(): Promise<boolean> {
    try {
      await this.getSeasons();
      return true;
    } catch (error) {
      console.error('Golf Genius API connection test failed:', error);
      return false;
    }
  }
}

// Factory function to create API instance
export function createGolfGeniusApi(apiKey: string): GolfGeniusApi {
  return new GolfGeniusApi({ apiKey });
}