import { useTravelContext } from '@/contexts/TravelContext';

const steps = [
  { number: 1, label: 'Welcome' },
  { number: 2, label: 'Trip details' },
  { number: 3, label: 'Preferences' },
  { number: 4, label: 'Transit plan' },
];

export function ProgressBar() {
  const { currentStep, navigateToStep, flightDetails, preferences } = useTravelContext();

  const canNavigateToStep = (step: number): boolean => {
    // Always allow going to step 1 (landing)
    if (step === 1) return true;

    // Can go to flight details if we're past step 1
    if (step === 2) return currentStep >= 2;

    // Can go to preferences if flight details are filled
    if (step === 3) return flightDetails !== null;

    // Can go to results if both flight details and preferences are filled
    if (step === 4) return flightDetails !== null && preferences !== null;

    return false;
  };

  const handleStepClick = (step: number) => {
    if (canNavigateToStep(step)) {
      navigateToStep(step);
    }
  };

  return (
    <div className="bg-white shadow-sm">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-center text-sm text-textSecondary">
          <div className="flex items-center space-x-3 md:space-x-8">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center space-x-2">
                {index > 0 && (
                  <div className={`w-8 md:w-16 h-0.5 ${currentStep > step.number - 1 ? 'bg-primary' : 'bg-gray-300'}`} />
                )}
                <div 
                  className={`flex items-center space-x-2 ${
                    canNavigateToStep(step.number) 
                      ? 'cursor-pointer hover:opacity-80 transition-opacity' 
                      : 'opacity-50 cursor-not-allowed'
                  }`}
                  onClick={() => handleStepClick(step.number)}
                >
                  <div className={`w-7 h-7 md:w-8 md:h-8 rounded-full flex items-center justify-center text-xs font-medium ${
                    currentStep >= step.number 
                      ? 'bg-primary text-white' 
                      : 'bg-gray-300 text-textSecondary'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`hidden md:inline ${currentStep >= step.number ? 'text-primary font-medium' : ''}`}>
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