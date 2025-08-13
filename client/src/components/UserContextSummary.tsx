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
        <span> travelling from <strong>{flightDetails.from}</strong> to <strong>{flightDetails.to}</strong>, arriving at <strong>{flightDetails.arrivalTime} on {formatDate(flightDetails.arrivalDate)}</strong>.</span>
      </div>
      
      <div className="text-sm text-gray-700">
        Next stop is <strong>{flightDetails.nextStop}</strong> at <strong>{flightDetails.nextStopTime}</strong> by <strong>{flightDetails.transportMode.replace('_', ' ')}</strong>.
      </div>
    </div>
  );
}