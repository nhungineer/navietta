# Testing & Evaluation Guide

## Quick Answers

1. **Token counts**: They're tracked in your console. LangSmith sometimes has sync delays - check again in 5 min or use console logs.
2. **Backend test sets**: YES! Use `test-recommendations.ts` for automated testing
3. **curl vs FE testing**: curl is fastest for iteration, automated tests best for regression

## Three Testing Approaches

### 1. Manual Frontend Testing (Current)
**Best for**: Initial exploration, UX testing

**Pros:**
- See actual user experience
- Test full flow including validation
- Visual feedback

**Cons:**
- Slow for iteration
- Can't easily repeat tests
- Hard to A/B test prompts

**When to use:** Testing UI changes, user flow validation

---

### 2. Automated TypeScript Tests (Recommended)
**Best for**: Regression testing, creating test datasets

**Setup:**
```bash
npm run dev  # Server must be running
npx tsx test-recommendations.ts
```

**Pros:**
- ✅ Test multiple scenarios automatically
- ✅ Consistent, repeatable tests
- ✅ Creates LangSmith traces for all scenarios
- ✅ Easy to add new test cases
- ✅ Great for building evaluation datasets

**Cons:**
- Need to maintain test scenarios
- Requires TypeScript knowledge

**When to use:**
- Regression testing after prompt changes
- Building evaluation datasets for LangSmith
- Comparing multiple scenarios at once

**Adding new scenarios:**
Edit `test-recommendations.ts` and add to `TEST_SCENARIOS` array:
```typescript
{
  name: "Tokyo Short Layover",
  flightDetails: {
    from: "San Francisco",
    to: "Singapore",
    // ... rest of config
    stops: [
      {
        location: "Tokyo",
        arrivalTime: "14:00",
        arrivalDate: "2025-12-10",
        departureTime: "18:00",  // 4 hour layover
        departureDate: "2025-12-10"
      },
      // ...
    ]
  },
  preferences: {
    budget: 2,  // Frugal
    activities: 1,  // Resting
    transitStyle: "fast-track"
  }
}
```

---

### 3. curl Commands (Fastest for Iteration)
**Best for**: Quick prompt testing, debugging

**Setup:**
```bash
./test-curl.sh
```

**Pros:**
- ⚡ Fastest iteration cycle
- 🔧 Easy to modify on the fly
- 📋 Can paste directly in terminal
- 🎯 Focus on one scenario at a time

**Cons:**
- Manual process
- No automatic comparison

**When to use:**
- Quick prompt experiments
- Debugging specific scenarios
- Testing from command line

**Custom test:**
```bash
curl -X POST http://localhost:3000/api/travel/generate-recommendations \
  -H "Content-Type: application/json" \
  -d '{
    "flightDetails": {
      "from": "Paris",
      "to": "Bangkok",
      "stops": [{
        "location": "Dubai",
        "arrivalTime": "22:00",
        "arrivalDate": "2025-11-15",
        "departureTime": "08:00",
        "departureDate": "2025-11-16"
      }, {
        "location": "Bangkok",
        "arrivalTime": "14:00",
        "arrivalDate": "2025-11-16"
      }],
      "adults": 1,
      "children": 0,
      "luggageCount": 1,
      "departureTime": "14:00",
      "departureDate": "2025-11-15",
      "arrivalTime": "14:00",
      "arrivalDate": "2025-11-16"
    },
    "preferences": {
      "budget": 3,
      "activities": 2,
      "transitStyle": "scenic-route"
    }
  }' | jq '.'
```

---

## Using LangSmith for Evaluation

### Creating Test Datasets

**From automated tests:**
1. Run `npx tsx test-recommendations.ts`
2. Go to LangSmith → Your Project
3. Filter traces by tags/metadata
4. Select good examples
5. Click "Add to Dataset"

**Building evaluation sets:**
- **Edge cases**: Very short layovers (2 hours), very long (24+ hours)
- **Budget variations**: Test each budget level (1-5)
- **Family scenarios**: With children, lots of luggage
- **Energy levels**: Tired travelers vs active explorers

### A/B Testing Prompts

**Method 1: LangSmith Playground**
1. Open a trace in LangSmith
2. Click "Open in Playground"
3. Modify the system prompt
4. Run and compare results
5. Copy winning prompt back to code

**Method 2: Code Variants**
```typescript
// In claude.ts, create prompt variants
const PROMPTS = {
  v1: `LAYOVER PLANNING: ...`,  // Current
  v2: `TRANSIT ACTIVITY PLANNING: ...`,  // Test variant
};

const prompt = PROMPTS[process.env.PROMPT_VERSION || 'v1'];
```

Then test:
```bash
PROMPT_VERSION=v1 npx tsx test-recommendations.ts
PROMPT_VERSION=v2 npx tsx test-recommendations.ts
```

Compare in LangSmith!

### Tracking Experiments

**Tag your traces:**
```typescript
// In claude.ts, add metadata
anthropic.messages.create({
  // ... existing config
  metadata: {
    tags: ["experiment-v2", "short-layover"],
    user_id: "test-suite",
    scenario: "hong-kong-overnight"
  }
});
```

Then filter in LangSmith by tags.

---

## Recommended Workflow

### 1. Daily Development
```bash
# Quick iteration
./test-curl.sh
# View in LangSmith, adjust prompt
# Repeat
```

### 2. Before Committing Changes
```bash
# Run full test suite
npx tsx test-recommendations.ts
# Verify no regressions in LangSmith
```

### 3. Weekly Evaluation
1. Review LangSmith traces from production
2. Identify problematic patterns
3. Add failing cases to `test-recommendations.ts`
4. Fix prompts
5. Verify with automated tests

---

## Example Evaluation Metrics

Track these in LangSmith:

1. **Relevance**: Do recommendations match the layover city?
2. **Timing**: Do activities fit within layover duration?
3. **Budget alignment**: Do costs match user's budget preference?
4. **Activity level**: Does energy level match recommendations?
5. **Practicality**: Are suggestions realistic? (no Trans-Siberian for 12hr layover!)

### Creating Custom Evaluators

In LangSmith, create evaluators:

**Budget Check:**
```python
def check_budget(run, example):
    budget = example.inputs["preferences"]["budget"]
    recommendations = run.outputs["options"]

    # Extract costs and compare to budget level
    # Return score 0-1
```

**Relevance Check:**
```python
def check_city_relevance(run, example):
    layover_city = example.inputs["flightDetails"]["stops"][0]["location"]
    recommendations = run.outputs["options"]

    # Check if recommendations mention the layover city
    # Return score 0-1
```

---

## Tips

1. **Use descriptive test names** - Easy to find in LangSmith later
2. **Test edge cases** - Short layovers, overnight, families, budget extremes
3. **Version your prompts** - Comment changes in code, tag in LangSmith
4. **Compare before/after** - Keep traces when changing prompts
5. **Monitor token usage** - Check console logs for cost tracking

---

## Common Test Scenarios to Add

- ✅ Hong Kong overnight (current)
- ⬜ Singapore 4-hour short layover
- ⬜ Dubai overnight with kids
- ⬜ Istanbul 8-hour afternoon
- ⬜ Frankfurt 3-hour tight connection
- ⬜ Bangkok budget backpacker
- ⬜ Tokyo luxury stopover
- ⬜ Los Angeles family with luggage
