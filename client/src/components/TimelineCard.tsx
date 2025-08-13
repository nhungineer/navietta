import { Clock } from 'lucide-react';

interface TimelineItem {
  time: string;
  title: string;
  description: string;
  type: 'primary' | 'accent' | 'secondary';
}

interface TimelineCardProps {
  timelineItems: TimelineItem[];
}

export function TimelineCard({ timelineItems }: TimelineCardProps) {
  const getTypeColor = (type: string) => {
    switch (type) {
      case 'primary': return 'bg-primary text-white';
      case 'accent': return 'bg-blue-500 text-white';
      case 'secondary': return 'bg-gray-400 text-white';
      default: return 'bg-gray-400 text-white';
    }
  };

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
      <div className="flex items-center gap-2 mb-4">
        <Clock className="text-primary" size={16} />
        <h4 className="font-medium text-textPrimary">Recommended Timeline</h4>
      </div>
      
      <div className="space-y-3">
        {timelineItems.map((item, index) => (
          <div key={index} className="flex items-start gap-3">
            <div className={`
              flex-shrink-0 w-12 h-8 rounded flex items-center justify-center text-sm font-medium
              ${getTypeColor(item.type)}
            `}>
              {item.time}
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm text-textPrimary mb-1">
                {item.title}
              </div>
              <div className="text-xs text-textSecondary">
                {item.description}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}