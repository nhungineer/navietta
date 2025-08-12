import { useTravelContext } from '@/contexts/TravelContext';

const steps = [
  { number: 1, label: 'Start' },
  { number: 2, label: 'Flight Details' },
  { number: 3, label: 'Preferences' },
  { number: 4, label: 'AI Results' },
];

export function ProgressBar() {
  const { currentStep } = useTravelContext();

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between text-sm text-textSecondary">
          <div className="flex items-center space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center space-x-2">
                {index > 0 && (
                  <div className={`w-16 h-0.5 ${currentStep > step.number - 1 ? 'bg-primary' : 'bg-gray-300'}`} />
                )}
                <div className="flex items-center space-x-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep >= step.number 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-300 text-textSecondary'
                  }`}>
                    {step.number}
                  </div>
                  <span className={currentStep >= step.number ? 'text-primary font-medium' : ''}>
                    {step.label}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
