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
  };
  optionLetter: string;
  isRecommended?: boolean;
}

export function OptionExplorationCard({ option, optionLetter, isRecommended = false }: OptionExplorationCardProps) {
  return (
    <div className={`
      bg-white rounded-lg p-4 space-y-3 relative
      ${isRecommended ? 'border-2 border-green-500' : 'border border-gray-200'}
    `}>
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-gray-300 text-gray-600 px-2 py-1 rounded text-xs font-medium">
          Option {optionLetter}
        </span>
        {isRecommended && (
          <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs font-medium">
            Recommended
          </span>
        )}
      </div>

      {/* Title */}
      <h3 className="font-semibold text-base text-textPrimary mb-2">
        {option.title}
      </h3>

      {/* Time and Cost Row */}
      <div className="flex items-center gap-4 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-gray-400 rounded-full flex items-center justify-center">
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <span className="text-sm text-textPrimary">{option.totalTime}</span>
        </div>
        <span className="text-sm text-textSecondary">{option.cost}</span>
      </div>

      {/* Summary */}
      <div className="mb-3">
        <h4 className="text-sm font-medium text-textPrimary mb-1">Summary</h4>
        <p className="text-xs text-textSecondary leading-relaxed">
          {option.summary || option.description}
        </p>
      </div>

      {/* Comfort Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-2">
          <span className="text-xs text-textSecondary">Comfort</span>
          <span className="text-xs text-textSecondary">{option.confidenceScore}%</span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div 
            className="bg-primary h-2 rounded-full transition-all duration-300" 
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
              className={`w-4 h-2 rounded ${
                i < Math.floor(option.confidenceScore / 20) ? 'bg-primary' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
        <p className="text-xs text-textSecondary">
          Reason for confidence level and where there might be gaps, max 2 lines
        </p>
      </div>
    </div>
  );
}