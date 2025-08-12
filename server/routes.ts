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

  // Stream travel recommendations with real-time reasoning
  app.post("/api/travel/generate-recommendations-stream", async (req, res) => {
    try {
      const { sessionId, flightDetails, preferences } = req.body;
      
      if (!sessionId || !flightDetails || !preferences) {
        return res.status(400).json({ message: 'Session ID, flight details and preferences are required' });
      }

      // Set headers for Server-Sent Events
      res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
      });

      const sendEvent = (event: string, data: any) => {
        res.write(`event: ${event}\n`);
        res.write(`data: ${JSON.stringify(data)}\n\n`);
      };

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          // Send initial status
          sendEvent('reasoning-start', { stage: 'situationassessment' });

          const stream = anthropic.messages.stream({
            model: DEFAULT_MODEL_STR,
            max_tokens: 4000,
            system: `You are Navietta, the expert AI travel assistant specializing in arrival logistics and layover planning. You provide detailed, transparent reasoning for travel recommendations.

CRITICAL: Structure your response with clear section headers for streaming display:

## SITUATION ASSESSMENT
[Analyze the travel scenario, timing constraints, and key challenges]

## GENERATING OPTIONS  
[Develop different travel options with specific details]

## TRADE-OFF ANALYSIS
[Compare options with clear reasoning about pros/cons]

## FINAL RECOMMENDATIONS
[Provide final JSON recommendations]

Travel Details:
- From: ${flightDetails.from}
- To: ${flightDetails.to} 
- Arrival: ${flightDetails.arrivalTime}
- Next destination: ${flightDetails.nextStop}
- Departure: ${flightDetails.nextStopTime}

User Preferences (0-100):
- Comfort priority: ${preferences.comfort}
- Cost priority: ${preferences.cost} 
- Energy level: ${preferences.energy}

Provide detailed reasoning for each section, then end with JSON recommendations in this format:
{
  "reasoning": {
    "situationAssessment": "...",
    "generatingOptions": "...", 
    "tradeOffAnalysis": "..."
  },
  "options": [...travel options...]
}`,
            messages: [{
              role: "user",
              content: `Please analyze this travel situation and provide detailed recommendations with transparent reasoning.`
            }]
          });

          let currentStage = 'situation-assessment';
          let accumulatedText = '';
          let reasoningData = {
            situationAssessment: '',
            generatingOptions: '',
            tradeOffAnalysis: ''
          };

          stream.on('text', (text) => {
            accumulatedText += text;
            
            // Detect stage changes
            if (text.includes('## GENERATING OPTIONS')) {
              sendEvent('reasoning-progress', { 
                stage: 'situationassessment', 
                content: reasoningData.situationAssessment,
                completed: true 
              });
              currentStage = 'generating-options';
              sendEvent('reasoning-start', { stage: 'generatingoptions' });
            } else if (text.includes('## TRADE-OFF ANALYSIS')) {
              sendEvent('reasoning-progress', { 
                stage: 'generatingoptions', 
                content: reasoningData.generatingOptions,
                completed: true 
              });
              currentStage = 'trade-off-analysis';
              sendEvent('reasoning-start', { stage: 'tradeoffanalysis' });
            } else if (text.includes('## FINAL RECOMMENDATIONS')) {
              sendEvent('reasoning-progress', { 
                stage: 'tradeoffanalysis', 
                content: reasoningData.tradeOffAnalysis,
                completed: true 
              });
              currentStage = 'final-recommendations';
            } else {
              // Send progressive text for current stage
              if (currentStage === 'situation-assessment') {
                reasoningData.situationAssessment += text;
                sendEvent('reasoning-progress', { 
                  stage: 'situationassessment', 
                  content: text, 
                  completed: false 
                });
              } else if (currentStage === 'generating-options') {
                reasoningData.generatingOptions += text;
                sendEvent('reasoning-progress', { 
                  stage: 'generatingoptions', 
                  content: text, 
                  completed: false 
                });
              } else if (currentStage === 'trade-off-analysis') {
                reasoningData.tradeOffAnalysis += text;
                sendEvent('reasoning-progress', { 
                  stage: 'tradeoffanalysis', 
                  content: text, 
                  completed: false 
                });
              }
            }
          });

          stream.on('end', async () => {
            try {
              // Try multiple approaches to extract JSON from Claude's response
              let recommendations;
              
              // First try: look for JSON block
              const jsonMatch = accumulatedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                               accumulatedText.match(/\{[\s\S]*"options"[\s\S]*?\]\s*\}/);
              
              if (jsonMatch) {
                try {
                  const jsonStr = jsonMatch[1] || jsonMatch[0];
                  recommendations = JSON.parse(jsonStr);
                } catch (parseError) {
                  console.log('Failed to parse JSON, trying cleanup:', parseError);
                  
                  // Try to clean up the JSON string
                  let cleanedJson = (jsonMatch[1] || jsonMatch[0])
                    .replace(/,(\s*[}\]])/g, '$1')  // Remove trailing commas
                    .replace(/([{,]\s*)(\w+):/g, '$1"$2":')  // Quote unquoted keys
                    .trim();
                  
                  recommendations = JSON.parse(cleanedJson);
                }
              }
              
              if (!recommendations || !recommendations.options) {
                console.log('No valid JSON found, using mock data');
                recommendations = await generateMockTravelRecommendations(flightDetails, preferences);
              }

              // Store session data
              const sessionData = {
                id: sessionId,
                flightDetails,
                preferences,
                aiRecommendations: recommendations,
                createdAt: new Date()
              };
              
              await storage.createTravelSession(sessionData);
              
              sendEvent('complete', { recommendations, sessionId });
            } catch (error) {
              console.error('Error processing final recommendations:', error);
              
              // Use mock data as final fallback
              try {
                const recommendations = await generateMockTravelRecommendations(flightDetails, preferences);
                const sessionData = {
                  id: sessionId,
                  flightDetails,
                  preferences,
                  aiRecommendations: recommendations,
                  createdAt: new Date()
                };
                await storage.createTravelSession(sessionData);
                sendEvent('complete', { recommendations, sessionId });
              } catch (fallbackError) {
                console.error('Even fallback failed:', fallbackError);
                sendEvent('error', { message: 'Failed to generate recommendations' });
              }
            }
            res.end();
          });

          stream.on('error', (error) => {
            console.error('Streaming error:', error);
            sendEvent('error', { message: 'Streaming failed' });
            res.end();
          });

        } catch (error) {
          console.error('Claude API error:', error);
          sendEvent('error', { message: 'AI service temporarily unavailable' });
          res.end();
        }
      } else {
        // Mock streaming for demo without API key
        const stages = ['situationassessment', 'generatingoptions', 'tradeoffanalysis'];
        const mockTexts = [
          'Critical timing challenge: 19:15 arrival to 20:20 Naples departure gives only 65 minutes...',
          'Evaluating airport express train (35min) vs taxi (45min) vs private transfer options...',
          'Budget preference drives focus on public transport while moderate energy suggests realistic options...'
        ];

        for (let i = 0; i < stages.length; i++) {
          sendEvent('reasoning-start', { stage: stages[i] });
          
          // Simulate word-by-word streaming
          const words = mockTexts[i].split(' ');
          for (const word of words) {
            sendEvent('reasoning-progress', { 
              stage: stages[i], 
              content: word + ' ', 
              completed: false 
            });
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          sendEvent('reasoning-progress', { 
            stage: stages[i], 
            content: mockTexts[i], 
            completed: true 
          });
        }

        const recommendations = await generateMockTravelRecommendations(flightDetails, preferences);
        const sessionData = {
          id: sessionId,
          flightDetails,
          preferences,
          aiRecommendations: recommendations,
          createdAt: new Date()
        };
        
        await storage.createTravelSession(sessionData);
        sendEvent('complete', { recommendations, sessionId });
        res.end();
      }

    } catch (error) {
      console.error('Error in streaming endpoint:', error);
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
