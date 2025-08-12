interface FlightDetails {
  from: string;
  to: string;
  departureTime: string;
  arrivalTime: string;
  departureDate: string;
  arrivalDate: string;
  adults: number;
  children: number;
  luggageCount: number;
  nextStop: string;
  nextStopTime: string;
  transportMode: 'flight' | 'taxi' | 'train' | 'bus' | 'hired_car' | 'other';
}

interface Preferences {
  budgetComfort: number;
  energyLevel: number;
  transitStyle: 'opportunity_maximiser' | 'direct' | 'scenic' | 'budget' | 'comfortable';
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
    timelineItems: Array<{
      time: string;
      title: string;
      description: string;
      type: 'primary' | 'accent' | 'secondary';
    }>;
    cost: string;
    duration: string;
    energyLevel: string;
    comfortScore: number;
    recommended: boolean;
  }>;
}

export async function generateMockTravelRecommendations(
  flightDetails: FlightDetails,
  preferences: Preferences
): Promise<TravelRecommendations> {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 2000));

  const isHighEnergy = preferences.energyLevel > 60;
  const isComfortFocused = preferences.budgetComfort > 60;
  const arrivalHour = parseInt(flightDetails.arrivalTime.split(':')[0]);
  const isEveningArrival = arrivalHour >= 18;

  return {
    reasoning: {
      situationAssessment: `Arriving at ${flightDetails.arrivalTime} in ${flightDetails.to} with ${isEveningArrival ? 'evening' : 'daytime'} arrival. You have ${flightDetails.luggageCount} piece(s) of luggage and need to reach ${flightDetails.nextStop} by ${flightDetails.nextStopTime}. ${isHighEnergy ? 'Your high energy level suggests you can handle more complex transit options.' : 'Your lower energy level indicates you prefer simpler, more direct options.'}`,
      
      generatingOptions: `Considering ${preferences.transitStyle} style preferences and ${isComfortFocused ? 'comfort-focused' : 'budget-conscious'} approach. Evaluating direct transfers, overnight stays, and exploration opportunities based on your ${flightDetails.arrivalTime} arrival time.`,
      
      tradeOffAnalysis: `Balancing your ${preferences.budgetComfort}/100 comfort preference with ${preferences.energyLevel}/100 energy level. ${isEveningArrival ? 'Evening arrival limits exploration but offers good rest options.' : 'Daytime arrival provides more flexibility for activities.'} Time window to ${flightDetails.nextStop} allows for ${preferences.transitStyle === 'opportunity_maximiser' ? 'strategic sightseeing' : 'focused transport'}.`
    },
    options: [
      {
        id: "direct-transfer",
        title: isEveningArrival ? "Direct Evening Transfer" : "Express City Transfer",
        description: isEveningArrival 
          ? "Swift airport to accommodation transfer with minimal stops, perfect for tired travelers"
          : "Efficient city center route with premium transport options",
        timelineItems: [
          {
            time: flightDetails.arrivalTime,
            title: "Land & Collect Luggage",
            description: `Arrive at ${flightDetails.to} airport, collect ${flightDetails.luggageCount} piece(s) of luggage`,
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, 45),
            title: isComfortFocused ? "Private Transfer" : "Express Train/Bus",
            description: isComfortFocused 
              ? "Pre-booked private car with luggage assistance" 
              : "Fast public transport to city center",
            type: "accent"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, isComfortFocused ? 90 : 75),
            title: `Arrive at ${flightDetails.nextStop}`,
            description: "Check in and settle in comfortably",
            type: "secondary"
          }
        ],
        cost: isComfortFocused ? "€80-120" : "€25-45",
        duration: `Total time: ${isComfortFocused ? '90' : '75'} minutes`,
        energyLevel: "Low stress",
        comfortScore: isComfortFocused ? 90 : 75,
        recommended: !isHighEnergy || preferences.transitStyle === 'direct'
      },
      {
        id: "strategic-stopover",
        title: isEveningArrival ? "Evening Exploration" : "Strategic City Tour",
        description: isEveningArrival
          ? "Quick evening highlights tour before settling in"
          : "Curated sightseeing route to key landmarks en route to accommodation",
        timelineItems: [
          {
            time: flightDetails.arrivalTime,
            title: "Arrival & Luggage Storage",
            description: `Store luggage at ${flightDetails.to} airport or central location`,
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, 60),
            title: isEveningArrival ? "Evening Walk" : "Key Landmarks",
            description: isEveningArrival 
              ? "Atmospheric evening stroll through historic center" 
              : "Visit 2-3 must-see attractions with efficient routing",
            type: "accent"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, isEveningArrival ? 120 : 180),
            title: "Dinner & Culture",
            description: isEveningArrival 
              ? "Traditional local dinner experience" 
              : "Local lunch and brief cultural immersion",
            type: "secondary"
          },
          {
            time: subtractMinutes(flightDetails.nextStopTime, 30),
            title: `Head to ${flightDetails.nextStop}`,
            description: "Collect luggage and transfer to accommodation",
            type: "primary"
          }
        ],
        cost: "€45-85",
        duration: isEveningArrival ? "Total time: 3 hours" : "Total time: 4 hours",
        energyLevel: isHighEnergy ? "Medium stress" : "High stress",
        comfortScore: 70,
        recommended: isHighEnergy && (preferences.transitStyle === 'opportunity_maximiser' || preferences.transitStyle === 'scenic')
      },
      {
        id: "overnight-recovery",
        title: "Airport Hotel Refresh",
        description: "Overnight stay at airport hotel for maximum recovery before city exploration",
        timelineItems: [
          {
            time: flightDetails.arrivalTime,
            title: "Airport Hotel Check-in",
            description: "Quick transfer to nearby airport hotel for rest and recovery",
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, 30),
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
            title: `Transfer to ${flightDetails.nextStop}`,
            description: "Well-rested transfer to city accommodation",
            type: "primary"
          }
        ],
        cost: "€120-180",
        duration: "Total time: Overnight",
        energyLevel: "No stress",
        comfortScore: 95,
        recommended: !isHighEnergy && isComfortFocused && isEveningArrival
      }
    ]
  };
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