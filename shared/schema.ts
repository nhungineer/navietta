import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const travelSessions = pgTable("travel_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  flightDetails: jsonb("flight_details").$type<{
    from: string;
    to: string;
    departureTime: string;
    arrivalTime: string;
    departureDate: string;
    arrivalDate: string;
    adults: number;
    children: number;
    luggageCount: number;
    nextStop: string;
    nextStopTime: string;
    transportMode: 'flight' | 'taxi' | 'train' | 'bus' | 'hired_car' | 'other';
  }>(),
  preferences: jsonb("preferences").$type<{
    budgetComfort: number; // 0-100 scale
    energyLevel: number; // 0-100 scale
    transitStyle: 'opportunity_maximiser' | 'direct' | 'scenic' | 'budget' | 'comfortable';
  }>(),
  aiRecommendations: jsonb("ai_recommendations").$type<{
    reasoning: {
      situationAssessment: string;
      generatingOptions: string;
      tradeOffAnalysis: string;
    };
    options: Array<{
      id: string;
      title: string;
      description: string;
      timelineItems: Array<{
        time: string;
        title: string;
        description: string;
        type: 'primary' | 'accent' | 'secondary';
      }>;
      cost: string;
      duration: string;
      energyLevel: string;
      comfortScore: number;
      recommended: boolean;
    }>;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTravelSessionSchema = createInsertSchema(travelSessions).omit({
  id: true,
  createdAt: true,
});

export const flightDetailsSchema = z.object({
  from: z.string().min(1, "From location is required"),
  to: z.string().min(1, "To location is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  arrivalDate: z.string().min(1, "Arrival date is required"),
  adults: z.number().min(1, "At least 1 adult required").max(10),
  children: z.number().min(0).max(10),
  luggageCount: z.number().min(0).max(20),
  nextStop: z.string().min(1, "Next stop is required"),
  nextStopTime: z.string().min(1, "Next stop time is required"),
  transportMode: z.enum(['flight', 'taxi', 'train', 'bus', 'hired_car', 'other']),
});

export const preferencesSchema = z.object({
  budgetComfort: z.number().min(0).max(100),
  energyLevel: z.number().min(0).max(100),
  transitStyle: z.enum(['opportunity_maximiser', 'direct', 'scenic', 'budget', 'comfortable']),
});

export type InsertTravelSession = z.infer<typeof insertTravelSessionSchema>;
export type TravelSession = typeof travelSessions.$inferSelect;
export type FlightDetails = z.infer<typeof flightDetailsSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
