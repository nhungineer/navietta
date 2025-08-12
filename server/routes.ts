import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTravelRecommendations } from "./services/claude";
import { generateMockTravelRecommendations } from "./services/mockClaude";
import { flightDetailsSchema, preferencesSchema } from "@shared/schema";
import { z } from "zod";

const generateRecommendationsSchema = z.object({
  flightDetails: flightDetailsSchema,
  preferences: preferencesSchema,
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate travel recommendations using Claude AI
  app.post("/api/travel/generate-recommendations", async (req, res) => {
    try {
      const { flightDetails, preferences } = generateRecommendationsSchema.parse(req.body);

      // Try Claude AI first, fallback to mock if API key is missing
      let recommendations;
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          recommendations = await generateTravelRecommendations(flightDetails, preferences);
        } catch (error) {
          console.error('Claude API error, falling back to mock data:', error);
          recommendations = await generateMockTravelRecommendations(flightDetails, preferences);
        }
      } else {
        console.log('No ANTHROPIC_API_KEY found, using mock data');
        recommendations = await generateMockTravelRecommendations(flightDetails, preferences);
      }

      // Create a new travel session
      const session = await storage.createTravelSession({
        flightDetails,
        preferences,
        aiRecommendations: recommendations,
      });

      res.json({
        sessionId: session.id,
        recommendations,
      });
    } catch (error) {
      console.error('Error generating recommendations:', error);
      res.status(400).json({ 
        message: error instanceof Error ? error.message : 'Failed to generate recommendations' 
      });
    }
  });

  // Get travel session by ID
  app.get("/api/travel/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getTravelSession(req.params.id);
      
      if (!session) {
        return res.status(404).json({ message: 'Travel session not found' });
      }

      res.json(session);
    } catch (error) {
      console.error('Error fetching travel session:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
