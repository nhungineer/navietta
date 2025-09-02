interface FlightDetails {
  from: string;
  departureTime: string;
  departureDate: string;
  adults: number;
  children: number;
  luggageCount: number;
  stops: Array<{
    location: string;
    arrivalTime: string;
    arrivalDate: string;
  }>;
}

interface Preferences {
  budget: number;
  activities: number;
  transitStyle: 'fast-track' | 'scenic-route' | 'fewer-transfers';
}

interface TravelRecommendations {
  reasoning: {
    situationAssessment: string;
    generatingOptions: string;
    tradeOffAnalysis: string;
  };
  options: Array<{
    id: string;
    title: string;
    description: string;
    highlights: Array<string>;
    timelineItems: Array<{
      time: string;
      title: string;
      description: string;
      type: 'primary' | 'accent' | 'secondary';
    }>;
    cost: string;
    duration: string;
    totalTime: string;
    energyLevel: string;
    comfortLevel: string;
    confidenceScore: number;
    stressLevel: 'Minimal' | 'Low' | 'Moderate' | 'High';
    recommended: boolean;
    summary: string;
    confidence: 'high' | 'medium' | 'low';
    uncertainties: Array<string>;
    fallbackSuggestion?: string;
  }>;
  finalRecommendation: {
    optionId: string;
    reasoning: string;
    confidence: number;
  };
  userContext: {
    travelingSituation: string;
    preferences: string;
    constraints: string;
  };
  fallbackMode?: boolean;
}

export async function generateMockTravelRecommendations(
  flightDetails: FlightDetails,
  preferences: Preferences
): Promise<TravelRecommendations> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isHighEnergy = preferences.activities >= 3;
  const isComfortFocused = preferences.budget >= 4;
  const departureHour = parseInt(flightDetails.departureTime.split(':')[0]);
  const isEveningDeparture = departureHour >= 18;
  const arrivalHour = parseInt((flightDetails.arrivalTime || '18:00').split(':')[0]);
  const isEveningArrival = arrivalHour >= 18;

  return {
    reasoning: {
      situationAssessment: `I can see you're starting from ${flightDetails.from} at ${flightDetails.departureTime} - that's ${isEveningDeparture ? 'an evening departure' : 'a daytime departure which gives us good flexibility'}. With ${flightDetails.luggageCount} piece${flightDetails.luggageCount > 1 ? 's' : ''} of luggage and needing to reach ${flightDetails.stops[0]?.location || 'your destination'} by ${flightDetails.stops[0]?.arrivalTime || 'your scheduled time'}, ${isHighEnergy ? "I can tell you're feeling energetic, so I'm comfortable suggesting options that involve a bit more activity." : "since you mentioned feeling less energetic, I'm focusing on straightforward options that won't wear you out further."}`,
      
      generatingOptions: `Given that you prefer ${preferences.transitStyle === 'fast-track' ? 'getting there quickly' : preferences.transitStyle === 'scenic-route' ? 'exploring along the way' : 'keeping things simple'} and you're ${isComfortFocused ? 'willing to spend a bit more for comfort' : 'looking to save money where possible'}, I'm weighing up direct transfers, potential overnight stays, and ${preferences.transitStyle === 'scenic-route' ? 'some interesting exploration opportunities' : 'the most efficient routes'} that work with your ${flightDetails.departureTime} departure.`,
      
      tradeOffAnalysis: `Since you're ${preferences.budget <= 2 ? 'really focused on keeping costs down' : preferences.budget >= 4 ? 'prioritizing comfort and convenience' : 'looking for a good balance between cost and comfort'} and mentioned feeling ${preferences.activities <= 1 ? 'quite tired' : preferences.activities >= 4 ? 'energetic and ready to explore' : 'moderately energetic'}, I'm ${isEveningDeparture ? 'keeping in mind that evening departures can limit what you can realistically do, but they do offer good opportunities to rest' : 'taking advantage of your daytime departure to give you more options'}. The time window to ${flightDetails.stops[0]?.location || 'your destination'} ${preferences.transitStyle === 'scenic-route' ? 'actually works well for some strategic sightseeing' : preferences.transitStyle === 'fast-track' ? 'means we can focus on the most direct routes' : 'gives us room for simple, stress-free transit'}.`
    },
    options: [
      {
        id: "direct-transfer",
        title: isComfortFocused ? "Premium Direct Transfer" : "Budget-Friendly Direct Route",
        description: `This ${isComfortFocused ? 'comfortable and efficient' : 'cost-effective'} option gets you through ${flightDetails.stops[0]?.location || 'your transit location'} to your final destination without any detours. ${isEveningDeparture ? "Perfect since you're departing in the evening and probably want to get to your destination without delays." : "A straightforward transit that'll get you there feeling refreshed."}`,
        timelineItems: [
          {
            time: flightDetails.departureTime,
            title: `Begin your journey from ${flightDetails.from}`,
            description: "Time to head to your departure point",
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.departureTime, 45),
            title: `Board your transport to ${flightDetails.stops[0]?.location || 'your transit location'}`,
            description: isComfortFocused 
              ? "Premium service with reserved seating - relax and enjoy the ride" 
              : "Scheduled service - I would suggest arriving a few minutes early for the best seats",
            type: "accent"
          },
          {
            time: addMinutes(flightDetails.departureTime, isComfortFocused ? 90 : 75),
            title: `You've made it to ${flightDetails.stops[0]?.location || 'your transit location'}!`,
            description: isComfortFocused ? "Arrive at your transit location feeling refreshed and ready for the next leg" : "Mission accomplished - you've reached your transit point efficiently",
            type: "secondary"
          }
        ],
        highlights: [
          isComfortFocused ? "Premium comfort with reserved seating" : "Budget-friendly direct route",
          `Fast ${isComfortFocused ? '90' : '75'}-minute journey`,
          "AI-optimized transport selection"
        ],
        cost: isComfortFocused ? "€80-120" : "€25-45", 
        duration: `${isComfortFocused ? '90' : '75'} min`,
        totalTime: `Total time: ${isComfortFocused ? '90' : '75'} minutes`,
        energyLevel: "Low activity",
        comfortLevel: isComfortFocused ? "High comfort" : "Comfort",
        confidenceScore: isComfortFocused ? 90 : 75,
        stressLevel: "Minimal" as const,
        recommended: !isHighEnergy || preferences.transitStyle === 'fast-track' || preferences.transitStyle === 'fewer-transfers',
        summary: isComfortFocused ? 
          "Premium direct route with reserved seating and maximum comfort for efficient travel." :
          "Budget-conscious option focusing on direct transit while maintaining reasonable comfort levels.",
        confidence: isComfortFocused ? 'high' as const : 'high' as const,
        uncertainties: isComfortFocused ? 
          ["Traffic conditions during peak hours", "Premium service availability"] :
          ["Current Leonardo Express pricing", "Peak season crowds"],
        fallbackSuggestion: isComfortFocused ?
          "If premium service is unavailable, standard transport offers good reliability with slightly longer journey times." :
          "I'd recommend checking current train schedules closer to your travel date, or I can search for the latest information if you'd like."
      },
      {
        id: "strategic-stopover",
        title: isEveningArrival ? "Evening Exploration" : "Strategic City Tour",
        description: `Since you wanted to ${preferences.transitStyle === 'scenic-route' ? 'explore along the way' : 'make the most of your time'}, this gives you ${isEveningArrival ? 'a lovely evening walk through the historic center before you settle in for the night' : 'a perfectly timed tour of the key landmarks without rushing - you will still get to your destination comfortably'}.`,
        timelineItems: [
          {
            time: flightDetails.stops[0]?.arrivalTime || "15:30",
            title: "Drop off your luggage",
            description: `I would recommend storing your ${flightDetails.luggageCount} piece${flightDetails.luggageCount > 1 ? 's' : ''} at ${flightDetails.to} airport or a central location so you can explore hands-free`,
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.stops[0]?.arrivalTime || "15:30", 60),
            title: isEveningArrival ? "Evening stroll through the city" : "Hit the main highlights",
            description: isEveningArrival 
              ? "A peaceful evening walk through the historic center - the lighting is beautiful at this time" 
              : "I have mapped out 2-3 must-see spots that are perfectly positioned on your route",
            type: "accent"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, isEveningArrival ? 120 : 180),
            title: isEveningArrival ? "Authentic local dinner" : "Local food experience", 
            description: isEveningArrival 
              ? "Time for a traditional dinner - I know a few spots the locals love" 
              : "Perfect opportunity to try the local cuisine and soak up some culture",
            type: "secondary"
          },
          {
            time: addMinutes(flightDetails.stops[0]?.departureTime || "13:00", 120),
            title: `Continue to final destination`,
            description: "Board your next transport and head to your final destination - you'll arrive with some great stories!",
            type: "primary"
          }
        ],
        highlights: [
          "Authentic local experiences",
          isEveningArrival ? "Evening exploration with dinner" : "Strategic sightseeing tour",
          "Luggage storage included"
        ],
        cost: "€45-85",
        duration: isEveningArrival ? "3 hours" : "4 hours",
        totalTime: isEveningArrival ? "Total time: 3 hours" : "Total time: 4 hours",
        energyLevel: "Moderate activity",
        comfortLevel: "Comfort",
        confidenceScore: 70,
        stressLevel: isHighEnergy ? "Low" as const : "Moderate" as const,
        recommended: isHighEnergy && preferences.transitStyle === 'scenic-route',
        summary: isEveningArrival ? 
          "Memorable evening exploration, focusing on the illuminated historic centers and authentic local dining." :
          "Strategic daytime sightseeing, focusing on the main landmarks and authentic local experiences.",
        confidence: 'medium' as const,
        uncertainties: isEveningArrival ? 
          ["Weather conditions for walking", "Restaurant availability", "Personal energy levels after flight"] :
          ["Luggage storage availability", "Attraction opening hours", "Walking distances with luggage"],
        fallbackSuggestion: isEveningArrival ?
          "If you're too tired for exploration, there are excellent airport hotels nearby for a comfortable overnight stay." :
          "If exploration feels too ambitious, direct transfer to your accommodation ensures you arrive refreshed."
      },
      {
        id: "overnight-recovery",
        title: "Airport Hotel Refresh",
        description: "Overnight stay at airport hotel for maximum recovery before city exploration",
        timelineItems: [
          {
            time: flightDetails.stops[0]?.arrivalTime || "15:30",
            title: "Airport Hotel Check-in",
            description: "Quick transfer to nearby airport hotel for rest and recovery",
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.stops[0]?.arrivalTime || "15:30", 30),
            title: "Rest & Refresh",
            description: "Shower, rest, and prepare for next day's activities",
            type: "secondary"
          },
          {
            time: "08:00",
            title: "Hotel Breakfast",
            description: "Leisurely breakfast and final preparations",
            type: "accent"
          },
          {
            time: "10:00",
            title: `Continue to final destination`,
            description: "Well-rested transfer to city accommodation",
            type: "primary"
          }
        ],
        highlights: [
          "Complete rest and recovery overnight",
          "Airport hotel convenience",
          "Fresh start for city exploration"
        ],
        cost: "€120-180",
        duration: "Overnight",
        totalTime: "Total time: Overnight stay",
        energyLevel: "Minimal activity",
        comfortLevel: "High comfort",
        confidenceScore: 95,
        stressLevel: "Minimal" as const,
        recommended: !isHighEnergy && isComfortFocused && isEveningArrival,
        summary: "Complete overnight recovery with premium accommodation, allowing maximum rest before city exploration.",
        confidence: 'high' as const,
        uncertainties: ["Hotel room availability", "Airport hotel pricing fluctuations"],
        fallbackSuggestion: "If airport hotels are fully booked, nearby city hotels offer similar convenience with shuttle services."
      }
    ],
    finalRecommendation: {
      optionId: preferences.transitStyle === 'scenic-route' && isHighEnergy 
        ? "strategic-stopover" 
        : !isHighEnergy && isComfortFocused && isEveningArrival 
        ? "overnight-recovery" 
        : "direct-transfer",
      reasoning: `Based on your ${preferences.activities < 3 ? 'lower energy level' : 'high energy level'} and ${preferences.budget >= 4 ? 'comfort-focused' : 'budget-conscious'} preferences, ${
        preferences.transitStyle === 'scenic-route' && isHighEnergy ? 'the strategic exploration option gives you the perfect balance of sightseeing and efficiency' :
        !isHighEnergy && isComfortFocused && isEveningArrival ? 'an overnight stay will leave you completely refreshed for your next day' :
        'the direct transfer option provides the best balance of cost, comfort, and simplicity for your situation'
      }.`,
      confidence: preferences.transitStyle === 'scenic-route' && isHighEnergy ? 85 : 
                  !isHighEnergy && isComfortFocused && isEveningArrival ? 90 : 80
    },
    userContext: {
      travelingSituation: `Travelling from ${flightDetails.from} with ${flightDetails.adults + flightDetails.children} traveler(s) and ${flightDetails.luggageCount} piece(s) of luggage, departing at ${flightDetails.departureTime} and needing to reach ${flightDetails.stops[0]?.location || 'destination'} by ${flightDetails.stops[0]?.arrivalTime || 'scheduled time'}.`,
      preferences: `You prefer ${preferences.transitStyle === 'fast-track' ? 'quick and efficient travel' : preferences.transitStyle === 'scenic-route' ? 'exploring and experiencing local culture' : 'simple, straightforward options'} with a ${preferences.budget >= 4 ? 'comfort-focused' : preferences.budget >= 3 ? 'balanced' : 'budget-conscious'} approach and ${preferences.activities >= 4 ? 'high' : preferences.activities >= 2 ? 'moderate' : 'low'} energy levels.`,
      constraints: `Time window of ${calculateTimeDifference(flightDetails.departureTime, flightDetails.stops[0]?.arrivalTime || '15:30')} between departure and first destination, ${isEveningDeparture ? 'evening departure time' : 'daytime departure providing good flexibility'}, and managing ${flightDetails.luggageCount} piece(s) of luggage during transit.`
    }
  };
}

function calculateTimeDifference(startTime: string, endTime: string): string {
  const [startHours, startMins] = startTime.split(':').map(Number);
  const [endHours, endMins] = endTime.split(':').map(Number);
  
  let diffHours = endHours - startHours;
  let diffMins = endMins - startMins;
  
  if (diffMins < 0) {
    diffMins += 60;
    diffHours -= 1;
  }
  
  if (diffHours < 0) {
    diffHours += 24;
  }
  
  return `${diffHours}h ${diffMins}m`;
}

function addMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins + minutes);
  return date.toTimeString().slice(0, 5);
}

function subtractMinutes(time: string, minutes: number): string {
  const [hours, mins] = time.split(':').map(Number);
  const date = new Date();
  date.setHours(hours, mins - minutes);
  return date.toTimeString().slice(0, 5);
}