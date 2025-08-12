import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';

import { Carousel, CarouselContent, CarouselItem, CarouselNext, CarouselPrevious } from '@/components/ui/carousel';
import { useTravelContext } from '@/contexts/TravelContext';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Brain, Clock, Check, Loader2, Send, Bot, ChevronDown } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';

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
  const [chatMessages, setChatMessages] = useState<Array<{role: 'user' | 'assistant', content: string}>>([]);
  const [isChatLoading, setIsChatLoading] = useState(false);
  const [reasoningState, setReasoningState] = useState<{
    situationAssessment: { content: string; completed: boolean; active: boolean };
    generatingOptions: { content: string; completed: boolean; active: boolean };
    tradeOffAnalysis: { content: string; completed: boolean; active: boolean };
  }>({
    situationAssessment: { content: '', completed: false, active: false },
    generatingOptions: { content: '', completed: false, active: false },
    tradeOffAnalysis: { content: '', completed: false, active: false },
  });
  const { toast } = useToast();
  const isMobile = useIsMobile();

  const startStreamingRecommendations = async () => {
    try {
      if (!flightDetails || !preferences) {
        throw new Error('Missing flight details or preferences');
      }

      const newSessionId = sessionId || crypto.randomUUID();
      if (!sessionId) {
        setSessionId(newSessionId);
      }

      setIsLoading(true);
      setReasoningState({
        situationAssessment: { content: '', completed: false, active: false },
        generatingOptions: { content: '', completed: false, active: false },
        tradeOffAnalysis: { content: '', completed: false, active: false },
      });

      // Make POST request with streaming response
      const response = await fetch('/api/travel/generate-recommendations-stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: newSessionId,
          flightDetails,
          preferences,
        }),
      });

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.substring(6));
              handleStreamEvent(data);
            } catch (e) {
              console.log('Failed to parse line:', line);
            }
          }
        }
      }
    } catch (error) {
      console.error('Streaming error:', error);
      toast({
        title: "Error",
        description: "Failed to generate travel recommendations. Please try again.",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  };

  const handleStreamEvent = (data: any) => {
    console.log('Stream event received:', data); // Debug log
    
    if (data.stage) {
      const stageKey = data.stage.replace(/-/g, '') as keyof typeof reasoningState;
      console.log('Processing stage:', data.stage, '-> stageKey:', stageKey); // Debug log
      
      if (data.completed === undefined) {
        // This is a reasoning-start event
        console.log('Starting stage:', stageKey); // Debug log
        setReasoningState(prev => ({
          ...prev,
          [stageKey]: {
            ...prev[stageKey],
            active: true,
            content: prev[stageKey]?.content || ''
          }
        }));
      } else {
        // This is a reasoning-progress event
        console.log('Updating stage:', stageKey, 'completed:', data.completed, 'content length:', data.content?.length); // Debug log
        setReasoningState(prev => {
          const currentContent = prev[stageKey]?.content || '';
          const newContent = data.completed ? data.content : currentContent + (data.content || '');
          console.log('Current content length:', currentContent.length, 'New content length:', newContent.length); // Debug log
          
          return {
            ...prev,
            [stageKey]: {
              content: newContent,
              completed: data.completed,
              active: !data.completed
            }
          };
        });
      }
    } else if (data.recommendations) {
      console.log('Final recommendations received'); // Debug log
      setRecommendations(data.recommendations);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (flightDetails && preferences && !recommendations) {
      startStreamingRecommendations();
    }
  }, [flightDetails, preferences]);

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || !sessionId || isChatLoading) return;

    const userMessage = chatInput.trim();
    setChatInput('');
    setIsChatLoading(true);

    // Add user message to chat
    setChatMessages(prev => [...prev, { role: 'user', content: userMessage }]);

    try {
      const response = await apiRequest('POST', '/api/travel/chat', {
        sessionId,
        message: userMessage,
      });

      const data = await response.json();
      
      // Add AI response to chat
      setChatMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Chat Error",
        description: "Failed to get response from AI assistant. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsChatLoading(false);
    }
  };

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

          <div className="space-y-6">
            {/* Situation Assessment */}
            {reasoningState.situationAssessment.active || reasoningState.situationAssessment.completed ? (
              <div key="situation-assessment" className="border-l-4 border-primary pl-4 bg-blue-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    reasoningState.situationAssessment.completed ? 'bg-primary' : 'bg-accent animate-pulse'
                  }`}>
                    {reasoningState.situationAssessment.completed ? (
                      <Check className="text-white" size={12} />
                    ) : (
                      <Loader2 className="text-white animate-spin" size={12} />
                    )}
                  </div>
                  <h4 className="font-medium text-textPrimary">Situation Assessment</h4>
                </div>
                <div className="ml-9 text-sm text-textSecondary">
                  <div className="whitespace-pre-wrap min-h-[20px] font-mono">
                    {reasoningState.situationAssessment.content}
                    {!reasoningState.situationAssessment.completed && (
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1">|</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key="situation-assessment-waiting" className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white font-medium text-xs">1</span>
                  </div>
                  <h4 className="font-medium text-textSecondary">Situation Assessment</h4>
                </div>
                <div className="ml-9 text-sm text-textSecondary">
                  Waiting to start analysis...
                </div>
              </div>
            )}

            {/* Generating Options */}
            {reasoningState.generatingOptions.active || reasoningState.generatingOptions.completed ? (
              <div key="generating-options" className="border-l-4 border-primary pl-4 bg-green-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    reasoningState.generatingOptions.completed ? 'bg-primary' : 'bg-accent animate-pulse'
                  }`}>
                    {reasoningState.generatingOptions.completed ? (
                      <Check className="text-white" size={12} />
                    ) : (
                      <Loader2 className="text-white animate-spin" size={12} />
                    )}
                  </div>
                  <h4 className="font-medium text-textPrimary">Generating Options</h4>
                </div>
                <div className="ml-9 text-sm text-textSecondary">
                  <div className="whitespace-pre-wrap min-h-[20px] font-mono">
                    {reasoningState.generatingOptions.content}
                    {!reasoningState.generatingOptions.completed && (
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1">|</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key="generating-options-waiting" className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white font-medium text-xs">2</span>
                  </div>
                  <h4 className="font-medium text-textSecondary">Generating Options</h4>
                </div>
                <div className="ml-9 text-sm text-textSecondary">
                  Waiting for situation analysis to complete...
                </div>
              </div>
            )}

            {/* Trade-off Analysis */}
            {reasoningState.tradeOffAnalysis.active || reasoningState.tradeOffAnalysis.completed ? (
              <div key="trade-off-analysis" className="border-l-4 border-primary pl-4 bg-purple-50 p-4 rounded-r-lg">
                <div className="flex items-start space-x-3 mb-3">
                  <div className={`w-6 h-6 rounded-full flex items-center justify-center mt-0.5 ${
                    reasoningState.tradeOffAnalysis.completed ? 'bg-primary' : 'bg-accent animate-pulse'
                  }`}>
                    {reasoningState.tradeOffAnalysis.completed ? (
                      <Check className="text-white" size={12} />
                    ) : (
                      <Loader2 className="text-white animate-spin" size={12} />
                    )}
                  </div>
                  <h4 className="font-medium text-textPrimary">Trade-off Analysis</h4>
                </div>
                <div className="ml-9 text-sm text-textSecondary">
                  <div className="whitespace-pre-wrap min-h-[20px] font-mono">
                    {reasoningState.tradeOffAnalysis.content}
                    {!reasoningState.tradeOffAnalysis.completed && (
                      <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-1">|</span>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div key="trade-off-analysis-waiting" className="border-l-4 border-gray-200 pl-4">
                <div className="flex items-start space-x-3 mb-3">
                  <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center mt-0.5">
                    <span className="text-white font-medium text-xs">3</span>
                  </div>
                  <h4 className="font-medium text-textSecondary">Trade-off Analysis</h4>
                </div>
                <div className="ml-9 text-sm text-textSecondary">
                  Waiting for options generation to complete...
                </div>
              </div>
            )}
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

      {isMobile ? (
        <Carousel className="w-full">
          <CarouselContent className="-ml-2 md:-ml-4">
            {recommendations.options.map((option, index) => (
              <CarouselItem key={option.id} className="pl-2 md:pl-4 basis-4/5">
                <div className={`bg-white rounded-xl shadow-sm p-6 h-full ${option.recommended ? 'border-2 border-primary relative' : ''}`}>
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
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-2" />
          <CarouselNext className="right-2" />
        </Carousel>
      ) : (
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
      )}

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
        {chatMessages.length > 0 && (
          <div className="mb-6 space-y-4 max-h-64 overflow-y-auto">
            {chatMessages.map((message, index) => (
              <div key={index} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`w-[90%] px-4 py-3 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-primary text-white' 
                    : 'bg-gray-100 text-textPrimary'
                }`}>
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                </div>
              </div>
            ))}
            {isChatLoading && (
              <div className="flex justify-start">
                <div className="bg-gray-100 text-textPrimary px-4 py-2 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <Loader2 className="animate-spin" size={16} />
                    <span className="text-sm">Navietta is thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="flex items-center space-x-4">
          <div className="flex-1">
            <Input
              type="text"
              placeholder="Ask Navietta anything about your travel options..."
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleChatSubmit()}
              disabled={isChatLoading}
            />
          </div>
          <Button 
            className="bg-primary text-white hover:bg-primary/90"
            onClick={handleChatSubmit}
            disabled={isChatLoading || !chatInput.trim()}
          >
            {isChatLoading ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
          </Button>
        </div>
      </div>
    </div>
  );
}