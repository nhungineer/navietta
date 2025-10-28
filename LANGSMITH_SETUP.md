# LangSmith Integration Guide for Navietta

## Overview
LangSmith is now integrated into your development environment for observing, evaluating, and improving AI prompts **without deploying to production**.

## Quick Start

### 1. Get Your LangSmith API Key
1. Go to [LangSmith](https://smith.langchain.com/)
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new API key

### 2. Configure Your Environment
Create a `.env` file in the project root (copy from `.env.example`):

```bash
cp .env.example .env
```

Edit `.env` and add your keys:
```env
NODE_ENV=development
LANGSMITH_TRACING=true
LANGSMITH_API_KEY=lsv2_pt_your_key_here
LANGSMITH_PROJECT=navietta-dev
NAVIETTA_DEV_API_KEY=your_anthropic_key_here
```

### 3. Start Development Server
```bash
npm run dev
```

You should see: `🔍 LangSmith tracing enabled for development`

## What Gets Traced

All Claude API calls in `server/services/claude.ts`:

1. **Travel Recommendations** (`generateTravelRecommendations`)
   - System prompts with preference handling rules
   - User context (flight details, preferences)
   - Generated recommendations with reasoning
   - Token usage and costs

2. **Follow-up Questions** (`generateFollowUpResponse`)
   - Conversation history
   - Context summaries
   - Natural language responses

3. **PDF Extraction** (`extractTravelDataFromPDF`)
   - Document processing prompts
   - Extraction accuracy
   - Confidence scores

## Using LangSmith for Prompt Engineering

### View Traces
1. Go to [LangSmith Projects](https://smith.langchain.com/)
2. Select your project (e.g., "navietta-dev")
3. View all API calls with:
   - Input prompts
   - Output responses
   - Latency metrics
   - Token costs
   - Error rates

### Evaluate Prompts

#### Create Datasets
1. In LangSmith, go to "Datasets"
2. Create a new dataset with test cases:
   ```json
   {
     "flight_details": {
       "from": "Melbourne International Airport (MEL)",
       "stops": [
         {"location": "Abu Dhabi (AUH)", "arrivalTime": "15:30"},
         {"location": "Berlin (BER)", "arrivalTime": "20:45"}
       ]
     },
     "preferences": {
       "budget": 3,
       "activities": 4,
       "transitStyle": "scenic-route"
     }
   }
   ```

#### Run Evaluations
1. Select a prompt version
2. Run it against your dataset
3. Compare outputs across different prompt versions
4. Use custom evaluators (e.g., relevance, accuracy, cost)

### Improve Prompts

#### A/B Testing Prompts
1. Modify your system prompts in `claude.ts`
2. Run the same requests
3. Compare results in LangSmith:
   - Response quality
   - Token usage
   - User preference (manual labeling)

#### Example: Testing Preference Handling
```typescript
// Version A (Current)
const systemPrompt = `When preferences conflict, use these priority rules:
- Tight timeframes are CRITICAL OVERRIDE...`;

// Version B (Test)
const systemPrompt = `Handle conflicting preferences by:
1. Safety first: ensure timely arrival
2. User wellbeing: energy levels...`;
```

Run both and compare in LangSmith which produces better recommendations.

### Monitoring Metrics

LangSmith automatically tracks:
- **Latency**: Response times for each Claude call
- **Costs**: Token usage (input + output)
- **Error rates**: Failed API calls
- **User feedback**: Manual annotations

## Production Considerations

### Current Setup: Dev Only
```typescript
const isDevEnvironment = process.env.NODE_ENV === "development";
const langsmithEnabled = process.env.LANGSMITH_TRACING === "true";

if (isDevEnvironment && langsmithEnabled) {
  anthropic = wrapSDK(anthropic);
}
```

This means:
- ✅ LangSmith only runs when `NODE_ENV=development`
- ✅ Must explicitly enable with `LANGSMITH_TRACING=true`
- ✅ Production deployments (Vercel/Railway) won't be traced
- ✅ No performance impact on production

### Optional: Enable in Production
If you want production tracing later:

1. Update `claude.ts`:
```typescript
// Enable in production with separate project
const projectName = isProduction
  ? "navietta-production"
  : "navietta-dev";

if (langsmithEnabled) {
  anthropic = wrapSDK(anthropic, {
    project: projectName
  });
}
```

2. Set production environment variables in Vercel/Railway
3. Monitor production usage separately

## Best Practices

### 1. Organize by Projects
- `navietta-dev` - Development experiments
- `navietta-staging` - Pre-production testing
- `navietta-prod` - Production monitoring (optional)

### 2. Tag Important Runs
Add tags to trace specific scenarios:
```typescript
import { traceable } from "langsmith/traceable";

export const generateTravelRecommendations = traceable(
  async (flightDetails, preferences) => {
    // Your existing code
  },
  {
    name: "travel-recommendations",
    tags: ["v2-prompt", "preference-override-test"]
  }
);
```

### 3. Monitor Prompt Performance
Weekly review:
1. Check average latency trends
2. Identify prompts with high error rates
3. Compare token costs across prompt versions
4. Review user feedback/annotations

### 4. Use Playground
1. Copy a trace from your app
2. Open in LangSmith Playground
3. Modify the prompt
4. Test variations instantly
5. Deploy the best version back to code

## Common Use Cases

### Debug Unexpected AI Responses
1. Find the problematic trace in LangSmith
2. View exact input prompt and context
3. See what the model actually received
4. Identify issues (missing context, unclear instructions)

### Optimize Token Usage
1. View token breakdown per request
2. Identify verbose prompts
3. Test shorter versions
4. Compare quality vs. cost

### Test Preference Conflict Handling
1. Create dataset with conflicting preferences:
   - High budget + Tight timeframe
   - Low energy + Scenic route preference
2. Run evaluations
3. Ensure AI handles edge cases correctly

## Troubleshooting

### Not Seeing Traces?
Check:
1. `LANGSMITH_API_KEY` is set correctly
2. `LANGSMITH_TRACING=true` in `.env`
3. `NODE_ENV=development`
4. Console shows: "🔍 LangSmith tracing enabled"

### Traces Show Wrong Project?
Set explicit project:
```env
LANGSMITH_PROJECT=your-project-name
```

### Performance Impact?
- Dev: Minimal (adds ~50-100ms per trace)
- Production: None (tracing disabled by default)

## Resources

- [LangSmith Documentation](https://docs.smith.langchain.com/)
- [Prompt Engineering Guide](https://docs.smith.langchain.com/evaluation/how_to_guides/evaluation)
- [Anthropic Best Practices](https://docs.anthropic.com/claude/docs/intro-to-prompting)

## Next Steps

1. ✅ Create test dataset with various travel scenarios
2. ✅ Run baseline evaluation with current prompts
3. ✅ Experiment with prompt variations
4. ✅ Compare results and implement best version
5. ✅ Set up monitoring dashboards in LangSmith
