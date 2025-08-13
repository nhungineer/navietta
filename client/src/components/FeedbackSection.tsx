import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle } from 'lucide-react';

export function FeedbackSection() {
  const [feedback, setFeedback] = useState('');
  const [conversations, setConversations] = useState<Array<{question: string; response: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    
    const userQuestion = feedback.trim();
    setFeedback('');
    setIsLoading(true);
    
    // Add user question to conversation
    setConversations(prev => [...prev, { question: userQuestion, response: '' }]);
    
    try {
      // Simulate AI response for now - in real implementation this would call the AI service
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate a contextual response based on the question
      let aiResponse = '';
      const lowerQuestion = userQuestion.toLowerCase();
      
      if (lowerQuestion.includes('eat') || lowerQuestion.includes('food') || lowerQuestion.includes('restaurant') || lowerQuestion.includes('lunch') || lowerQuestion.includes('dinner')) {
        aiResponse = "For dining in Rome, I'd recommend checking out the areas around your transit route. If you're taking the Leonardo Express to Termini, there are excellent restaurants near the station like Da Valentino for traditional Roman cuisine, or Mercato Centrale for a variety of food options. Would you like specific recommendations based on your timeline and location preferences?";
      } else if (lowerQuestion.includes('time') || lowerQuestion.includes('schedule')) {
        aiResponse = "I can help you adjust the timing for your options. Based on your current itinerary, we have some flexibility to modify departure times or add buffer time. What specific timing concerns do you have?";
      } else if (lowerQuestion.includes('cost') || lowerQuestion.includes('price') || lowerQuestion.includes('budget')) {
        aiResponse = "I can break down the costs for each option and suggest budget-friendly alternatives. The pricing I've provided includes transport, any entrance fees, and meal estimates. Would you like me to optimize for a specific budget range?";
      } else {
        aiResponse = "Thanks for your question! I'm here to help refine your travel plans. Could you be more specific about what aspect you'd like me to adjust - timing, activities, budget, or something else? I can provide more detailed recommendations based on your needs.";
      }
      
      // Update the last conversation entry with the response
      setConversations(prev => {
        const updated = [...prev];
        updated[updated.length - 1].response = aiResponse;
        return updated;
      });
    } catch (error) {
      console.error('Error generating response:', error);
      setConversations(prev => {
        const updated = [...prev];
        updated[updated.length - 1].response = "I'm sorry, I encountered an error. Please try asking your question again.";
        return updated;
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
          <span className="text-white text-sm">4</span>
        </div>
        <h3 className="font-medium text-textPrimary">Feedback</h3>
      </div>
      
      <p className="text-sm text-textSecondary mb-4">
        What do you think? Did I get it right? Anything else you would like to adjust for the plan?
      </p>
      
      {/* Conversation History */}
      {conversations.length > 0 && (
        <div className="space-y-4 mb-4 max-h-60 overflow-y-auto">
          {conversations.map((conv, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-start gap-2">
                <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                  <MessageCircle size={12} className="text-gray-600" />
                </div>
                <div className="text-sm text-textPrimary bg-gray-50 rounded-lg p-3 flex-1">
                  {conv.question}
                </div>
              </div>
              {conv.response && (
                <div className="flex items-start gap-2 ml-8">
                  <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-white text-xs font-medium">N</span>
                  </div>
                  <div className="text-sm text-textPrimary bg-blue-50 rounded-lg p-3 flex-1">
                    {conv.response}
                  </div>
                </div>
              )}
            </div>
          ))}
          {isLoading && (
            <div className="flex items-start gap-2 ml-8">
              <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-white text-xs font-medium">N</span>
              </div>
              <div className="text-sm text-textSecondary bg-blue-50 rounded-lg p-3 flex-1">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                  <span className="text-xs">Navietta is thinking...</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
      
      <div className="space-y-3">
        <Textarea
          placeholder="Ask Navietta anything about your travel options..."
          value={feedback}
          onChange={(e) => setFeedback(e.target.value)}
          className="min-h-[80px] resize-none"
          data-testid="textarea-feedback"
        />
        
        <div className="flex justify-end">
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || isLoading}
            className="bg-primary text-white hover:bg-primary/90"
            data-testid="button-submit-feedback"
          >
            <Send size={16} className="mr-2" />
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </div>
  );
}