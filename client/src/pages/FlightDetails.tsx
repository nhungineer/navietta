import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useTravelContext } from '@/contexts/TravelContext';
import { flightDetailsSchema, type FlightDetails } from '@shared/schema';
import { useToast } from '@/hooks/use-toast';
import { Plane, PlaneTakeoff, Clock, Minus, Plus, MapPin } from 'lucide-react';

export default function FlightDetailsPage() {
  const { navigateToStep, setFlightDetails } = useTravelContext();
  const { toast } = useToast();
  
  const [formData, setFormData] = useState<FlightDetails>({
    from: 'Melbourne',
    to: 'Rome',
    departureTime: '07:00',
    arrivalTime: '19:15',
    departureDate: '2025-08-22',
    arrivalDate: '2025-08-22',
    adults: 2,
    children: 0,
    luggage: 'standard',
    nextStop: 'Naples',
    nextStopTime: '20:20',
  });

  const handleInputChange = (field: keyof FlightDetails, value: string | number) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    try {
      const validated = flightDetailsSchema.parse(formData);
      setFlightDetails(validated);
      navigateToStep(3);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields correctly.",
        variant: "destructive",
      });
    }
  };

  const updateTravelers = (type: 'adults' | 'children', increment: boolean) => {
    const currentValue = formData[type];
    const newValue = increment ? currentValue + 1 : Math.max(type === 'adults' ? 1 : 0, currentValue - 1);
    handleInputChange(type, newValue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-textPrimary mb-6">Flight Details</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">From</Label>
            <div className="relative">
              <PlaneTakeoff className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="text"
                value={formData.from}
                onChange={(e) => handleInputChange('from', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          
          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">To</Label>
            <div className="relative">
              <Plane className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="text"
                value={formData.to}
                onChange={(e) => handleInputChange('to', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">Departure</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="time"
                value={formData.departureTime}
                onChange={(e) => handleInputChange('departureTime', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">Arrival</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="time"
                value={formData.arrivalTime}
                onChange={(e) => handleInputChange('arrivalTime', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">Departure Date</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="date"
                value={formData.departureDate}
                onChange={(e) => handleInputChange('departureDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">Arrival Date</Label>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="date"
                value={formData.arrivalDate}
                onChange={(e) => handleInputChange('arrivalDate', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-textPrimary mb-4">Travelers</h3>
          <div className="flex items-center space-x-4">
            <span className="text-textSecondary">Adults</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => updateTravelers('adults', false)}
              >
                <Minus size={12} />
              </Button>
              <span className="w-8 text-center font-medium">{formData.adults}</span>
              <Button
                variant="default"
                size="sm"
                className="w-8 h-8 p-0 bg-secondary hover:bg-secondary/90"
                onClick={() => updateTravelers('adults', true)}
              >
                <Plus size={12} />
              </Button>
            </div>
            <span className="ml-8 text-textSecondary">Children</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0"
                onClick={() => updateTravelers('children', false)}
              >
                <Minus size={12} />
              </Button>
              <span className="w-8 text-center font-medium">{formData.children}</span>
              <Button
                variant="default"
                size="sm"
                className="w-8 h-8 p-0 bg-secondary hover:bg-secondary/90"
                onClick={() => updateTravelers('children', true)}
              >
                <Plus size={12} />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-textPrimary mb-4">Check-in luggage</h3>
          <RadioGroup value={formData.luggage} onValueChange={(value) => handleInputChange('luggage', value)}>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="none" id="luggage-none" />
              <Label htmlFor="luggage-none" className="text-textPrimary">No check-in luggage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="standard" id="luggage-standard" />
              <Label htmlFor="luggage-standard" className="text-textPrimary">Standard luggage</Label>
            </div>
            <div className="flex items-center space-x-2">
              <RadioGroupItem value="multiple" id="luggage-multiple" />
              <Label htmlFor="luggage-multiple" className="text-textPrimary">Multiple bags</Label>
            </div>
          </RadioGroup>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-textPrimary mb-4">Immediate next stop</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="text"
                placeholder="Hotel name or location"
                value={formData.nextStop}
                onChange={(e) => handleInputChange('nextStop', e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="relative">
              <Clock className="absolute left-3 top-3 text-textSecondary" size={16} />
              <Input
                type="time"
                value={formData.nextStopTime}
                onChange={(e) => handleInputChange('nextStopTime', e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
        </div>

        <Button className="w-full mt-8 bg-primary text-white hover:bg-primary/90" onClick={handleSubmit}>
          NEXT
        </Button>
      </div>
    </div>
  );
}
