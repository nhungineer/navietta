import { Button } from '@/components/ui/button';
import { useTravelContext } from '@/contexts/TravelContext';
import { Plane, Upload } from 'lucide-react';

export default function Landing() {
  const { navigateToStep } = useTravelContext();

  return (
    <div className="text-center py-16">
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-primary rounded-full mb-6">
          <span className="text-2xl font-bold text-white">N</span>
        </div>
        <h1 className="text-4xl font-bold text-textPrimary mb-4">Navegia</h1>
        <p className="text-xl text-textSecondary mb-2">Travel transit, stress free</p>
        <div className="text-primary text-3xl mb-8">
          <Plane className="mx-auto" size={48} />
        </div>
      </div>
      
      <div className="max-w-md mx-auto">
        <Button className="w-full bg-primary text-white py-4 px-6 rounded-lg font-medium mb-4 hover:bg-primary/90 transition-colors">
          <Upload className="mr-2" size={16} />
          UPLOAD ITINERARY
        </Button>
        <p className="text-sm text-textSecondary">e.g. screenshots, flight booking etc</p>
        
        <div className="my-6 text-textSecondary">— OR —</div>
        
        <Button 
          variant="link" 
          className="text-accent hover:underline"
          onClick={() => navigateToStep(2)}
        >
          Enter info manually
        </Button>
      </div>
    </div>
  );
}
