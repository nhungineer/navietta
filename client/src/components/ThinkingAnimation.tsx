import { useEffect, useState } from 'react';
import { Brain, Search, CheckCircle, Loader2 } from 'lucide-react';

interface ThinkingAnimationProps {
  onComplete?: () => void;
}

const thinkingStages = [
  {
    id: 'assessment',
    title: 'Analyzing your situation...',
    description: 'Understanding your flight details, preferences, and constraints',
    icon: Brain,
    duration: 3000
  },
  {
    id: 'generating',
    title: 'Generating travel options...',
    description: 'Exploring routes, timing, and experiences that match your style',
    icon: Search,
    duration: 4000
  },
  {
    id: 'analyzing',
    title: 'Weighing trade-offs...',
    description: 'Balancing your budget, energy level, and time preferences',
    icon: CheckCircle,
    duration: 3000
  }
];

export function ThinkingAnimation({ onComplete }: ThinkingAnimationProps) {
  const [currentStage, setCurrentStage] = useState(0);
  const [completedStages, setCompletedStages] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (currentStage >= thinkingStages.length) {
      onComplete?.();
      return;
    }

    const timer = setTimeout(() => {
      setCompletedStages(prev => new Set([...Array.from(prev), currentStage]));
      setCurrentStage(prev => prev + 1);
    }, thinkingStages[currentStage].duration);

    return () => clearTimeout(timer);
  }, [currentStage, onComplete]);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-3 bg-primary/10 px-6 py-3 rounded-full">
          <Brain className="text-primary animate-pulse" size={24} />
          <span className="text-lg font-medium text-textPrimary">
            Navietta is thinking...
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {thinkingStages.map((stage, index) => {
          const isActive = index === currentStage;
          const isCompleted = completedStages.has(index);
          const isPending = index > currentStage;

          const IconComponent = stage.icon;

          return (
            <div
              key={stage.id}
              className={`
                flex items-start gap-4 p-4 rounded-lg border transition-all duration-500
                ${isActive ? 'border-primary bg-primary/5 animate-scaleIn' : ''}
                ${isCompleted ? 'border-green-200 bg-green-50' : ''}
                ${isPending ? 'border-gray-200 bg-gray-50 opacity-60' : ''}
              `}
            >
              <div className={`
                flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300
                ${isActive ? 'bg-primary text-white' : ''}
                ${isCompleted ? 'bg-green-500 text-white' : ''}
                ${isPending ? 'bg-gray-200 text-gray-400' : ''}
              `}>
                {isActive && <Loader2 className="animate-spin" size={20} />}
                {isCompleted && <CheckCircle size={20} />}
                {isPending && <IconComponent size={20} />}
              </div>

              <div className="flex-1 min-w-0">
                <h3 className={`
                  text-lg font-medium transition-colors duration-300
                  ${isActive || isCompleted ? 'text-textPrimary' : 'text-textSecondary'}
                `}>
                  {stage.title}
                </h3>
                <p className={`
                  text-sm mt-1 transition-colors duration-300
                  ${isActive || isCompleted ? 'text-textSecondary' : 'text-gray-400'}
                `}>
                  {stage.description}
                </p>

                {isActive && (
                  <div className="mt-3">
                    <div className="h-1 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full animate-progress" />
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="text-center text-sm text-textSecondary mt-6">
        <p>This usually takes about 10-15 seconds</p>
      </div>


    </div>
  );
}