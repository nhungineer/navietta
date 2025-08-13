import { Check } from 'lucide-react';

interface RecommendationCardProps {
  finalRecommendation: {
    optionId: string;
    reasoning: string;
    confidence: number;
  };
  options: Array<{
    id: string;
    title: string;
    description: string;
  }>;
}

export function RecommendationCard({ finalRecommendation, options }: RecommendationCardProps) {
  const recommendedOption = options.find(opt => opt.id === finalRecommendation.optionId);
  
  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-100 text-green-800';
    if (confidence >= 60) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
            <Check className="text-white" size={14} />
          </div>
          <h3 className="text-lg font-semibold text-textPrimary">Recommendation</h3>
        </div>
        
        <div className={`px-3 py-1 rounded-full text-sm font-medium ${getConfidenceColor(finalRecommendation.confidence)}`}>
          {finalRecommendation.confidence}% Confidence
        </div>
      </div>
      
      {recommendedOption && (
        <div className="mb-4">
          <h4 className="font-medium text-textPrimary mb-2">{recommendedOption.title}</h4>
          <p className="text-sm text-textSecondary mb-3">{recommendedOption.description}</p>
        </div>
      )}
      
      <p className="text-sm text-textPrimary leading-relaxed">
        {finalRecommendation.reasoning}
      </p>
    </div>
  );
}