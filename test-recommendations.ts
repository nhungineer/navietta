/**
 * Test script for generating travel recommendations
 * Run with: npx tsx test-recommendations.ts
 */

const API_BASE_URL = "http://localhost:3000";

interface TestScenario {
  name: string;
  flightDetails: {
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
      departureTime?: string;
      departureDate?: string;
    }>;
  };
  preferences: {
    budget: number;
    activities: number;
    transitStyle: "fast-track" | "scenic-route" | "fewer-transfers";
  };
}

const TEST_SCENARIOS: TestScenario[] = [
  {
    name: "Hong Kong Layover - High Budget, Active",
    flightDetails: {
      from: "Melbourne",
      to: "London",
      departureTime: "08:00",
      arrivalTime: "18:00",
      departureDate: "2025-09-02",
      arrivalDate: "2025-09-03",
      adults: 2,
      children: 0,
      luggageCount: 2,
      stops: [
        {
          location: "Hong Kong",
          arrivalTime: "18:00",
          arrivalDate: "2025-09-02",
          departureTime: "11:00",
          departureDate: "2025-09-03",
        },
        {
          location: "London",
          arrivalTime: "18:00",
          arrivalDate: "2025-09-03",
        },
      ],
    },
    preferences: {
      budget: 4,
      activities: 4,
      transitStyle: "scenic-route",
    },
  },
  {
    name: "Singapore Layover - Budget, Low Energy",
    flightDetails: {
      from: "Sydney",
      to: "Paris",
      departureTime: "22:00",
      arrivalTime: "14:00",
      departureDate: "2025-10-15",
      arrivalDate: "2025-10-16",
      adults: 1,
      children: 0,
      luggageCount: 1,
      stops: [
        {
          location: "Singapore",
          arrivalTime: "05:00",
          arrivalDate: "2025-10-16",
          departureTime: "09:00",
          departureDate: "2025-10-16",
        },
        {
          location: "Paris",
          arrivalTime: "14:00",
          arrivalDate: "2025-10-16",
        },
      ],
    },
    preferences: {
      budget: 2,
      activities: 1,
      transitStyle: "fast-track",
    },
  },
  {
    name: "Dubai Layover - Luxury, Family",
    flightDetails: {
      from: "New York",
      to: "Mumbai",
      departureTime: "23:00",
      arrivalTime: "20:00",
      departureDate: "2025-11-20",
      arrivalDate: "2025-11-21",
      adults: 2,
      children: 2,
      luggageCount: 4,
      stops: [
        {
          location: "Dubai",
          arrivalTime: "19:00",
          arrivalDate: "2025-11-21",
          departureTime: "02:00",
          departureDate: "2025-11-21",
        },
        {
          location: "Mumbai",
          arrivalTime: "20:00",
          arrivalDate: "2025-11-21",
        },
      ],
    },
    preferences: {
      budget: 5,
      activities: 3,
      transitStyle: "fewer-transfers",
    },
  },
  {
    name: "Short Istanbul Layover - Balanced",
    flightDetails: {
      from: "London",
      to: "Bangkok",
      departureTime: "10:00",
      arrivalTime: "14:00",
      departureDate: "2025-12-01",
      arrivalDate: "2025-12-02",
      adults: 2,
      children: 1,
      luggageCount: 3,
      stops: [
        {
          location: "Istanbul",
          arrivalTime: "16:00",
          arrivalDate: "2025-12-01",
          departureTime: "20:00",
          departureDate: "2025-12-01",
        },
        {
          location: "Bangkok",
          arrivalTime: "14:00",
          arrivalDate: "2025-12-02",
        },
      ],
    },
    preferences: {
      budget: 3,
      activities: 3,
      transitStyle: "scenic-route",
    },
  },
];

async function testRecommendation(scenario: TestScenario) {
  console.log(`\n${"=".repeat(60)}`);
  console.log(`Testing: ${scenario.name}`);
  console.log(`${"=".repeat(60)}\n`);

  try {
    const response = await fetch(
      `${API_BASE_URL}/api/travel/generate-recommendations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightDetails: scenario.flightDetails,
          preferences: scenario.preferences,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    console.log("✅ Success!");
    console.log(`Session ID: ${result.sessionId}`);
    console.log(`Recommended: ${result.recommendations.finalRecommendation.optionId}`);
    console.log(`Confidence: ${result.recommendations.finalRecommendation.confidence}%`);
    console.log("\nOptions:");
    result.recommendations.options.forEach((option: any) => {
      console.log(
        `  - ${option.title} (${option.recommended ? "⭐ RECOMMENDED" : ""})`
      );
      console.log(`    Cost: ${option.cost}, Duration: ${option.duration}`);
    });

    return {
      scenario: scenario.name,
      success: true,
      sessionId: result.sessionId,
    };
  } catch (error) {
    console.error("❌ Failed:", error);
    return {
      scenario: scenario.name,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runAllTests() {
  console.log("🚀 Starting Travel Recommendation Tests");
  console.log(`Testing against: ${API_BASE_URL}\n`);

  const results = [];

  for (const scenario of TEST_SCENARIOS) {
    const result = await testRecommendation(scenario);
    results.push(result);
    // Wait 1 second between requests to avoid rate limiting
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }

  console.log(`\n${"=".repeat(60)}`);
  console.log("📊 Test Summary");
  console.log(`${"=".repeat(60)}\n`);

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;

  console.log(`Total: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);

  if (failed > 0) {
    console.log("\nFailed scenarios:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.scenario}: ${r.error}`);
      });
  }

  console.log("\n🔗 View traces in LangSmith:");
  console.log("   https://smith.langchain.com/");
}

// Run tests
runAllTests().catch(console.error);
