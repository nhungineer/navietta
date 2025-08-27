import { Check, Clock, DollarSign, Battery } from 'lucide-react';

interface OptionCardProps {
  option: {
    id: string;
    title: string;
    description: string;
    highlights: Array<string>;
    cost: string;
    duration: string;
    energyLevel: string;
    comfortLevel: string;
    stressLevel: string;
    recommended: boolean;
  };
  isRecommended?: boolean;
}

export function OptionCard({ option, isRecommended = false }: OptionCardProps) {

  return (
    <div 
      className={`
        p-4 rounded-lg border transition-all duration-200 hover:shadow-md
        ${isRecommended ? 'border-primary bg-primary/5 ring-2 ring-primary/20' : 'border-gray-200 bg-white'}
      `}
      data-testid={`card-option-${option.id}`}
    >
      {isRecommended && (
        <div className="flex items-center gap-2 mb-3">
          <div className="w-5 h-5 bg-primary rounded-full flex items-center justify-center">
            <Check className="text-white" size={12} />
          </div>
          <span className="text-sm font-medium text-primary">Recommended</span>
        </div>
      )}
      
      <h3 className="font-medium text-lg text-textPrimary mb-2">{option.title}</h3>
      <p className="text-sm text-textSecondary mb-3">{option.description}</p>
      
      <div className="space-y-2 mb-4">
        {option.highlights.map((highlight, index) => (
          <div key={index} className="flex items-center gap-2">
            <div className="w-1 h-1 bg-primary rounded-full" />
            <span className="text-sm text-textPrimary">{highlight}</span>
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div className="text-center">
          <div className="text-sm text-textSecondary">Total time</div>
          <div className="font-medium text-textPrimary">{option.duration}</div>
        </div>
        <div className="text-center">
          <div className="text-sm text-textSecondary">Cost</div>
          <div className="font-medium text-textPrimary">{option.cost}</div>
        </div>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="text-center">
            <div className="text-xs text-textSecondary">Comfort</div>
            <div className="text-sm font-medium text-textPrimary">{option.comfortLevel}</div>
          </div>
          <div className="text-center">
            <div className="text-xs text-textSecondary">Stress</div>
            <div className="text-sm font-medium text-textPrimary">{option.stressLevel}</div>
          </div>
        </div>
      </div>
    </div>
  );
}