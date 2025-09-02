/**
 * Location validation service using GeoNames API
 * Provides location lookup, coordinate retrieval, and travel time validation
 */

interface GeoNamesResult {
  name: string;
  countryName: string;
  lat: string;
  lng: string;
  fcode: string;
  adminName1?: string;
  population?: number;
}

interface LocationInfo {
  name: string;
  fullName: string;
  lat: number;
  lng: number;
  country: string;
  region?: string;
}

interface ValidationResult {
  isValid: boolean;
  location?: LocationInfo;
  error?: string;
  suggestions?: string[];
}

/**
 * Haversine formula to calculate distance between two points on Earth
 * Returns distance in kilometers
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRadians(lat2 - lat1);
  const dLon = toRadians(lon2 - lon1);
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180);
}

/**
 * Validate travel time between two locations
 */
function validateTravelTime(
  distance: number,
  departureTime: Date,
  arrivalTime: Date
): { isValid: boolean; error?: string } {
  const timeDiff = arrivalTime.getTime() - departureTime.getTime();
  const hoursDiff = timeDiff / (1000 * 60 * 60);
  
  // Minimum realistic speeds (km/h)
  const MIN_SPEED_WALKING = 3;
  const MIN_SPEED_GROUND = 30;  // Bus/train minimum
  const MIN_SPEED_AIR = 200;    // Slower aircraft
  
  // Maximum realistic speeds (km/h)
  const MAX_SPEED_GROUND = 300; // High-speed rail
  const MAX_SPEED_AIR = 1000;   // Commercial aircraft
  
  if (hoursDiff <= 0) {
    return {
      isValid: false,
      error: "Arrival time must be after departure time"
    };
  }
  
  const speed = distance / hoursDiff;
  
  // For short distances (under 50km), allow walking/local transport
  if (distance < 50) {
    if (speed < MIN_SPEED_WALKING) {
      return {
        isValid: false,
        error: "This journey appears to exceed realistic travel times. Please check your departure/arrival times"
      };
    }
    return { isValid: true };
  }
  
  // For medium distances (50-500km), ground transport is realistic
  if (distance < 500) {
    if (speed < MIN_SPEED_GROUND || speed > MAX_SPEED_AIR) {
      return {
        isValid: false,
        error: "This journey appears to exceed realistic travel times. Please check your departure/arrival times"
      };
    }
    return { isValid: true };
  }
  
  // For long distances (500km+), air travel is expected
  if (speed < MIN_SPEED_GROUND || speed > MAX_SPEED_AIR) {
    return {
      isValid: false,
      error: "This journey appears to exceed realistic travel times. Please check your departure/arrival times"
    };
  }
  
  return { isValid: true };
}

/**
 * Fallback location database for development testing
 */
const FALLBACK_LOCATIONS: Record<string, LocationInfo> = {
  'london': {
    name: 'London',
    fullName: 'London, United Kingdom',
    lat: 51.5074,
    lng: -0.1278,
    country: 'United Kingdom'
  },
  'paris': {
    name: 'Paris',
    fullName: 'Paris, France',
    lat: 48.8566,
    lng: 2.3522,
    country: 'France'
  },
  'new york': {
    name: 'New York',
    fullName: 'New York, United States',
    lat: 40.7128,
    lng: -74.0060,
    country: 'United States'
  },
  'tokyo': {
    name: 'Tokyo',
    fullName: 'Tokyo, Japan',
    lat: 35.6762,
    lng: 139.6503,
    country: 'Japan'
  },
  'sydney': {
    name: 'Sydney',
    fullName: 'Sydney, Australia',
    lat: -33.8688,
    lng: 151.2093,
    country: 'Australia'
  },
  'melbourne': {
    name: 'Melbourne',
    fullName: 'Melbourne, Australia',
    lat: -37.8136,
    lng: 144.9631,
    country: 'Australia'
  },
  'hong kong': {
    name: 'Hong Kong',
    fullName: 'Hong Kong, China',
    lat: 22.3193,
    lng: 114.1694,
    country: 'China'
  }
};

/**
 * Validate location using GeoNames API with fallback
 */
async function validateLocation(locationName: string): Promise<ValidationResult> {
  try {
    // Clean and prepare the location name for search
    const cleanName = locationName.trim().replace(/\s+/g, ' ');
    
    // For development, we'll use the free GeoNames API
    // In production, you'd want to use a registered username
    const username = process.env.GEONAMES_USERNAME || 'demo';
    const url = `http://api.geonames.org/searchJSON?q=${encodeURIComponent(cleanName)}&maxRows=5&username=${username}&featureClass=P&featureClass=A`;
    
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`GeoNames API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    if (data.status) {
      // API returned an error (e.g., rate limit) - try fallback
      return validateLocationFallback(cleanName);
    }
    
    if (!data.geonames || data.geonames.length === 0) {
      return {
        isValid: false,
        error: `I cannot locate "${locationName}". Please verify the spelling or provide more details.`,
        suggestions: []
      };
    }
    
    // Find the best match (highest population or most relevant feature)
    const bestMatch = data.geonames.reduce((best: GeoNamesResult, current: GeoNamesResult) => {
      // Prefer populated places (cities, towns) over administrative areas
      if (current.fcode?.startsWith('PPL') && !best.fcode?.startsWith('PPL')) {
        return current;
      }
      
      // If both are populated places, prefer higher population
      if (current.fcode?.startsWith('PPL') && best.fcode?.startsWith('PPL')) {
        const currentPop = parseInt(current.population?.toString() || '0');
        const bestPop = parseInt(best.population?.toString() || '0');
        return currentPop > bestPop ? current : best;
      }
      
      return best;
    });
    
    const locationInfo: LocationInfo = {
      name: bestMatch.name,
      fullName: `${bestMatch.name}, ${bestMatch.countryName}${bestMatch.adminName1 ? `, ${bestMatch.adminName1}` : ''}`,
      lat: parseFloat(bestMatch.lat),
      lng: parseFloat(bestMatch.lng),
      country: bestMatch.countryName,
      region: bestMatch.adminName1
    };
    
    // Generate suggestions from other results
    const suggestions = data.geonames
      .slice(0, 3)
      .filter((result: GeoNamesResult) => result.name !== bestMatch.name)
      .map((result: GeoNamesResult) => 
        `${result.name}, ${result.countryName}${result.adminName1 ? `, ${result.adminName1}` : ''}`
      );
    
    return {
      isValid: true,
      location: locationInfo,
      suggestions
    };
    
  } catch (error) {
    console.error('Location validation error:', error);
    // Try fallback validation
    return validateLocationFallback(locationName);
  }
}

/**
 * Fallback validation using local database
 */
function validateLocationFallback(locationName: string): ValidationResult {
  const cleanName = locationName.toLowerCase().trim();
  
  // Direct match
  if (FALLBACK_LOCATIONS[cleanName]) {
    return {
      isValid: true,
      location: FALLBACK_LOCATIONS[cleanName],
      suggestions: []
    };
  }
  
  // Partial match
  const partialMatches = Object.keys(FALLBACK_LOCATIONS).filter(key => 
    key.includes(cleanName) || cleanName.includes(key)
  );
  
  if (partialMatches.length > 0) {
    return {
      isValid: true,
      location: FALLBACK_LOCATIONS[partialMatches[0]],
      suggestions: partialMatches.slice(1).map(key => FALLBACK_LOCATIONS[key].fullName)
    };
  }
  
  // No match found
  const suggestions = Object.values(FALLBACK_LOCATIONS)
    .slice(0, 3)
    .map(loc => loc.fullName);
    
  return {
    isValid: false,
    error: `I cannot locate "${locationName}". Please verify the spelling or provide more details.`,
    suggestions
  };
}

/**
 * Validate journey between two locations with travel times
 */
async function validateJourney(
  fromLocation: string,
  toLocation: string,
  departureTime: Date,
  arrivalTime: Date
): Promise<{
  isValid: boolean;
  fromLocationInfo?: LocationInfo;
  toLocationInfo?: LocationInfo;
  distance?: number;
  error?: string;
}> {
  try {
    // Validate both locations
    const [fromResult, toResult] = await Promise.all([
      validateLocation(fromLocation),
      validateLocation(toLocation)
    ]);
    
    if (!fromResult.isValid) {
      return {
        isValid: false,
        error: `Departure location: ${fromResult.error}`
      };
    }
    
    if (!toResult.isValid) {
      return {
        isValid: false,
        error: `Arrival location: ${toResult.error}`
      };
    }
    
    // Calculate distance between locations
    const distance = calculateDistance(
      fromResult.location!.lat,
      fromResult.location!.lng,
      toResult.location!.lat,
      toResult.location!.lng
    );
    
    // Validate travel time
    const travelValidation = validateTravelTime(distance, departureTime, arrivalTime);
    
    if (!travelValidation.isValid) {
      return {
        isValid: false,
        fromLocationInfo: fromResult.location,
        toLocationInfo: toResult.location,
        distance,
        error: travelValidation.error
      };
    }
    
    return {
      isValid: true,
      fromLocationInfo: fromResult.location,
      toLocationInfo: toResult.location,
      distance
    };
    
  } catch (error) {
    console.error('Journey validation error:', error);
    return {
      isValid: false,
      error: 'Journey validation service is temporarily unavailable. Please try again later.'
    };
  }
}

export {
  validateLocation,
  validateJourney,
  calculateDistance,
  validateTravelTime,
  type ValidationResult,
  type LocationInfo
};