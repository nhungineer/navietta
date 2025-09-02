import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  generateTravelRecommendations,
  generateFollowUpResponse,
  extractTravelDataFromPDF,
} from "./services/claude";
import { generateMockTravelRecommendations } from "./services/mockClaude";
import { flightDetailsSchema, preferencesSchema } from "@shared/schema";
import { z } from "zod";
import Anthropic from "@anthropic-ai/sdk";
import multer from "multer";
// Using PDF.js for real PDF text extraction

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

const chatSchema = z.object({
  sessionId: z.string(),
  question: z.string(),
  conversationHistory: z
    .array(
      z.object({
        question: z.string(),
        response: z.string(),
      }),
    )
    .optional()
    .default([]),
});

// Configure multer for PDF uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 1024 * 1024, // 1MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF files are allowed"));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Generate travel recommendations using Claude AI
  app.post("/api/travel/generate-recommendations", async (req, res) => {
    try {
      const { flightDetails, preferences } =
        generateRecommendationsSchema.parse(req.body);

      // Try Claude AI first, fallback to mock if API key is missing
      let recommendations;
      console.log("Starting recommendation generation...");

      if (process.env.ANTHROPIC_API_KEY) {
        try {
          console.log("Using Claude API for recommendations");
          recommendations = await generateTravelRecommendations(
            flightDetails,
            preferences,
          );
          console.log("Claude API completed successfully");
        } catch (error) {
          console.error("Claude API error, falling back to mock data:", error);
          recommendations = await generateMockTravelRecommendations(
            flightDetails,
            preferences,
          );
          console.log("Fallback to mock data completed");
        }
      } else {
        console.log("No ANTHROPIC_API_KEY found, using mock data");
        recommendations = await generateMockTravelRecommendations(
          flightDetails,
          preferences,
        );
        console.log("Mock data generation completed");
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
      console.error("Error generating recommendations:", error);
      res.status(400).json({
        message:
          error instanceof Error
            ? error.message
            : "Failed to generate recommendations",
      });
    }
  });

  // Get travel session by ID
  app.get("/api/travel/sessions/:id", async (req, res) => {
    try {
      const session = await storage.getTravelSession(req.params.id);

      if (!session) {
        return res.status(404).json({ message: "Travel session not found" });
      }

      res.json(session);
    } catch (error) {
      console.error("Error fetching travel session:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Chat with AI about travel recommendations using unified Claude service
  app.post("/api/travel/chat", async (req, res) => {
    try {
      const { sessionId, question, conversationHistory } = chatSchema.parse(
        req.body,
      );

      // Retrieve the travel session
      const session = await storage.getTravelSession(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Travel session not found" });
      }

      // Generate follow-up response using Claude AI
      let response;
      if (process.env.ANTHROPIC_API_KEY) {
        try {
          if (!session.aiRecommendations) {
            throw new Error("No AI recommendations found for this session");
          }
          if (!session.flightDetails) {
            throw new Error("No flight details found for this session");
          }
          if (!session.preferences) {
            throw new Error("No preferences found for this session");
          }
          response = await generateFollowUpResponse(
            session.aiRecommendations,
            session.flightDetails,
            session.preferences,
            conversationHistory || [],
            question,
          );
        } catch (error) {
          console.error("Claude API error for follow-up:", error);
          response =
            "I'm having trouble processing your question right now. Could you try rephrasing it, or ask me about specific aspects of your travel options like timing, costs, or activities?";
        }
      } else {
        response =
          "I'd be happy to help with more details about your travel options, but I need the AI service to provide personalized responses. Please ask the administrator to configure the API key.";
      }

      res.json({ response });
    } catch (error) {
      console.error("Error in chat endpoint:", error);
      res.status(500).json({ error: "Failed to process chat message" });
    }
  });

  // PDF travel document extraction endpoint
  app.post(
    "/api/travel/extract-pdf",
    upload.single("pdf"),
    async (req, res) => {
      try {
        if (!req.file) {
          return res.status(400).json({
            message: "No PDF file uploaded",
          });
        }

        console.log(
          `Processing PDF upload: ${req.file.originalname}, size: ${req.file.size} bytes`,
        );

        // Extract text from the actual PDF file
        const pdfBuffer = req.file.buffer;
        console.log(`Extracting text from actual PDF file`);

        // Use Claude's native PDF processing capability
        const pdfBase64 = pdfBuffer.toString("base64");

        console.log(
          `Sending PDF directly to Claude for processing: ${req.file.originalname}`,
        );

        // Extract travel data using Claude AI
        let extractedData;
        if (process.env.ANTHROPIC_API_KEY) {
          try {
            console.log("Using Claude API for PDF extraction");
            extractedData = await extractTravelDataFromPDFDirect(
              pdfBase64,
              req.file.originalname,
            );
            console.log("Claude PDF extraction completed successfully");
          } catch (error) {
            console.error("Claude API error for PDF extraction:", error);
            return res.status(500).json({
              message:
                "Failed to extract travel data from PDF. Please try manual input.",
              fallback: true,
            });
          }
        } else {
          console.log("No ANTHROPIC_API_KEY found, cannot process PDF");
          return res.status(500).json({
            message:
              "PDF processing is not available. Please use manual input.",
            fallback: true,
          });
        }

        // Log successful extraction (without PII)
        console.log(
          "PDF extraction successful. Fields extracted:",
          Object.keys(extractedData).length,
        );

        res.json({
          success: true,
          extractedData,
          message:
            "Travel document processed successfully. Please verify all details.",
        });
      } catch (error) {
        console.error("Error processing PDF upload:", error);

        if (error instanceof multer.MulterError) {
          if (error.code === "LIMIT_FILE_SIZE") {
            return res.status(400).json({
              message: "File too large. Please upload a PDF smaller than 1MB.",
            });
          }
        }

        res.status(500).json({
          message: "Failed to process PDF. Please try manual input.",
          fallback: true,
        });
      }
    },
  );

  const httpServer = createServer(app);
  return httpServer;
}
