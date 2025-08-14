import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle } from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import ReactMarkdown from 'react-markdown';

// Helper function to convert bullet points and improve markdown formatting
function preprocessMarkdown(text: string): string {
  return text
    // Convert bullet points (•) to markdown list items
    .replace(/^•\s+/gm, '- ')
    // Convert numbered items with bullet points
    .replace(/(\d+\.\s+)•\s+/g, '$1')
    // Ensure proper spacing around lists
    .replace(/^-\s+/gm, '\n- ')
    .replace(/^\n+/, '') // Remove leading newlines
    .trim();
}

interface FeedbackSectionProps {
  sessionId: string;
}

export function FeedbackSection({ sessionId }: FeedbackSectionProps) {
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
      // Call the unified Claude API for contextual responses
      const response = await apiRequest('POST', '/api/travel/chat', {
        sessionId,
        question: userQuestion,
        conversationHistory: conversations
      });

      const data = await response.json();
      const aiResponse = data.response || "I'm sorry, I couldn't generate a response. Please try again.";
      
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
        updated[updated.length - 1].response = "I'm sorry, I encountered an error while processing your question. Please try again or rephrase your question.";
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
                  <div className="text-sm text-textPrimary bg-blue-50 rounded-lg p-3 flex-1 prose prose-sm max-w-none">
                    <ReactMarkdown
                      components={{
                        p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
                        strong: ({ children }) => <strong className="font-semibold text-textPrimary">{children}</strong>,
                        em: ({ children }) => <em className="italic">{children}</em>,
                        ul: ({ children }) => <ul className="list-disc list-inside mb-3 ml-2 space-y-1">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal list-inside mb-3 ml-2 space-y-1">{children}</ol>,
                        li: ({ children }) => <li className="text-textPrimary">{children}</li>,
                        h1: ({ children }) => <h1 className="text-lg font-semibold mb-2 text-textPrimary">{children}</h1>,
                        h2: ({ children }) => <h2 className="text-base font-semibold mb-2 text-textPrimary">{children}</h2>,
                        h3: ({ children }) => <h3 className="text-sm font-semibold mb-1 text-textPrimary">{children}</h3>,
                      }}
                    >
                      {preprocessMarkdown(conv.response)}
                    </ReactMarkdown>
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