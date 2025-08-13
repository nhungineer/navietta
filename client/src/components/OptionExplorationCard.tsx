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
  };
  optionLetter: string;
  isRecommended?: boolean;
}

export function OptionExplorationCard({ option, optionLetter, isRecommended = false }: OptionExplorationCardProps) {
  return (
    <div className={`
      bg-white rounded-lg p-4 space-y-4 relative
      ${isRecommended ? 'border-2 border-green-500' : 'border border-gray-200'}
    `}>
      {/* Recommended Ribbon */}
      {isRecommended && (
        <div className="absolute top-0 right-0 bg-green-100 text-green-800 px-3 py-1 rounded-bl text-sm font-medium">
          Recommended
        </div>
      )}

      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <span className="bg-gray-300 text-gray-600 px-3 py-1 rounded text-sm font-medium">
          Option {optionLetter}
        </span>
      </div>

      {/* Title */}
      <h3 className="font-semibold text-lg text-textPrimary mb-2">
        {option.title}
      </h3>

      {/* Description */}
      <p className="text-sm text-textSecondary mb-4">
        {option.description}
      </p>

      {/* Highlights */}
      <div className="space-y-2 mb-4">
        {option.highlights.map((highlight, index) => (
          <div key={index} className="flex items-start gap-2">
            <div className="w-1.5 h-1.5 bg-textPrimary rounded-full mt-2 flex-shrink-0" />
            <span className="text-sm text-textPrimary">{highlight}</span>
          </div>
        ))}
      </div>

      {/* Time and Cost */}
      <div className="space-y-1 mb-4">
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-gray-400 rounded-full flex items-center justify-center">
            <div className="w-2 h-2 bg-white rounded-full" />
          </div>
          <span className="text-sm text-textPrimary">{option.totalTime}</span>
        </div>
        <div className="text-sm text-textSecondary ml-6">{option.cost}</div>
      </div>

      {/* Comfort Progress Bar */}
      <div className="mb-3">
        <div className="flex justify-between items-center mb-1">
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
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-textSecondary">Confidence level</span>
          <span className={`text-xs px-2 py-0.5 rounded ${
            option.confidenceScore >= 80 ? 'bg-green-100 text-green-800' :
            option.confidenceScore >= 60 ? 'bg-yellow-100 text-yellow-800' : 
            'bg-red-100 text-red-800'
          }`}>
            {option.confidenceScore >= 80 ? 'High' : option.confidenceScore >= 60 ? 'Medium' : 'Low'}
          </span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 5 }, (_, i) => (
            <div 
              key={i} 
              className={`w-3 h-2 rounded ${
                i < Math.floor(option.confidenceScore / 20) ? 'bg-primary' : 'bg-gray-200'
              }`} 
            />
          ))}
        </div>
      </div>

      {/* Description Text - Moved Below */}
      <div className="text-xs text-textSecondary">
        {option.description.length > 80 ? option.description.substring(0, 80) + '...' : 'Travel details and considerations for this option'}
      </div>
    </div>
  );
}