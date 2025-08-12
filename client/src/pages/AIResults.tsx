import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { useTravelContext } from '@/contexts/TravelContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Brain, Clock, Check, Loader2, Send, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AIRecommendations {
  reasoning: {
    situationAssessment: string;
    generatingOptions: string;
    tradeOffAnalysis: string;
  };
  options: Array<{
    id: string;
    title: string;
    description: string;
    timelineItems: Array<{
      time: string;
      title: string;
      description: string;
      type: 'primary' | 'accent' | 'secondary';
    }>;
    cost: string;
    duration: string;
    energyLevel: string;
    comfortScore: number;
    recommended: boolean;
  }>;
}

export default function AIResultsPage() {
  const { flightDetails, preferences, sessionId, setSessionId, isLoading, setIsLoading } = useTravelContext();
  const [chatInput, setChatInput] = useState('');
  const [recommendations, setRecommendations] = useState<AIRecommendations | null>(null);
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
    if (flightDetails && preferences && !recommendations) {
      setIsLoading(true);
      generateRecommendationsMutation.mutate();
    }
  }, [flightDetails, preferences]);

  const getTypeColor = (type: 'primary' | 'accent' | 'secondary') => {
    switch (type) {
      case 'primary': return 'text-primary bg-primary/10 border-primary';
      case 'accent': return 'text-accent bg-accent/10 border-accent';
      case 'secondary': return 'text-secondary bg-secondary/10 border-secondary';
    }
  };

  const getTypeColorForTimeline = (type: 'primary' | 'accent' | 'secondary') => {
    switch (type) {
      case 'primary': return 'border-primary';
      case 'accent': return 'border-accent';
      case 'secondary': return 'border-secondary';
    }
  };

  if (isLoading || !recommendations) {
    return (
      <div className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <span className="text-white font-bold">N</span>
              </div>
              <div>
                <h3 className="font-semibold text-textPrimary">Navietta AI Assistant</h3>
                <p className="text-sm text-textSecondary">Analyzing your travel situation...</p>
              </div>
            </div>
            <Bot className="text-textSecondary" size={24} />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-4">
            <Brain className="text-primary mr-2 inline" size={20} />
            AI Reasoning Process
          </h3>

          <div className="space-y-4">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                <Check className="text-white" size={12} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-textPrimary">Situation assessment</h4>
                <p className="text-sm text-textSecondary mt-1">Analyzing your arrival time, energy level, and destination requirements</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center mt-0.5">
                <Check className="text-white" size={12} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-textPrimary">Generating options</h4>
                <p className="text-sm text-textSecondary mt-1">Evaluating different routes and timing combinations</p>
              </div>
            </div>

            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-secondary rounded-full flex items-center justify-center mt-0.5 animate-pulse">
                <Loader2 className="text-white animate-spin" size={12} />
              </div>
              <div className="flex-1">
                <h4 className="font-medium text-textPrimary">Finalizing recommendations</h4>
                <p className="text-sm text-textSecondary mt-1">Creating personalized travel options...</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
              <span className="text-white font-bold">N</span>
            </div>
            <div>
              <h3 className="font-semibold text-textPrimary">Navietta AI Assistant</h3>
              <p className="text-sm text-textSecondary">Analysis complete - here are your options</p>
            </div>
          </div>
          <Bot className="text-textSecondary" size={24} />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-lg font-semibold text-textPrimary mb-4">
          <Brain className="text-primary mr-2 inline" size={20} />
          AI Reasoning Process
        </h3>

        <Accordion type="multiple" className="w-full">
          <AccordionItem value="situation-assessment">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="text-white" size={12} />
                </div>
                <h4 className="font-medium text-textPrimary">Situation assessment</h4>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-9">
                <p className="text-sm text-textSecondary">{recommendations.reasoning.situationAssessment}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="generating-options">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="text-white" size={12} />
                </div>
                <h4 className="font-medium text-textPrimary">Generating options</h4>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-9">
                <p className="text-sm text-textSecondary">{recommendations.reasoning.generatingOptions}</p>
              </div>
            </AccordionContent>
          </AccordionItem>

          <AccordionItem value="trade-off-analysis">
            <AccordionTrigger className="text-left">
              <div className="flex items-center space-x-3">
                <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                  <Check className="text-white" size={12} />
                </div>
                <h4 className="font-medium text-textPrimary">Trade-off analysis</h4>
              </div>
            </AccordionTrigger>
            <AccordionContent>
              <div className="ml-9">
                <p className="text-sm text-textSecondary">{recommendations.reasoning.tradeOffAnalysis}</p>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {recommendations.options.map((option, index) => (
          <div key={option.id} className={`bg-white rounded-xl shadow-sm p-6 ${option.recommended ? 'border-2 border-primary relative' : ''}`}>
            {option.recommended && (
              <div className="absolute -top-3 left-4 bg-primary text-white px-3 py-1 rounded-full text-sm font-medium">
                Recommended
              </div>
            )}
            <div className={option.recommended ? 'mt-2' : ''}>
              <h4 className="text-lg font-semibold text-textPrimary mb-2">{option.title}</h4>
              <p className="text-sm text-textSecondary mb-4">{option.description}</p>

              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm">
                  <Clock className="text-primary w-4" size={16} />
                  <span className="ml-2 text-textSecondary">{option.duration}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="ml-2 text-textSecondary">{option.cost}</span>
                </div>
                <div className="flex items-center text-sm">
                  <span className="ml-2 text-textSecondary">{option.energyLevel}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-textSecondary mb-4">
                <span>Comfort</span>
                <div className="flex-1 mx-2 bg-gray-200 rounded-full h-1">
                  <div 
                    className={`h-1 rounded-full ${option.recommended ? 'bg-primary' : 'bg-accent'}`}
                    style={{ width: `${option.comfortScore}%` }}
                  ></div>
                </div>
                <span>{option.comfortScore}%</span>
              </div>

              <Button 
                className={`w-full text-sm font-medium ${
                  option.recommended 
                    ? 'bg-primary text-white hover:bg-primary/90' 
                    : 'border border-accent text-accent hover:bg-accent hover:text-white'
                }`}
                variant={option.recommended ? 'default' : 'outline'}
              >
                View Details
              </Button>
            </div>
          </div>
        ))}
      </div>

      {recommendations.options[0]?.timelineItems && (
        <div className="bg-white rounded-xl shadow-sm p-6">
          <h3 className="text-lg font-semibold text-textPrimary mb-6">
            <Clock className="text-primary mr-2 inline" size={20} />
            Recommended Timeline
          </h3>

          <div className="space-y-4">
            {recommendations.options[0].timelineItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-4">
                <div className={`text-sm font-medium px-2 py-1 rounded ${getTypeColor(item.type)}`}>
                  {item.time}
                </div>
                <div className={`flex-1 border-l-2 pl-4 pb-4 ${getTypeColorForTimeline(item.type)}`}>
                  <h4 className="font-medium text-textPrimary">{item.title}</h4>
                  <p className="text-sm text-textSecondary">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm p-6">
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Ask Navietta anything about your travel options..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && setChatInput('')}
            />
          </div>
          <Button className="bg-primary text-white hover:bg-primary/90">
            <Send size={16} />
          </Button>
        </div>
      </div>
    </div>
  );
}