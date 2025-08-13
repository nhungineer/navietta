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
  transitStyle: 'quickly' | 'explore' | 'simple';
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
      situationAssessment: `I can see you're arriving at ${flightDetails.arrivalTime} in ${flightDetails.to} - that's ${isEveningArrival ? 'an evening arrival which can be tiring after a long flight' : 'a daytime arrival which gives us good flexibility'}. With ${flightDetails.luggageCount} piece${flightDetails.luggageCount > 1 ? 's' : ''} of luggage and needing to reach ${flightDetails.nextStop} by ${flightDetails.nextStopTime}, ${isHighEnergy ? "I can tell you're feeling energetic, so I'm comfortable suggesting options that involve a bit more activity." : "since you mentioned feeling less energetic, I'm focusing on straightforward options that won't wear you out further."}`,
      
      generatingOptions: `Given that you prefer ${preferences.transitStyle === 'quickly' ? 'getting there quickly' : preferences.transitStyle === 'explore' ? 'exploring along the way' : 'keeping things simple'} and you're ${isComfortFocused ? 'willing to spend a bit more for comfort' : 'looking to save money where possible'}, I'm weighing up direct transfers, potential overnight stays, and ${preferences.transitStyle === 'explore' ? 'some interesting exploration opportunities' : 'the most efficient routes'} that work with your ${flightDetails.arrivalTime} arrival.`,
      
      tradeOffAnalysis: `Since you're ${preferences.budgetComfort < 30 ? 'really focused on keeping costs down' : preferences.budgetComfort > 70 ? 'prioritizing comfort and convenience' : 'looking for a good balance between cost and comfort'} and mentioned feeling ${preferences.energyLevel < 30 ? 'quite tired' : preferences.energyLevel > 70 ? 'energetic and ready to explore' : 'moderately energetic'}, I'm ${isEveningArrival ? 'keeping in mind that evening arrivals can limit what you can realistically do, but they do offer good opportunities to rest' : 'taking advantage of your daytime arrival to give you more options'}. The time window to ${flightDetails.nextStop} ${preferences.transitStyle === 'explore' ? 'actually works well for some strategic sightseeing' : preferences.transitStyle === 'quickly' ? 'means we can focus on the most direct routes' : 'gives us room for simple, stress-free transit'}.`
    },
    options: [
      {
        id: "direct-transfer",
        title: isComfortFocused ? "Premium Direct Transfer" : "Budget-Friendly Direct Route",
        description: `This ${isComfortFocused ? 'comfortable and efficient' : 'cost-effective'} option gets you to ${flightDetails.nextStop} using ${flightDetails.transportMode.replace('_', ' ')} without any detours. ${isEveningArrival ? "Perfect since you're arriving in the evening and probably want to get to your destination without delays." : "A straightforward daytime transfer that'll get you there feeling refreshed."}`,
        timelineItems: [
          {
            time: flightDetails.arrivalTime,
            title: `Your flight lands in ${flightDetails.to}`,
            description: "Time to stretch your legs and grab your luggage",
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, 45),
            title: `Board your ${flightDetails.transportMode.replace('_', ' ')}`,
            description: isComfortFocused 
              ? "I have arranged premium service with reserved seating - relax and enjoy the ride" 
              : "Scheduled service - I would suggest arriving a few minutes early for the best seats",
            type: "accent"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, isComfortFocused ? 90 : 75),
            title: `You've made it to ${flightDetails.nextStop}!`,
            description: isComfortFocused ? "Arrive feeling refreshed and ready for what's next" : "Mission accomplished - you've saved both time and money",
            type: "secondary"
          }
        ],
        cost: isComfortFocused ? "€80-120" : "€25-45",
        duration: `Total time: ${isComfortFocused ? '90' : '75'} minutes`,
        energyLevel: "Low stress",
        comfortScore: isComfortFocused ? 90 : 75,
        recommended: !isHighEnergy || preferences.transitStyle === 'quickly' || preferences.transitStyle === 'simple'
      },
      {
        id: "strategic-stopover",
        title: isEveningArrival ? "Evening Exploration" : "Strategic City Tour",
        description: `Since you wanted to ${preferences.transitStyle === 'explore' ? 'explore along the way' : 'make the most of your time'}, this gives you ${isEveningArrival ? 'a lovely evening walk through the historic center before you settle in for the night' : 'a perfectly timed tour of the key landmarks without rushing - you will still get to your destination comfortably'}.`,
        timelineItems: [
          {
            time: flightDetails.arrivalTime,
            title: "Drop off your luggage",
            description: `I would recommend storing your ${flightDetails.luggageCount} piece${flightDetails.luggageCount > 1 ? 's' : ''} at ${flightDetails.to} airport or a central location so you can explore hands-free`,
            type: "primary"
          },
          {
            time: addMinutes(flightDetails.arrivalTime, 60),
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
            time: subtractMinutes(flightDetails.nextStopTime, 30),
            title: `Time to head to ${flightDetails.nextStop}`,
            description: "Grab your luggage and make your way to your final destination - you'll arrive with some great stories!",
            type: "primary"
          }
        ],
        cost: "€45-85",
        duration: isEveningArrival ? "Total time: 3 hours" : "Total time: 4 hours",
        energyLevel: isHighEnergy ? "Medium stress" : "High stress",
        comfortScore: 70,
        recommended: isHighEnergy && preferences.transitStyle === 'explore'
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