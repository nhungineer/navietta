/**
 * Client-side validation utilities for location and journey validation
 */

interface LocationValidationResponse {
  success: boolean;
  location?: {
    name: string;
    fullName: string;
    lat: number;
    lng: number;
    country: string;
    region?: string;
  };
  error?: string;
  suggestions?: string[];
}

interface JourneyValidationResponse {
  success: boolean;
  fromLocation?: {
    name: string;
    fullName: string;
    lat: number;
    lng: number;
    country: string;
    region?: string;
  };
  toLocation?: {
    name: string;
    fullName: string;
    lat: number;
    lng: number;
    country: string;
    region?: string;
  };
  distance?: number;
  error?: string;
}

/**
 * Validate a single location
 */
export async function validateLocation(location: string): Promise<LocationValidationResponse> {
  try {
    const response = await fetch('/api/validation/location', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ location })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Location validation error:', error);
    return {
      success: false,
      error: 'Unable to validate location. Please check your internet connection.'
    };
  }
}

/**
 * Validate a journey between two locations
 */
export async function validateJourney(
  fromLocation: string,
  toLocation: string,
  departureTime: string,
  arrivalTime: string
): Promise<JourneyValidationResponse> {
  try {
    const response = await fetch('/api/validation/journey', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        fromLocation,
        toLocation,
        departureTime,
        arrivalTime
      })
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Journey validation error:', error);
    return {
      success: false,
      error: 'Unable to validate journey. Please check your internet connection.'
    };
  }
}

/**
 * Debounce function for validation calls
 */
export function debounce<T extends (...args: any[]) => void>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

export type { LocationValidationResponse, JourneyValidationResponse };