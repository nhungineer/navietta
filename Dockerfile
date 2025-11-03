# ============================================
# STAGE 1: Build Stage
# ============================================
# This creates a temporary container just for building your app
# Think of it as a "construction zone" that we'll throw away later

FROM node:20-slim AS builder

# Install system dependencies needed for building
# - graphicsmagick: Required for pdf2pic (PDF processing)
# - python3, make, g++: Required for some npm packages that need compiling
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    python3 \
    make \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Set working directory inside the container
# All subsequent commands run from this folder
WORKDIR /app

# Copy package files first (for better caching)
# Docker caches each step - if package.json doesn't change,
# it won't reinstall dependencies next time
COPY package*.json ./

# Install ALL dependencies (including devDependencies)
# We need devDependencies like vite, esbuild, typescript to build
RUN npm ci

# Copy the rest of your code
COPY . .

# Build your app
# This runs: vite build (frontend) && esbuild (backend)
# Creates the /dist folder with compiled code
RUN npm run build

# ============================================
# STAGE 2: Production Stage
# ============================================
# This creates the final, slim container that actually runs
# We copy only what we need from the builder stage

FROM node:20-slim

# Install ONLY runtime dependencies (not build tools)
# graphicsmagick is needed at runtime for PDF processing
RUN apt-get update && apt-get install -y \
    graphicsmagick \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy package files and install ONLY production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built app from the builder stage
# This is the magic: we get the compiled code without the build tools
COPY --from=builder /app/dist ./dist

# Copy shared schema (needed at runtime by your app)
COPY --from=builder /app/shared ./shared

# Expose port 3000
# This tells Docker "this app listens on port 3000"
# (It's documentation, doesn't actually open the port)
EXPOSE 3000

# Set environment to production
ENV NODE_ENV=production

# This is what runs when the container starts
# Maps to your "start" script: node dist/index.js
CMD ["npm", "start"]
