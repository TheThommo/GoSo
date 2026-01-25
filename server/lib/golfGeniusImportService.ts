import { 
  GolfGeniusApi, 
  createGolfGeniusApi,
  type GolfGeniusSeason,
  type GolfGeniusCategory,
  type GolfGeniusPlayer,
  type GolfGeniusEvent,
  type GolfGeniusEventRound,
  type GolfGeniusCourse,
  type GolfGeniusTee,
  type GolfGeniusTournament,
  type GolfGeniusScore,
  type GolfGeniusTournamentResult,
  GolfGeniusApiError,
} from './golfGeniusApi';
import type { IStorage } from '../storage';

export interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

export interface ImportOptions {
  forceUpdate?: boolean;
  maxRetries?: number;
  batchSize?: number;
}

export class GolfGeniusImportService {
  private api: GolfGeniusApi;
  private storage: IStorage;

  constructor(apiKey: string, storage: IStorage) {
    this.api = createGolfGeniusApi(apiKey);
    this.storage = storage;
  }

  private async createImportLog(
    importType: string,
    requestedBy?: string,
    isAutoImport: boolean = false
  ): Promise<string> {
    return await this.storage.createGolfGeniusImportLog({
      importType,
      status: 'running',
      requestedBy,
      isAutoImport,
      recordsProcessed: 0,
      recordsSuccessful: 0,
      recordsFailed: 0,
    });
  }

  private async updateImportLog(
    logId: string,
    updates: {
      status?: 'completed' | 'failed';
      recordsProcessed?: number;
      recordsSuccessful?: number;
      recordsFailed?: number;
      errorMessage?: string;
      errorDetails?: any;
    }
  ): Promise<void> {
    await this.storage.updateGolfGeniusImportLog(logId, updates);
  }

  async testConnection(): Promise<boolean> {
    try {
      return await this.api.testConnection();
    } catch (error) {
      console.error('Golf Genius API connection test failed:', error);
      return false;
    }
  }

  /**
   * Import all players from Golf Genius master roster
   */
  async importPlayers(
    requestedBy?: string,
    options: ImportOptions = {}
  ): Promise<ImportProgress> {
    const logId = await this.createImportLog('players', requestedBy);
    const progress: ImportProgress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log('Starting Golf Genius players import...');

      // Get all players from Golf Genius API
      const players = await this.api.getPlayers();
      progress.total = players.length;

      console.log(`Found ${players.length} players to import`);

      for (const golfGeniusPlayer of players) {
        try {
          // Convert Golf Genius player to our format
          await this.storage.upsertGolfGeniusPlayer({
            golfGeniusId: golfGeniusPlayer.id,
            firstName: golfGeniusPlayer.firstName,
            lastName: golfGeniusPlayer.lastName,
            email: golfGeniusPlayer.email,
            phone: golfGeniusPlayer.phone,
            status: golfGeniusPlayer.status,
            handicap: golfGeniusPlayer.handicap,
            ghin: golfGeniusPlayer.ghin,
            membershipType: golfGeniusPlayer.membershipType,
            registrationDate: golfGeniusPlayer.registrationDate ? new Date(golfGeniusPlayer.registrationDate) : null,
          });

          progress.successful++;
        } catch (error) {
          progress.failed++;
          const errorMsg = `Failed to import player ${golfGeniusPlayer.firstName} ${golfGeniusPlayer.lastName}: ${error}`;
          progress.errors.push(errorMsg);
          console.error(errorMsg);
        }

        progress.processed++;
      }

      await this.updateImportLog(logId, {
        status: 'completed',
        recordsProcessed: progress.processed,
        recordsSuccessful: progress.successful,
        recordsFailed: progress.failed,
      });

      console.log(`Players import completed: ${progress.successful} successful, ${progress.failed} failed`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      progress.errors.push(errorMessage);
      
      await this.updateImportLog(logId, {
        status: 'failed',
        errorMessage,
        errorDetails: error,
      });

      console.error('Players import failed:', error);
    }

    return progress;
  }

  /**
   * Import events from Golf Genius
   */
  async importEvents(
    requestedBy?: string,
    options: ImportOptions = {}
  ): Promise<ImportProgress> {
    const logId = await this.createImportLog('events', requestedBy);
    const progress: ImportProgress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log('Starting Golf Genius events import...');

      // Get all events from Golf Genius API
      const events = await this.api.getEvents();
      progress.total = events.length;

      console.log(`Found ${events.length} events to import`);

      for (const golfGeniusEvent of events) {
        try {
          // Convert Golf Genius event to our format
          await this.storage.upsertGolfGeniusEvent({
            golfGeniusId: golfGeniusEvent.id,
            name: golfGeniusEvent.name,
            description: golfGeniusEvent.description,
            startDate: new Date(golfGeniusEvent.startDate),
            endDate: new Date(golfGeniusEvent.endDate),
            eventType: golfGeniusEvent.eventType,
            courseId: golfGeniusEvent.courseId,
            status: golfGeniusEvent.status,
            maxParticipants: golfGeniusEvent.maxParticipants,
            registrationDeadline: golfGeniusEvent.registrationDeadline ? new Date(golfGeniusEvent.registrationDeadline) : null,
            cost: golfGeniusEvent.cost,
          });

          progress.successful++;
        } catch (error) {
          progress.failed++;
          const errorMsg = `Failed to import event ${golfGeniusEvent.name}: ${error}`;
          progress.errors.push(errorMsg);
          console.error(errorMsg);
        }

        progress.processed++;
      }

      await this.updateImportLog(logId, {
        status: 'completed',
        recordsProcessed: progress.processed,
        recordsSuccessful: progress.successful,
        recordsFailed: progress.failed,
      });

      console.log(`Events import completed: ${progress.successful} successful, ${progress.failed} failed`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      progress.errors.push(errorMessage);
      
      await this.updateImportLog(logId, {
        status: 'failed',
        errorMessage,
        errorDetails: error,
      });

      console.error('Events import failed:', error);
    }

    return progress;
  }

  /**
   * Import scores for a specific event
   */
  async importEventScores(
    eventId: string,
    requestedBy?: string,
    options: ImportOptions = {}
  ): Promise<ImportProgress> {
    const logId = await this.createImportLog(`scores_${eventId}`, requestedBy);
    const progress: ImportProgress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log(`Starting Golf Genius scores import for event ${eventId}...`);

      // Get all scores for the event from Golf Genius API
      const scores = await this.api.getEventScores(eventId);
      progress.total = scores.length;

      console.log(`Found ${scores.length} scores to import for event ${eventId}`);

      for (const golfGeniusScore of scores) {
        try {
          // Convert Golf Genius score to our format
          await this.storage.upsertGolfGeniusScore({
            eventId: golfGeniusScore.eventId,
            playerId: golfGeniusScore.playerId,
            roundNumber: golfGeniusScore.roundNumber,
            hole: golfGeniusScore.hole,
            strokes: golfGeniusScore.strokes,
            putts: golfGeniusScore.putts,
            fairwayHit: golfGeniusScore.fairwayHit,
            greenInRegulation: golfGeniusScore.greenInRegulation,
            sandSave: golfGeniusScore.sandSave,
            upAndDown: golfGeniusScore.upAndDown,
            penalty: golfGeniusScore.penalty,
          });

          progress.successful++;
        } catch (error) {
          progress.failed++;
          const errorMsg = `Failed to import score for player ${golfGeniusScore.playerId}, hole ${golfGeniusScore.hole}: ${error}`;
          progress.errors.push(errorMsg);
          console.error(errorMsg);
        }

        progress.processed++;
      }

      await this.updateImportLog(logId, {
        status: 'completed',
        recordsProcessed: progress.processed,
        recordsSuccessful: progress.successful,
        recordsFailed: progress.failed,
      });

      console.log(`Event scores import completed: ${progress.successful} successful, ${progress.failed} failed`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      progress.errors.push(errorMessage);
      
      await this.updateImportLog(logId, {
        status: 'failed',
        errorMessage,
        errorDetails: error,
      });

      console.error('Event scores import failed:', error);
    }

    return progress;
  }

  /**
   * Import recent events and their scores (for auto-import)
   */
  async importRecentEventsWithScores(
    daysBack: number = 30,
    isAutoImport: boolean = true
  ): Promise<ImportProgress> {
    const logId = await this.createImportLog('auto_import_recent', undefined, isAutoImport);
    const progress: ImportProgress = {
      total: 0,
      processed: 0,
      successful: 0,
      failed: 0,
      errors: []
    };

    try {
      console.log(`Starting auto-import of recent events from last ${daysBack} days...`);

      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - daysBack);

      // Get recent events
      const allEvents = await this.api.getEvents();
      const recentEvents = allEvents.filter(event => 
        new Date(event.startDate) >= cutoffDate || new Date(event.endDate) >= cutoffDate
      );

      progress.total = recentEvents.length;
      
      console.log(`Found ${recentEvents.length} recent events to process`);

      for (const event of recentEvents) {
        try {
          // Import/update the event
          await this.storage.upsertGolfGeniusEvent({
            golfGeniusId: event.id,
            name: event.name,
            description: event.description,
            startDate: new Date(event.startDate),
            endDate: new Date(event.endDate),
            eventType: event.eventType,
            courseId: event.courseId,
            status: event.status,
            maxParticipants: event.maxParticipants,
            registrationDeadline: event.registrationDeadline ? new Date(event.registrationDeadline) : null,
            cost: event.cost,
          });

          // Import scores for completed events
          if (event.status === 'completed') {
            try {
              const scores = await this.api.getEventScores(event.id);
              for (const score of scores) {
                await this.storage.upsertGolfGeniusScore({
                  eventId: score.eventId,
                  playerId: score.playerId,
                  roundNumber: score.roundNumber,
                  hole: score.hole,
                  strokes: score.strokes,
                  putts: score.putts,
                  fairwayHit: score.fairwayHit,
                  greenInRegulation: score.greenInRegulation,
                  sandSave: score.sandSave,
                  upAndDown: score.upAndDown,
                  penalty: score.penalty,
                });
              }
            } catch (scoresError) {
              console.warn(`Failed to import scores for event ${event.id}:`, scoresError);
            }
          }

          progress.successful++;
        } catch (error) {
          progress.failed++;
          const errorMsg = `Failed to process event ${event.name}: ${error}`;
          progress.errors.push(errorMsg);
          console.error(errorMsg);
        }

        progress.processed++;
      }

      await this.updateImportLog(logId, {
        status: 'completed',
        recordsProcessed: progress.processed,
        recordsSuccessful: progress.successful,
        recordsFailed: progress.failed,
      });

      console.log(`Auto-import completed: ${progress.successful} successful, ${progress.failed} failed`);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      progress.errors.push(errorMessage);
      
      await this.updateImportLog(logId, {
        status: 'failed',
        errorMessage,
        errorDetails: error,
      });

      console.error('Auto-import failed:', error);
    }

    return progress;
  }

  /**
   * Get import status and recent logs
   */
  async getImportStatus() {
    const logs = await this.storage.getGolfGeniusImportLogs(10);
    const playerCount = (await this.storage.getGolfGeniusPlayers(1)).length;
    const eventCount = (await this.storage.getGolfGeniusEvents(1)).length;

    return {
      recentLogs: logs,
      playerCount,
      eventCount,
      lastImport: logs.length > 0 ? logs[0].createdAt : null,
    };
  }
}

export function createGolfGeniusImportService(apiKey: string, storage: IStorage): GolfGeniusImportService {
  return new GolfGeniusImportService(apiKey, storage);
}