import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send, MessageCircle } from 'lucide-react';

export function FeedbackSection() {
  const [feedback, setFeedback] = useState('');
  const [conversations, setConversations] = useState<Array<{question: string; response: string}>>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastContext, setLastContext] = useState<string>('');

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
      
      // Check for timeline requests first (most specific)
      if (lowerQuestion.includes('timeline') && (lowerQuestion.includes('updated') || lowerQuestion.includes('like you did') || lowerQuestion.includes('similar') || lowerQuestion.includes('format'))) {
        aiResponse = "Here's your detailed timeline in the same format:\n\n**09:15** - Exit FCO after processing (32 min from landing)\n**09:47** - Board Leonardo Express to Termini\n**10:19** - Arrive Termini, take Metro Line A to Spagna  \n**10:34** - Spanish Steps visit & photos (30 min)\n**11:04** - Walk to Trevi Fountain (8 min)\n**11:12** - Trevi Fountain visit & coin toss (25 min)\n**11:37** - Walk to Pantheon via Via del Corso (12 min)\n**11:49** - Pantheon visit - exterior & interior (30 min)\n**12:19** - Lunch at authentic Roman trattoria (45 min)\n**13:04** - Return walk to Metro station (15 min)\n**13:19** - Metro back to Termini, collect luggage\n**13:45** - Board high-speed train to Naples\n\nTotal Rome exploration: 3.5 hours with comfortable pacing!";
        setLastContext('');
      }
      // Handle follow-up responses (yes, please, more details, etc.)
      else if ((lowerQuestion.includes('yes') || lowerQuestion.includes('please') || lowerQuestion.includes('detail') || lowerQuestion.includes('more')) && lastContext) {
        if (lastContext === 'option-b-timeline') {
          aiResponse = "Perfect! Here's your detailed Option B timeline for Rome exploration:\n\n**09:15** - Exit FCO after processing (32 min from landing)\n**09:47** - Board Leonardo Express to Termini\n**10:19** - Arrive Termini, take Metro Line A to Spagna\n**10:34** - Spanish Steps & luxury shopping area (30 min)\n**11:04** - Walk to Trevi Fountain (8 min walk)\n**11:12** - Trevi Fountain visit & photos (25 min)\n**11:37** - Walk to Pantheon via Via del Corso (12 min)\n**11:49** - Pantheon exterior & interior (30 min)\n**12:19** - Lunch at Da Enzo al 29 nearby (45 min)\n**13:04** - Leisurely walk back to Metro (15 min)\n**13:19** - Return to Termini, collect bags\n**13:45** - Board train to Naples\n\nThis gives you 3.5 hours of Rome exploration with comfortable pacing!";
          setLastContext('');
        } else if (lastContext === 'rome-exploration') {
          aiResponse = "Here are more specific details for Rome city center exploration:\n\n**Key Stops:** Spanish Steps (photo op) → Trevi Fountain (must-see) → Pantheon (free entry) → Piazza Navona (if time permits)\n\n**Transport:** Metro Line A is most efficient, day pass €7 covers all trips\n\n**Dining:** Book lunch at Da Enzo al 29 (authentic, near Pantheon) or try Ginger for modern Roman cuisine\n\n**Shopping:** Via del Corso for high street, Via Condotti for luxury\n\n**Pro tips:** Download Roma Pass app for skip-the-line options, carry water bottle (free refills at fountains), wear comfortable shoes for cobblestones\n\nWould you like specific restaurant reservations or attraction timing adjustments?";
          setLastContext('');
        } else {
          aiResponse = "I'd be happy to provide more specific details! Could you clarify which aspect you'd like me to elaborate on - the timeline details, specific attractions, dining recommendations, transport connections, or cost breakdown?";
        }
      } else if (lowerQuestion.includes('option b') || lowerQuestion.includes('option 2')) {
        aiResponse = "Great choice! Option B typically focuses on balanced exploration with moderate activity levels. For the timeline, you'd have time for 2-3 key attractions with comfortable breaks. This usually includes Leonardo Express to Termini (32 min), metro to city center (15 min), visit to major sites like the Pantheon or Trevi Fountain (1-2 hours), a leisurely lunch (45 min), and return journey with buffer time. Would you like me to detail specific stops and timing?";
        setLastContext('option-b-timeline');
      } else if (lowerQuestion.includes('option a') || lowerQuestion.includes('option 1')) {
        aiResponse = "Option A is perfect for efficient transit! This focuses on getting you to your destination quickly and comfortably. The timeline includes direct transport with minimal stops, priority on convenience over exploration. You'd have Leonardo Express to Termini, quick transfer to your onward journey, with strategic rest stops. Total transit time is optimized for your schedule.";
      } else if (lowerQuestion.includes('option c') || lowerQuestion.includes('option 3')) {
        aiResponse = "Option C offers the most comprehensive experience! This gives you maximum exploration time with strategic planning. Timeline includes all major transit connections plus extended sightseeing opportunities, authentic dining experiences, and cultural immersion. Perfect if you want to make the most of your layover time.";
      } else if (lowerQuestion.includes('rome') && (lowerQuestion.includes('explore') || lowerQuestion.includes('city center') || lowerQuestion.includes('mini exploration'))) {
        aiResponse = "For Rome city center exploration, here's what I'd recommend: Take Leonardo Express to Termini (32 min) → Metro Line A to Spagna for Spanish Steps area (12 min) → Walk to Trevi Fountain (8 min) → Continue to Pantheon (12 min walk) → Lunch at traditional trattoria nearby (45 min) → Walk back via Via del Corso for shopping (15 min) → Return to Termini and onward to Naples. Total: about 4 hours with comfortable pacing. Does this timeline work for your schedule?";
        setLastContext('rome-exploration');
      } else if (lowerQuestion.includes('timeline') && (lowerQuestion.includes('detail') || lowerQuestion.includes('flesh out') || lowerQuestion.includes('specific'))) {
        aiResponse = "I'd be happy to create a detailed timeline! Based on your preferences, I can break down each segment with specific times, transport connections, activity durations, and buffer periods. For example: departure times, walking distances, attraction visit lengths, meal breaks, and return journey timing. Which option would you like me to detail further, and are there any specific activities or constraints I should factor in?";
      } else if (lowerQuestion.includes('eat') || lowerQuestion.includes('food') || lowerQuestion.includes('restaurant') || lowerQuestion.includes('lunch') || lowerQuestion.includes('dinner')) {
        aiResponse = "For dining in Rome, I'd recommend areas along your route. Near Termini: Mercato Centrale has diverse food options in a modern food hall setting. In city center: Try Da Enzo for authentic carbonara (near Pantheon), or Armando al Pantheon for traditional Roman cuisine. For quick bites: Supplizio for creative supplì, or any local bar for espresso and cornetti. Would you like recommendations based on your specific timeline and location?";
      } else if (lowerQuestion.includes('cost') || lowerQuestion.includes('price') || lowerQuestion.includes('budget')) {
        aiResponse = "I can break down the costs: Leonardo Express €14, Metro day pass €7, attraction entries €10-15 each, lunch €15-25 per person, coffee/snacks €3-5. Total for city exploration typically €50-70 per person. For budget options: use regional trains instead of express (€8), pack snacks, visit free attractions like Pantheon exterior and Trevi Fountain. Would you like a detailed cost breakdown for your preferred option?";
      } else if (lowerQuestion.includes('time') || lowerQuestion.includes('schedule') || lowerQuestion.includes('timing')) {
        aiResponse = "For timing adjustments, I can modify departure times, add buffer periods, or change activity durations. Key considerations: airport processing (1.5-2 hours), transport connections (allow 15-30 min between), attraction visits (30-90 min each), meal breaks (30-60 min). What specific timing aspect would you like to adjust - earlier departure, longer at attractions, more rest time, or tighter schedule?";
      } else {
        aiResponse = "I'm here to help optimize your travel experience! I can assist with detailed timelines, activity recommendations, cost breakdowns, transportation options, dining suggestions, or any adjustments to the proposed options. What specific aspect of your journey would you like to discuss or modify?";
        setLastContext('');
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