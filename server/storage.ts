import { 
  type User, 
  type InsertUser, 
  type UpsertUser,
  type GolfGeniusImportLog,
  type InsertGolfGeniusImportLog,
  type GolfGeniusPlayer,
  type InsertGolfGeniusPlayer,
  type GolfGeniusEvent,
  type InsertGolfGeniusEvent,
  type GolfGeniusEventRound,
  type InsertGolfGeniusEventRound,
  type GolfGeniusScore,
  type InsertGolfGeniusScore
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Admin operations
  anyMasterAdminExists(): Promise<boolean>;
  
  // Legacy user operations for backward compatibility
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Golf Genius operations
  getGolfGeniusApiKey(): Promise<string | null>;
  setGolfGeniusApiKey(apiKey: string): Promise<void>;
  
  // Import logs
  createGolfGeniusImportLog(log: InsertGolfGeniusImportLog): Promise<string>;
  updateGolfGeniusImportLog(id: string, updates: Partial<GolfGeniusImportLog>): Promise<void>;
  getGolfGeniusImportLogs(limit?: number): Promise<GolfGeniusImportLog[]>;
  
  // Players
  upsertGolfGeniusPlayer(player: InsertGolfGeniusPlayer): Promise<GolfGeniusPlayer>;
  getGolfGeniusPlayers(limit?: number): Promise<GolfGeniusPlayer[]>;
  searchGolfGeniusPlayers(query: string): Promise<GolfGeniusPlayer[]>;
  
  // Events
  upsertGolfGeniusEvent(event: InsertGolfGeniusEvent): Promise<GolfGeniusEvent>;
  getGolfGeniusEvents(limit?: number): Promise<GolfGeniusEvent[]>;
  searchGolfGeniusEvents(query: string): Promise<GolfGeniusEvent[]>;
  
  // Event rounds
  upsertGolfGeniusEventRound(round: InsertGolfGeniusEventRound): Promise<GolfGeniusEventRound>;
  getGolfGeniusEventRounds(eventId: string): Promise<GolfGeniusEventRound[]>;
  
  // Scores
  upsertGolfGeniusScore(score: InsertGolfGeniusScore): Promise<GolfGeniusScore>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private golfGeniusApiKey: string | null;
  private golfGeniusImportLogs: GolfGeniusImportLog[];
  private golfGeniusPlayers: GolfGeniusPlayer[];
  private golfGeniusEvents: GolfGeniusEvent[];
  private golfGeniusEventRounds: GolfGeniusEventRound[];
  private golfGeniusScores: GolfGeniusScore[];

  constructor() {
    this.users = new Map();
    this.golfGeniusApiKey = null;
    this.golfGeniusImportLogs = [];
    this.golfGeniusPlayers = [];
    this.golfGeniusEvents = [];
    this.golfGeniusEventRounds = [];
    this.golfGeniusScores = [];
  }

  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const existingUser = this.users.get(userData.id!);
    const user: User = {
      ...userData,
      id: userData.id || randomUUID(),
      createdAt: existingUser?.createdAt || new Date(),
      updatedAt: new Date(),
    } as User;
    
    this.users.set(user.id, user);
    return user;
  }

  async anyMasterAdminExists(): Promise<boolean> {
    return Array.from(this.users.values()).some(user => user.role === 'master_admin');
  }

  // Legacy user operations for backward compatibility

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => (user as any).username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as User;
    this.users.set(id, user);
    return user;
  }

  // Golf Genius operations
  
  async getGolfGeniusApiKey(): Promise<string | null> {
    return this.golfGeniusApiKey;
  }

  async setGolfGeniusApiKey(apiKey: string): Promise<void> {
    this.golfGeniusApiKey = apiKey;
  }

  async getGolfGeniusImportLogs(limit: number = 50): Promise<GolfGeniusImportLog[]> {
    return this.golfGeniusImportLogs
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA;
      })
      .slice(0, limit);
  }

  async getGolfGeniusPlayers(limit: number = 100): Promise<GolfGeniusPlayer[]> {
    return this.golfGeniusPlayers.slice(0, limit);
  }

  async getGolfGeniusEvents(limit: number = 100): Promise<GolfGeniusEvent[]> {
    return this.golfGeniusEvents.slice(0, limit);
  }

  async getGolfGeniusEventRounds(eventId: string): Promise<GolfGeniusEventRound[]> {
    return this.golfGeniusEventRounds.filter(round => round.eventId === eventId);
  }

  async searchGolfGeniusPlayers(query: string): Promise<GolfGeniusPlayer[]> {
    const lowerQuery = query.toLowerCase();
    return this.golfGeniusPlayers.filter(player => 
      player.firstName?.toLowerCase().includes(lowerQuery) ||
      player.lastName?.toLowerCase().includes(lowerQuery) ||
      player.email?.toLowerCase().includes(lowerQuery)
    );
  }

  async searchGolfGeniusEvents(query: string): Promise<GolfGeniusEvent[]> {
    const lowerQuery = query.toLowerCase();
    return this.golfGeniusEvents.filter(event => 
      event.name.toLowerCase().includes(lowerQuery)
    );
  }

  // Import log operations
  async createGolfGeniusImportLog(log: InsertGolfGeniusImportLog): Promise<string> {
    const id = randomUUID();
    const newLog: GolfGeniusImportLog = {
      ...log,
      id,
      createdAt: new Date(),
      completedAt: null,
    };
    this.golfGeniusImportLogs.push(newLog);
    return id;
  }

  async updateGolfGeniusImportLog(id: string, updates: Partial<GolfGeniusImportLog>): Promise<void> {
    const index = this.golfGeniusImportLogs.findIndex(log => log.id === id);
    if (index !== -1) {
      this.golfGeniusImportLogs[index] = {
        ...this.golfGeniusImportLogs[index],
        ...updates,
        completedAt: new Date(),
      };
    }
  }

  // Player operations
  async upsertGolfGeniusPlayer(player: InsertGolfGeniusPlayer): Promise<GolfGeniusPlayer> {
    const existingIndex = this.golfGeniusPlayers.findIndex(p => p.golfGeniusId === player.golfGeniusId);
    const newPlayer: GolfGeniusPlayer = {
      ...player,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      // Update existing player
      newPlayer.id = this.golfGeniusPlayers[existingIndex].id;
      newPlayer.createdAt = this.golfGeniusPlayers[existingIndex].createdAt;
      this.golfGeniusPlayers[existingIndex] = newPlayer;
    } else {
      // Add new player
      this.golfGeniusPlayers.push(newPlayer);
    }
    return newPlayer;
  }

  // Event operations
  async upsertGolfGeniusEvent(event: InsertGolfGeniusEvent): Promise<GolfGeniusEvent> {
    const existingIndex = this.golfGeniusEvents.findIndex(e => e.golfGeniusId === event.golfGeniusId);
    const newEvent: GolfGeniusEvent = {
      ...event,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      // Update existing event
      newEvent.id = this.golfGeniusEvents[existingIndex].id;
      newEvent.createdAt = this.golfGeniusEvents[existingIndex].createdAt;
      this.golfGeniusEvents[existingIndex] = newEvent;
    } else {
      // Add new event
      this.golfGeniusEvents.push(newEvent);
    }
    return newEvent;
  }

  // Event round operations
  async upsertGolfGeniusEventRound(round: InsertGolfGeniusEventRound): Promise<GolfGeniusEventRound> {
    const existingIndex = this.golfGeniusEventRounds.findIndex(r => 
      r.eventId === round.eventId && r.roundNumber === round.roundNumber
    );
    const newRound: GolfGeniusEventRound = {
      ...round,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      // Update existing round
      newRound.id = this.golfGeniusEventRounds[existingIndex].id;
      newRound.createdAt = this.golfGeniusEventRounds[existingIndex].createdAt;
      this.golfGeniusEventRounds[existingIndex] = newRound;
    } else {
      // Add new round
      this.golfGeniusEventRounds.push(newRound);
    }
    return newRound;
  }

  // Score operations
  async upsertGolfGeniusScore(score: InsertGolfGeniusScore): Promise<GolfGeniusScore> {
    const existingIndex = this.golfGeniusScores.findIndex(s => 
      s.eventId === score.eventId && s.playerId === score.playerId && s.hole === score.hole
    );
    const newScore: GolfGeniusScore = {
      ...score,
      id: randomUUID(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    if (existingIndex !== -1) {
      // Update existing score
      newScore.id = this.golfGeniusScores[existingIndex].id;
      newScore.createdAt = this.golfGeniusScores[existingIndex].createdAt;
      this.golfGeniusScores[existingIndex] = newScore;
    } else {
      // Add new score
      this.golfGeniusScores.push(newScore);
    }
    return newScore;
  }
}

export const storage = new MemStorage();
