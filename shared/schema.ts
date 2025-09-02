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
    stops: Array<{
      location: string;
      arrivalTime: string;
      arrivalDate: string;
    }>;
  }>(),
  preferences: jsonb("preferences").$type<{
    budget: number; // 1-5 scale (1=Frugal, 2=Economy, 3=Balanced, 4=Comfort, 5=Luxury)
    activities: number; // 0-5 scale (0=Resting, 1=Easy, 2=Gentle, 3=Balanced, 4=Lively, 5=Energised)
    transitStyle: 'fast-track' | 'scenic-route' | 'fewer-transfers';
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
      highlights: Array<string>;
      timelineItems: Array<{
        time: string;
        title: string;
        description: string;
        type: 'primary' | 'accent' | 'secondary';
      }>;
      cost: string;
      duration: string;
      totalTime: string;
      energyLevel: string;
      comfortLevel: string;
      confidenceScore: number; // 0-100
      stressLevel: 'Minimal' | 'Low' | 'Moderate' | 'High';
      recommended: boolean;
      summary: string;
      confidence: 'high' | 'medium' | 'low';
      uncertainties: Array<string>;
      fallbackSuggestion?: string;
    }>;
    finalRecommendation: {
      optionId: string;
      reasoning: string;
      confidence: number; // 0-100
    };
    userContext: {
      travelingSituation: string;
      preferences: string;
      constraints: string;
    };
    fallbackMode?: boolean;
  }>(),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTravelSessionSchema = createInsertSchema(travelSessions).omit({
  id: true,
  createdAt: true,
});

export const stopSchema = z.object({
  location: z.string().min(1, "Stop location is required"),
  arrivalTime: z.string().min(1, "Arrival time is required"),
  arrivalDate: z.string().min(1, "Arrival date is required"),
});

export const flightDetailsSchema = z.object({
  from: z.string().min(1, "Starting location is required"),
  to: z.string().min(1, "Final destination is required"),
  departureTime: z.string().min(1, "Departure time is required"),
  arrivalTime: z.string().min(1, "Final arrival time is required"),
  departureDate: z.string().min(1, "Departure date is required"),
  arrivalDate: z.string().min(1, "Final arrival date is required"),
  adults: z.number().min(1, "At least 1 adult required").max(10),
  children: z.number().min(0).max(10),
  luggageCount: z.number().min(0).max(20),
  stops: z.array(stopSchema).length(2, "Exactly 2 stops are required for this transit planner"),
});

export const preferencesSchema = z.object({
  budget: z.number().min(1).max(5),
  activities: z.number().min(0).max(5),
  transitStyle: z.enum(['fast-track', 'scenic-route', 'fewer-transfers']),
});

// PDF Extraction schemas
export const extractedFieldSchema = z.object({
  value: z.string(),
  confidence: z.number().min(0).max(100),
  source: z.enum(['manual', 'extracted']).default('extracted'),
});

export const pdfExtractionSchema = z.object({
  from: extractedFieldSchema.optional(),
  departureTime: extractedFieldSchema.optional(),
  departureDate: extractedFieldSchema.optional(),
  adults: z.object({
    value: z.number(),
    confidence: z.number().min(0).max(100),
    source: z.enum(['manual', 'extracted']).default('extracted'),
  }).optional(),
  children: z.object({
    value: z.number(),
    confidence: z.number().min(0).max(100),
    source: z.enum(['manual', 'extracted']).default('extracted'),
  }).optional(),
  luggageCount: z.object({
    value: z.number(),
    confidence: z.number().min(0).max(100),
    source: z.enum(['manual', 'extracted']).default('extracted'),
  }).optional(),
  stops: z.array(z.object({
    location: extractedFieldSchema.optional(),
    arrivalTime: extractedFieldSchema.optional(),
    arrivalDate: extractedFieldSchema.optional(),
  })).length(2).optional(),
});

export type InsertTravelSession = z.infer<typeof insertTravelSessionSchema>;
export type TravelSession = typeof travelSessions.$inferSelect;
export type Stop = z.infer<typeof stopSchema>;
export type FlightDetails = z.infer<typeof flightDetailsSchema>;
export type Preferences = z.infer<typeof preferencesSchema>;
export type ExtractedField = z.infer<typeof extractedFieldSchema>;
export type PDFExtraction = z.infer<typeof pdfExtractionSchema>;
