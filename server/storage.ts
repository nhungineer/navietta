import { type TravelSession, type InsertTravelSession } from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  createTravelSession(session: InsertTravelSession): Promise<TravelSession>;
  getTravelSession(id: string): Promise<TravelSession | undefined>;
  updateTravelSession(id: string, updates: Partial<InsertTravelSession>): Promise<TravelSession>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, TravelSession>;

  constructor() {
    this.sessions = new Map();
  }

  async createTravelSession(insertSession: InsertTravelSession): Promise<TravelSession> {
    const id = randomUUID();
    const session: TravelSession = { 
      ...insertSession, 
      id, 
      createdAt: new Date()
    };
    this.sessions.set(id, session);
    return session;
  }

  async getTravelSession(id: string): Promise<TravelSession | undefined> {
    return this.sessions.get(id);
  }

  async updateTravelSession(id: string, updates: Partial<InsertTravelSession>): Promise<TravelSession> {
    const existingSession = this.sessions.get(id);
    if (!existingSession) {
      throw new Error('Travel session not found');
    }

    const updatedSession: TravelSession = {
      ...existingSession,
      ...updates,
    };

    this.sessions.set(id, updatedSession);
    return updatedSession;
  }
}

export const storage = new MemStorage();
