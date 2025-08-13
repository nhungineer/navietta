import { useEffect, useState } from 'react';
import { useTravelContext } from '@/contexts/TravelContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Brain, Search, BarChart3, CheckCircle } from 'lucide-react';
import { ThinkingAnimation } from '@/components/ThinkingAnimation';
import { ExpandableSection } from '@/components/ExpandableSection';
import { OptionExplorationCard } from '@/components/OptionExplorationCard';
import { UserContextSummary } from '@/components/UserContextSummary';
import { RecommendationCard } from '@/components/RecommendationCard';
import { TimelineCard } from '@/components/TimelineCard';
import { FeedbackSection } from '@/components/FeedbackSection';
import { useToast } from '@/hooks/use-toast';

interface ExtendedAIRecommendations {
  reasoning: {
    situationAssessment: string;
    generatingOptions: string;
    tradeOffAnalysis: string;
  };
  options: Array<{
    id: string;
    title: string;
    description: string;
    highlights: Array<string>;
    timelineItems: Array<{
      time: string;
      title: string;
      description: string;
      type: 'primary' | 'accent' | 'secondary';
    }>;
    cost: string;
    duration: string;
    totalTime: string;
    energyLevel: string;
    comfortLevel: string;
    confidenceScore: number;
    stressLevel: 'Minimal' | 'Low' | 'Moderate' | 'High';
    recommended: boolean;
  }>;
  finalRecommendation: {
    optionId: string;
    reasoning: string;
    confidence: number;
  };
  userContext: {
    travelingSituation: string;
    preferences: string;
    constraints: string;
  };
}

export default function AIResultsPage() {
  const { flightDetails, preferences, sessionId, setSessionId, isLoading, setIsLoading } = useTravelContext();
  const [recommendations, setRecommendations] = useState<ExtendedAIRecommendations | null>(null);
  const { toast } = useToast();

  const generateRecommendationsMutation = useMutation({
    mutationFn: async () => {
      if (!flightDetails || !preferences) {
        throw new Error('Missing flight details or preferences');
      }

      const response = await apiRequest('POST', '/api/travel/generate-recommendations', {
        flightDetails,
        preferences,
      });

      return response.json();
    },
    onSuccess: (data) => {
      setSessionId(data.sessionId);
      setRecommendations(data.recommendations);
      setIsLoading(false);
    },
    onError: (error) => {
      console.error('Failed to generate recommendations:', error);
      toast({
        title: "Error",
        description: "Failed to generate travel recommendations. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    },
  });

  useEffect(() => {
    if (!recommendations && flightDetails && preferences && !isLoading) {
      setIsLoading(true);
      generateRecommendationsMutation.mutate();
    }
  }, [flightDetails, preferences]);

  if (isLoading || !recommendations) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-4xl mx-auto">
          <ThinkingAnimation />
        </div>
      </div>
    );
  }

  const recommendedOption = recommendations.options.find(
    opt => opt.id === recommendations.finalRecommendation.optionId
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        
        {/* Header */}
        <div className="flex items-center gap-3 mb-8">
          <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
            <span className="text-white text-sm">!</span>
          </div>
          <h1 className="text-2xl font-bold text-textPrimary">Navietta's Thinking Process</h1>
        </div>

        {/* User Context Summary */}
        {flightDetails && preferences && (
          <UserContextSummary 
            userContext={recommendations.userContext}
            flightDetails={flightDetails}
            preferences={preferences}
          />
        )}

        {/* Thinking Process Sections */}
        <ExpandableSection 
          title="Situation assessment" 
          icon={<span className="text-xs font-bold">1</span>}
        >
          <p className="text-sm text-textPrimary leading-relaxed">
            {recommendations.reasoning.situationAssessment}
          </p>
        </ExpandableSection>

        <ExpandableSection 
          title="Option exploration" 
          icon={<span className="text-xs font-bold">2</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-textPrimary leading-relaxed mb-4">
              {recommendations.reasoning.generatingOptions}
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {recommendations.options.map((option, index) => (
                <OptionExplorationCard
                  key={option.id}
                  option={option}
                  optionLetter={String.fromCharCode(65 + index)}
                  isRecommended={option.id === recommendations.finalRecommendation.optionId}
                />
              ))}
            </div>
          </div>
        </ExpandableSection>

        <ExpandableSection 
          title="Trade-off analysis" 
          icon={<span className="text-xs font-bold">3</span>}
        >
          <div className="space-y-4">
            <p className="text-sm text-textPrimary leading-relaxed">
              {recommendations.reasoning.tradeOffAnalysis}
            </p>
            
            {/* Budget vs Convenience Visual */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-textPrimary mb-3">Budget vs Convenience</h4>
              <div className="flex items-center gap-4">
                <span className="text-xs text-textSecondary">Save money</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${preferences?.budgetComfort || 50}%` }}
                  />
                </div>
                <span className="text-xs text-textSecondary">Max convenience</span>
              </div>
            </div>

            {/* Energy Level Visual */}
            <div className="bg-white rounded-lg p-4">
              <h4 className="font-medium text-textPrimary mb-3">Energy level</h4>
              <div className="flex items-center gap-4">
                <span className="text-xs text-textSecondary">Want to rest</span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 relative">
                  <div 
                    className="bg-blue-500 h-2 rounded-full" 
                    style={{ width: `${preferences?.energyLevel || 50}%` }}
                  />
                </div>
                <span className="text-xs text-textSecondary">Energetic</span>
              </div>
            </div>
          </div>
        </ExpandableSection>

        {/* Final Recommendation */}
        <ExpandableSection 
          title="Recommendation" 
          icon={<CheckCircle size={16} />}
          defaultExpanded
        >
          <div className="space-y-4">
            <RecommendationCard 
              finalRecommendation={recommendations.finalRecommendation}
              options={recommendations.options}
            />
            
            {recommendedOption && (
              <TimelineCard timelineItems={recommendedOption.timelineItems} />
            )}
          </div>
        </ExpandableSection>

        {/* Feedback Section */}
        <FeedbackSection />
      </div>
    </div>
  );
}