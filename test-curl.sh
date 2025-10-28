#!/bin/bash

# Test Travel Recommendations with curl
# Usage: ./test-curl.sh

API_URL="http://localhost:3000/api/travel/generate-recommendations"

echo "🚀 Testing Hong Kong Layover Scenario"
echo "======================================"

curl -X POST "$API_URL" \
  -H "Content-Type: application/json" \
  -d '{
    "flightDetails": {
      "from": "Melbourne",
      "to": "London",
      "departureTime": "08:00",
      "arrivalTime": "18:00",
      "departureDate": "2025-09-02",
      "arrivalDate": "2025-09-03",
      "adults": 2,
      "children": 0,
      "luggageCount": 2,
      "stops": [
        {
          "location": "Hong Kong",
          "arrivalTime": "18:00",
          "arrivalDate": "2025-09-02",
          "departureTime": "11:00",
          "departureDate": "2025-09-03"
        },
        {
          "location": "London",
          "arrivalTime": "18:00",
          "arrivalDate": "2025-09-03"
        }
      ]
    },
    "preferences": {
      "budget": 4,
      "activities": 4,
      "transitStyle": "scenic-route"
    }
  }' | jq '.recommendations.options[] | {title, cost, duration}'

echo -e "\n✅ Test complete! Check LangSmith for trace details."
