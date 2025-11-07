/**
 * Test script for golden dataset scenarios
 * Run with: npx tsx test-recommendations-golden.ts
 *
 * This is Option B: Loads golden dataset + basic automated validation
 */

import goldenDataset from "./test/golden_dataset/golden-dataset.json";

const API_BASE_URL = "http://localhost:3000";

interface GoldenScenario {
  metadata: {
    id: string;
    name: string;
    category: string;
    description: string;
    created: string;
    difficulty: string;
  };
  input: {
    flightDetails: any;
    preferences: any;
  };
  expectedOutput: {
    "primary-focus": string;
    "must-have": string[];
    "good-looks-like": string[];
  };
}

// Helper: Parse time string to minutes since midnight
function timeToMinutes(timeStr: string): number {
  const [hours, minutes] = timeStr.split(":").map(Number);
  return hours * 60 + minutes;
}

// Helper: Calculate layover duration
function calculateLayoverHours(scenario: GoldenScenario): number {
  const stop = scenario.input.flightDetails.stops[0];
  const arrivalMins = timeToMinutes(stop.arrivalTime);
  const departureMins = timeToMinutes(stop.departureTime);

  // Handle overnight (departure next day)
  const totalMins =
    departureMins < arrivalMins
      ? 24 * 60 - arrivalMins + departureMins // overnight
      : departureMins - arrivalMins; // same day

  return totalMins / 60;
}

// VALIDATION: Check if timeline respects 1h safety buffer
function validateTimingSafety(
  recommendations: any,
  departureTime: string
): string[] {
  const issues: string[] = [];
  const departureMins = timeToMinutes(departureTime);
  const cutoffMins = departureMins - 60; // 1 hour before departure

  // Format cutoff time for display (handle negative/overnight)
  const cutoffDisplay =
    cutoffMins >= 0
      ? `${Math.floor(cutoffMins / 60)}:${String(cutoffMins % 60).padStart(2, "0")}`
      : `${Math.floor((1440 + cutoffMins) / 60)}:${String((1440 + cutoffMins) % 60).padStart(2, "0")} (prev day)`;

  recommendations.options.forEach((option: any, idx: number) => {
    // Get the LAST timeline item (should be "Proceed to Gate")
    const lastItem = option.timelineItems?.[option.timelineItems.length - 1];

    if (lastItem) {
      const itemMins = timeToMinutes(lastItem.time);

      // Check if last item violates the 1h buffer
      // Handle overnight: if departure is early morning (< 6am) and item is late night (> 18:00), it's the night before
      const isOvernight = departureMins < 360 && itemMins > 1080; // departure before 6am, item after 6pm

      let violation = false;
      if (isOvernight) {
        // Overnight case: item should be before departure (wrapping around midnight)
        // Item at 23:30 (1410 min) for departure at 00:30 (30 min) is OK if < 1h gap
        const gapMins = (1440 - itemMins) + departureMins; // mins from item to midnight + midnight to departure
        violation = gapMins < 60;
      } else {
        // Normal case: item should be at least 1h before departure
        violation = itemMins > cutoffMins;
      }

      if (violation) {
        issues.push(
          `⚠️  Option ${idx + 1}: Last timeline item "${lastItem.title}" at ${lastItem.time} violates 1h buffer (cutoff: ${cutoffDisplay})`
        );
      }
    }
  });

  return issues;
}

// VALIDATION: Check if recommendations align with budget
function validateBudgetAlignment(
  recommendations: any,
  budgetLevel: number
): string[] {
  const issues: string[] = [];

  recommendations.options.forEach((option: any, idx: number) => {
    const costStr = option.cost?.toLowerCase() || "";

    // Simple heuristic checks
    if (
      budgetLevel <= 2 &&
      (costStr.includes("luxury") || costStr.includes("premium"))
    ) {
      issues.push(
        `⚠️  Option ${
          idx + 1
        }: Luxury recommendation for low budget (${budgetLevel})`
      );
    }

    if (budgetLevel >= 4 && costStr.includes("free only")) {
      issues.push(
        `⚠️  Option ${
          idx + 1
        }: Only free activities for high budget (${budgetLevel})`
      );
    }
  });

  return issues;
}

async function testScenario(scenario: GoldenScenario) {
  console.log(`\n${"=".repeat(80)}`);
  console.log(`Testing: ${scenario.metadata.name}`);
  console.log(
    `Category: ${scenario.metadata.category} | Difficulty: ${scenario.metadata.difficulty}`
  );
  console.log(`${"=".repeat(80)}`);

  console.log(`\n📋 Test Focus: ${scenario.expectedOutput["primary-focus"]}`);
  console.log(`\n✓ Must-Have Criteria:`);
  scenario.expectedOutput["must-have"].forEach((criteria, idx) => {
    console.log(`  ${idx + 1}. ${criteria}`);
  });

  const layoverHours = calculateLayoverHours(scenario);
  console.log(`\n⏱️  Layover Duration: ${layoverHours.toFixed(1)} hours`);

  try {
    console.log(`\n🚀 Calling API...`);
    const response = await fetch(
      `${API_BASE_URL}/api/travel/generate-recommendations`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          flightDetails: scenario.input.flightDetails,
          preferences: scenario.input.preferences,
        }),
      }
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`API Error: ${response.status} - ${error}`);
    }

    const result = await response.json();

    console.log("\n✅ API Success!");
    console.log(`Session ID: ${result.sessionId}`);

    // Print basic results
    console.log(`\n📊 Recommendations:`);
    console.log(
      `Recommended: Option ${result.recommendations.finalRecommendation.optionId}`
    );
    console.log(
      `Confidence: ${result.recommendations.finalRecommendation.confidence}%`
    );
    console.log(
      `Reasoning: ${result.recommendations.finalRecommendation.reasoning}`
    );

    console.log(`\n🎯 Generated Options:`);
    result.recommendations.options.forEach((option: any, idx: number) => {
      console.log(
        `\n  Option ${idx + 1}: ${option.title} ${
          option.recommended ? "⭐" : ""
        }`
      );
      console.log(`    Cost: ${option.cost}`);
      console.log(`    Duration: ${option.duration}`);
      console.log(
        `    Energy: ${option.energyLevel} | Comfort: ${option.comfortLevel} | Stress: ${option.stressLevel}`
      );
      console.log(`    Timeline Items: ${option.timelineItems?.length || 0}`);
      if (option.timelineItems && option.timelineItems.length > 0) {
        console.log(
          `    First: ${option.timelineItems[0].time} - ${option.timelineItems[0].title}`
        );
        console.log(
          `    Last:  ${
            option.timelineItems[option.timelineItems.length - 1].time
          } - ${option.timelineItems[option.timelineItems.length - 1].title}`
        );
      }
    });

    // AUTOMATED VALIDATION
    console.log(`\n🔍 Automated Validation:`);

    const departureTime = scenario.input.flightDetails.stops[0].departureTime;
    const timingIssues = validateTimingSafety(
      result.recommendations,
      departureTime
    );

    const budgetIssues = validateBudgetAlignment(
      result.recommendations,
      scenario.input.preferences.budget
    );

    const allIssues = [...timingIssues, ...budgetIssues];

    if (allIssues.length === 0) {
      console.log("  ✅ No automated issues detected");
    } else {
      console.log(`  ⚠️  Found ${allIssues.length} potential issue(s):`);
      allIssues.forEach((issue) => console.log(`    ${issue}`));
    }

    // Manual review reminders
    console.log(`\n📝 Manual Review Checklist:`);
    console.log(`  [ ] Does it match the primary focus?`);
    scenario.expectedOutput["must-have"].forEach((criteria, idx) => {
      console.log(`  [ ] ${criteria}`);
    });

    console.log(`\n💡 Good Looks Like:`);
    scenario.expectedOutput["good-looks-like"].forEach((example, idx) => {
      console.log(`  - ${example}`);
    });

    return {
      scenarioId: scenario.metadata.id,
      success: true,
      sessionId: result.sessionId,
      automatedIssues: allIssues.length,
    };
  } catch (error) {
    console.error("\n❌ Test Failed:", error);
    return {
      scenarioId: scenario.metadata.id,
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

async function runGoldenDatasetTests() {
  console.log("🧪 Running Golden Dataset Tests");
  console.log(`Testing against: ${API_BASE_URL}\n`);
  console.log(`Total scenarios in dataset: ${goldenDataset.scenarios.length}`);

  // Filter out template scenarios (they have invalid placeholder data)
  const validScenarios = goldenDataset.scenarios.filter((s: any) => {
    // Check if it's a template (has pipe symbols in data)
    const hasPlaceholders = JSON.stringify(s).includes(" | ");
    return !hasPlaceholders;
  });

  console.log(`Valid scenarios ready to test: ${validScenarios.length}\n`);

  if (validScenarios.length === 0) {
    console.log(
      "⚠️  No valid scenarios found. Make sure your scenarios don't have placeholder text like '10:00 | Check...'"
    );
    return;
  }

  const results = [];

  for (const scenario of validScenarios) {
    const result = await testScenario(scenario as GoldenScenario);
    results.push(result);

    // Wait between requests
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  // Summary
  console.log(`\n${"=".repeat(80)}`);
  console.log("📊 TEST SUMMARY");
  console.log(`${"=".repeat(80)}\n`);

  const passed = results.filter((r) => r.success).length;
  const failed = results.filter((r) => !r.success).length;
  const issuesFound = results.reduce(
    (sum, r) => sum + (r.automatedIssues || 0),
    0
  );

  console.log(`Total Tested: ${results.length}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Automated Issues Detected: ${issuesFound}`);

  if (failed > 0) {
    console.log("\n❌ Failed Scenarios:");
    results
      .filter((r) => !r.success)
      .forEach((r) => {
        console.log(`  - ${r.scenarioId}: ${r.error}`);
      });
  }

  if (issuesFound > 0) {
    console.log("\n⚠️  Scenarios with potential issues (review manually):");
    results
      .filter((r) => r.automatedIssues && r.automatedIssues > 0)
      .forEach((r) => {
        console.log(`  - ${r.scenarioId}: ${r.automatedIssues} issue(s)`);
      });
  }

  console.log("\n🔗 View detailed traces in LangSmith:");
  console.log("   https://smith.langchain.com/");
  console.log("\n💡 Tip: Review each scenario's manual checklist above");
}

// Run tests
runGoldenDatasetTests().catch(console.error);
