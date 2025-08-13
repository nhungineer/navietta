import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';

export function FeedbackSection() {
  const [feedback, setFeedback] = useState('');

  const handleSubmit = () => {
    // TODO: Implement feedback submission
    console.log('Feedback submitted:', feedback);
    setFeedback('');
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
            disabled={!feedback.trim()}
            className="bg-primary text-white hover:bg-primary/90"
            data-testid="button-submit-feedback"
          >
            <Send size={16} className="mr-2" />
            Send
          </Button>
        </div>
      </div>
    </div>
  );
}