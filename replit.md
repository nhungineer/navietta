# Overview

Navietta is a travel transit application that helps users find optimal layover recommendations between flights. The application uses AI (Anthropic Claude) to analyze flight details and user preferences to generate personalized transit options. It follows a multi-step wizard flow where users input flight information, set preferences, and receive AI-generated recommendations for how to spend their layover time.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
The frontend is built with React 18 using TypeScript and follows a modern single-page application (SPA) architecture. The application uses:

- **Routing**: Client-side routing with Wouter for lightweight navigation between wizard steps
- **State Management**: React Context API (`TravelContext`) for managing global application state across the multi-step form
- **UI Framework**: Radix UI components with shadcn/ui design system, styled with Tailwind CSS
- **Form Handling**: React Hook Form with Zod validation for type-safe form validation
- **Data Fetching**: TanStack Query (React Query) for server state management and API communication

The frontend follows a wizard-based flow with four main steps: Landing → Flight Details → Preferences → AI Results.

## Backend Architecture
The backend uses Express.js with TypeScript in a RESTful API architecture:

- **Server Framework**: Express.js with custom middleware for request logging and error handling
- **Development Setup**: Vite integration for hot module replacement and development server
- **API Design**: RESTful endpoints under `/api` namespace with structured JSON responses
- **Error Handling**: Centralized error handling middleware with proper HTTP status codes

## Data Storage Solutions
The application implements a flexible storage abstraction pattern:

- **Storage Interface**: `IStorage` interface defining CRUD operations for travel sessions
- **Current Implementation**: In-memory storage (`MemStorage`) using JavaScript Map for development
- **Database Schema**: Designed for PostgreSQL with Drizzle ORM, supporting JSON columns for complex data structures
- **Session Management**: UUID-based session identifiers for tracking user journeys

## Authentication and Authorization
Currently, the application operates without authentication, using session-based tracking for user journeys. The architecture supports future authentication integration through the existing session management system.

## External Dependencies

### AI Services
- **Anthropic Claude API**: Primary AI service for generating travel recommendations using the latest Claude Sonnet 4 model
- **API Integration**: Server-side integration with structured prompts and response parsing

### Database Services
- **Neon Database**: PostgreSQL-compatible serverless database for production deployments
- **Drizzle ORM**: Type-safe database toolkit with schema-first approach and automatic migrations

### UI and Styling
- **Radix UI**: Accessible, unstyled component primitives for complex UI interactions
- **shadcn/ui**: Pre-built component library built on Radix UI with consistent design tokens
- **Tailwind CSS**: Utility-first CSS framework with custom design system integration

### Development Tools
- **Vite**: Build tool and development server with hot module replacement
- **TypeScript**: Static type checking across the entire application
- **ESBuild**: Fast bundling for production builds

### Form and Validation
- **React Hook Form**: Performant form library with minimal re-renders
- **Zod**: TypeScript-first schema validation for runtime type safety
- **Drizzle-Zod**: Integration between database schema and validation logic

The application is structured as a monorepo with shared schemas and utilities, enabling type safety across client and server boundaries while maintaining clear separation of concerns.