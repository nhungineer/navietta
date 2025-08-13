interface OptionExplorationCardProps {
  option: {
    id: string;
    title: string;
    description: string;
    highlights: Array<string>;
    cost: string;
    duration: string;
    totalTime: string;
    energyLevel: string;
    comfortLevel: string;
    confidenceScore: number;
    stressLevel: string;
    recommended: boolean;
    summary: string;
    confidenceReason?: string;
  };
  optionLetter: string;
  isRecommended?: boolean;
}

export function OptionExplorationCard({ option, optionLetter, isRecommended = false }: OptionExplorationCardProps) {
  return (
    <div className={`
      bg-white rounded-lg p-4 space-y-3 relative
      ${isRecommended ? 'border-2 border-teal-500' : 'border border-gray-200'}
    `}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="text-gray-600 px-2 py-1 text-xs font-medium">
          Option {optionLetter}
        </span>
        {isRecommended && (
          <span className="bg-teal-100 text-teal-800 px-2 py-1 rounded text-xs font-medium">
            Recommended
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base text-textPrimary mb-3">
        {option.title}
      </h3>

      {/* Time Row */}
      <div className="flex items-center gap-2 mb-2">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <circle cx="12" cy="12" r="10"/>
          <polyline points="12,6 12,12 16,14"/>
        </svg>
        <span className="text-sm text-textPrimary">{option.totalTime}</span>
      </div>

      {/* Cost Row */}
      <div className="flex items-center gap-2 mb-3">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
          <line x1="12" y1="1" x2="12" y2="23"/>
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        <span className="text-sm text-textSecondary">{option.cost}</span>
      </div>

      {/* Summary */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-textPrimary mb-2">Summary</h4>
        <p className="text-xs text-textSecondary leading-relaxed">
          {option.summary || option.description}
        </p>
      </div>

      {/* Comfort Progress Bar */}
      <div className="mb-4">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-textSecondary">Comfort</span>
          <span className="text-xs text-textSecondary">{option.confidenceScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-teal-500 h-2 rounded-full transition-all duration-300" 
            style={{ width: `${option.confidenceScore}%` }}
          />
        </div>
      </div>

      {/* Confidence Level */}
      <div>
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-textSecondary">Confidence</span>
          <span className={`text-xs px-2 py-1 rounded ${
            option.confidenceScore >= 80 ? 'bg-green-100 text-green-800' :
            option.confidenceScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {option.confidenceScore >= 80 ? 'High' : option.confidenceScore >= 60 ? 'Medium' : 'Low'}
          </span>
        </div>
        <div className="flex gap-1 mb-2">
          {Array.from({ length: 5 }, (_, i) => (
            <div 
              key={i} 
              className={`flex-1 h-2 rounded ${
                i < Math.floor(option.confidenceScore / 20) ? 'bg-teal-500' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
        <p className="text-xs text-textSecondary">
          {option.confidenceReason || "Reason for confidence level and where there might be gaps, max 2 lines"}
        </p>
      </div>
    </div>
  );
}