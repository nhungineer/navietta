import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { generateTravelRecommendations } from "./services/claude";
import { generateMockTravelRecommendations } from "./services/mockClaude";
import { flightDetailsSchema, preferencesSchema } from "@shared/schema";
import { z } from "zod";
import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || "",
});

// <important_do_not_delete>
const DEFAULT_MODEL_STR = "claude-sonnet-4-20250514";
// </important_do_not_delete>

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

  // Chat with AI about travel recommendations
  app.post("/api/travel/chat", async (req, res) => {
    try {
      const { sessionId, message } = req.body;
      
      if (!sessionId || !message) {
        return res.status(400).json({ message: 'Session ID and message are required' });
      }

      const session = await storage.getTravelSession(sessionId);
      if (!session) {
        return res.status(404).json({ message: 'Travel session not found' });
      }

      // Generate chat response using Claude
      let response;
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          const chatResponse = await anthropic.messages.create({
            model: DEFAULT_MODEL_STR,
            max_tokens: 1000,
            system: `You are Navietta, the AI travel assistant. The user has already received travel recommendations for their trip from ${session.flightDetails?.from} to ${session.flightDetails?.to}, arriving at ${session.flightDetails?.arrivalTime} with next stop at ${session.flightDetails?.nextStop} at ${session.flightDetails?.nextStopTime}.

Their current recommendations include:
${session.aiRecommendations?.options.map((opt, i) => `${i+1}. ${opt.title}: ${opt.description} (${opt.cost}, ${opt.duration})`).join('\n')}

Answer their follow-up question helpfully and conversationally. Keep responses concise but informative.`,
            messages: [
              {
                role: "user",
                content: message
              }
            ]
          });

          const content = chatResponse.content[0];
          if (content.type === 'text') {
            response = content.text;
          } else {
            response = "I'm having trouble processing your question right now. Could you try rephrasing it?";
          }
        } catch (error) {
          console.error('Claude API error in chat:', error);
          response = "I'm having trouble connecting to my AI systems right now. Please try again in a moment.";
        }
      } else {
        response = "I'm currently running in demo mode. In the full version, I'd analyze your question and provide personalized travel advice based on your specific itinerary and preferences.";
      }

      res.json({ response });
    } catch (error) {
      console.error('Error in chat endpoint:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
