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
    if (!dateStr) return 'Invalid Date';
    
    // Handle ISO date strings (YYYY-MM-DD format)
    const date = new Date(dateStr + 'T00:00:00');
    
    // Check if date is valid
    if (isNaN(date.getTime())) {
      return 'Invalid Date';
    }
    
    return date.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="text-sm text-gray-700">
        <strong>Transit plan for {flightDetails.adults} adult{flightDetails.adults > 1 ? 's' : ''}</strong>
        {flightDetails.children > 0 && (
          <span> and <strong>{flightDetails.children} child{flightDetails.children > 1 ? 'ren' : ''}</strong></span>
        )}
        <span> starting from <strong>{flightDetails.from}</strong> to <strong>{flightDetails.stops[1]?.location}</strong> (arrive <strong>{flightDetails.stops[1]?.arrivalTime}</strong> on <strong>{formatDate(flightDetails.stops[1]?.arrivalDate)}</strong>) via <strong>{flightDetails.stops[0]?.location}</strong> (arrive <strong>{flightDetails.stops[0]?.arrivalTime}</strong> on <strong>{formatDate(flightDetails.stops[0]?.arrivalDate)}</strong>).</span>
      </div>
    </div>
  );
}