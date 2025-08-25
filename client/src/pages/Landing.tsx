import { Button } from '@/components/ui/button';
import { useTravelContext } from '@/contexts/TravelContext';
import { Plane } from 'lucide-react';
import { PDFUpload } from '@/components/PDFUpload';

export default function Landing() {
  const { navigateToStep, setExtractedData } = useTravelContext();

  const handlePDFSuccess = (data: any) => {
    setExtractedData(data);
  };

  return (
    <div className="text-center py-16 max-w-md mx-auto">
      <div className="mb-12">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary rounded-full mb-6">
          <span className="text-xl font-bold text-white">N</span>
        </div>
        <div className="text-primary text-3xl mb-4">
          <Plane className="mx-auto" size={40} />
        </div>
        <h1 className="text-3xl font-bold text-textPrimary mb-2">Navietta</h1>
        <p className="text-lg text-textSecondary">Travel transit, stress-free</p>
      </div>
      
      <Button 
        className="w-full bg-primary text-white py-3 px-6 rounded-lg font-medium hover:bg-primary/90 transition-colors"
        onClick={() => navigateToStep(2)}
        data-testid="button-enter-trip-details"
      >
        ENTER TRIP DETAILS
      </Button>
      
      <div className="my-4 text-gray-500 text-sm font-medium">--- OR -----</div>
      
      <PDFUpload onSuccess={handlePDFSuccess} />
    </div>
  );
}
