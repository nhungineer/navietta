interface UserContextSummaryProps {
  userContext: {
    travelingSituation: string;
    preferences: string;
    constraints: string;
  };
  flightDetails: any;
  preferences: any;
}

export function UserContextSummary({ userContext, flightDetails, preferences }: UserContextSummaryProps) {
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="text-sm text-gray-700 mb-3">
        <strong>Transit plan for {flightDetails.adults} adult{flightDetails.adults > 1 ? 's' : ''}</strong>
        {flightDetails.children > 0 && (
          <span> and <strong>{flightDetails.children} child{flightDetails.children > 1 ? 'ren' : ''}</strong></span>
        )}
        <span> starting from <strong>{flightDetails.from}</strong> on <strong>{flightDetails.departureTime} {formatDate(flightDetails.departureDate)}</strong>.</span>
      </div>
      
      <div className="text-sm text-gray-700">
        Transit via <strong>{flightDetails.stops[0]?.location}</strong> (arrive {flightDetails.stops[0]?.arrivalTime} on {formatDate(flightDetails.stops[0]?.arrivalDate)}) to final destination <strong>{flightDetails.stops[1]?.location}</strong> (arrive {flightDetails.stops[1]?.arrivalTime} on {formatDate(flightDetails.stops[1]?.arrivalDate)}).
      </div>
    </div>
  );
}