import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTravelContext } from "@/contexts/TravelContext";
import { flightDetailsSchema, type FlightDetails, type Stop } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Plane,
  PlaneTakeoff,
  Minus,
  Plus,
  MapPin,
  Clock,
  Calendar,
  Users,
  Luggage,
  X,
} from "lucide-react";

export default function FlightDetailsPage() {
  const { navigateToStep, setFlightDetails } = useTravelContext();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FlightDetails>({
    from: "Melbourne",
    departureTime: "07:00",
    departureDate: "2025-08-22",
    adults: 2,
    children: 0,
    luggageCount: 2,
    stops: [
      {
        location: "Naples",
        arrivalTime: "15:30",
        arrivalDate: "2025-08-23",
      },
      {
        location: "Amsterdam",
        arrivalTime: "18:00",
        arrivalDate: "2025-08-23",
      },
    ],
  });

  const handleInputChange = (
    field: keyof FlightDetails,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleStopChange = (
    index: number,
    field: keyof Stop,
    value: string,
  ) => {
    setFormData((prev) => ({
      ...prev,
      stops: prev.stops.map((stop, i) =>
        i === index ? { ...stop, [field]: value } : stop
      ),
    }));
  };

  // Date constraint logic for Stop 2
  const getMaxDateForStop2 = (stop1Date: string): string => {
    const date = new Date(stop1Date);
    date.setDate(date.getDate() + 1); // Allow only same day or next day
    return date.toISOString().split('T')[0];
  };

  const handleStop2DateChange = (newDate: string) => {
    const stop1Date = formData.stops[0]?.arrivalDate;
    if (stop1Date) {
      const maxDate = getMaxDateForStop2(stop1Date);
      const minDate = stop1Date; // Same day as stop 1
      
      if (newDate >= minDate && newDate <= maxDate) {
        handleStopChange(1, 'arrivalDate', newDate);
      }
    }
  };

  // No remove stop function needed - exactly 2 stops required

  const handleSubmit = () => {
    // Check if start location is filled and not just whitespace
    if (!formData.from || formData.from.trim() === "") {
      toast({
        title: "Validation Error",
        description: "Please enter a start location.",
        variant: "destructive",
      });
      return;
    }

    // Check if all stop locations are filled and not just whitespace
    for (let i = 0; i < formData.stops.length; i++) {
      if (!formData.stops[i].location || formData.stops[i].location.trim() === "") {
        toast({
          title: "Validation Error",
          description: `Please enter a location for Stop ${i + 1}.`,
          variant: "destructive",
        });
        return;
      }
    }

    // Check if departure date is filled
    if (!formData.departureDate) {
      toast({
        title: "Validation Error",
        description: "Please select a departure date.",
        variant: "destructive",
      });
      return;
    }

    // Check if all stop dates are filled
    for (let i = 0; i < formData.stops.length; i++) {
      if (!formData.stops[i].arrivalDate) {
        toast({
          title: "Validation Error",
          description: `Please select an arrival date for Stop ${i + 1}.`,
          variant: "destructive",
        });
        return;
      }
    }

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

  const updateTravelers = (type: "adults" | "children", increment: boolean) => {
    const currentValue = formData[type];
    const newValue = increment
      ? currentValue + 1
      : Math.max(type === "adults" ? 1 : 0, currentValue - 1);
    handleInputChange(type, newValue);
  };

  const updateLuggage = (increment: boolean) => {
    const currentValue = formData.luggageCount;
    const newValue = increment
      ? currentValue + 1
      : Math.max(0, currentValue - 1);
    handleInputChange("luggageCount", newValue);
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <h2 className="text-2xl font-semibold text-textPrimary mb-6">
          Trip details
        </h2>

        {/* Travelers and Luggage Section - Moved to Top */}
        <div className="grid grid-cols-3 gap-6 mb-8">
          <div>
            <Label className="text-lg font-medium text-textPrimary mb-4 block">
              Adults
            </Label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 bg-gray-200 text-gray-600 hover:bg-primary hover:text-white rounded-l-md rounded-r-none"
                onClick={() => updateTravelers("adults", false)}
                data-testid="button-decrease-adults"
              >
                <Minus size={16} />
              </Button>
              <div className="w-16 h-10 flex items-center justify-center bg-white border-t border-b text-lg font-medium">
                {formData.adults}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 bg-gray-200 text-gray-600 hover:bg-primary hover:text-white rounded-r-md rounded-l-none"
                onClick={() => updateTravelers("adults", true)}
                data-testid="button-increase-adults"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-lg font-medium text-textPrimary mb-4 block">
              Children
            </Label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 bg-gray-200 text-gray-600 hover:bg-primary hover:text-white rounded-l-md rounded-r-none"
                onClick={() => updateTravelers("children", false)}
                data-testid="button-decrease-children"
              >
                <Minus size={16} />
              </Button>
              <div className="w-16 h-10 flex items-center justify-center bg-white border-t border-b text-lg font-medium">
                {formData.children}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 bg-gray-200 text-gray-600 hover:bg-primary hover:text-white rounded-r-md rounded-l-none"
                onClick={() => updateTravelers("children", true)}
                data-testid="button-increase-children"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>

          <div>
            <Label className="text-lg font-medium text-textPrimary mb-4 block">
              Luggage
            </Label>
            <div className="flex items-center">
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 bg-gray-200 text-gray-600 hover:bg-primary hover:text-white rounded-l-md rounded-r-none"
                onClick={() => updateLuggage(false)}
                data-testid="button-decrease-luggage"
              >
                <Minus size={16} />
              </Button>
              <div className="w-16 h-10 flex items-center justify-center bg-white border-t border-b text-lg font-medium">
                {formData.luggageCount}
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-10 h-10 p-0 bg-gray-200 text-gray-600 hover:bg-primary hover:text-white rounded-l-md rounded-r-none"
                onClick={() => updateLuggage(true)}
                data-testid="button-increase-luggage"
              >
                <Plus size={16} />
              </Button>
            </div>
          </div>
        </div>

        {/* Start Location */}
        <div className="mb-6">
          <Label className="text-lg font-medium text-textPrimary mb-3 block">
            Start
          </Label>
          <div className="relative">
            <MapPin
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
              size={16}
            />
            <Input
              type="text"
              value={formData.from}
              onChange={(e) => handleInputChange("from", e.target.value)}
              className="pl-10 pr-10 text-lg h-12"
              placeholder="Melbourne"
              data-testid="input-start-location"
            />
            {formData.from && (
              <button
                type="button"
                onClick={() => handleInputChange("from", " ")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                data-testid="button-clear-start-location"
              >
                <X size={16} />
              </button>
            )}
          </div>
        </div>

        {/* Stops Section */}
        <div className="space-y-6">
          {formData.stops.map((stop, index) => (
            <div key={index}>
              <Label className="text-lg font-medium text-textPrimary mb-3 block">
                Stop {index + 1}
              </Label>
              
              {/* Location */}
              <div className="relative mb-3">
                <MapPin
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  size={16}
                />
                <Input
                  type="text"
                  value={stop.location}
                  onChange={(e) => handleStopChange(index, "location", e.target.value)}
                  className="pl-10 pr-10 text-lg h-12"
                  placeholder="Rome"
                  data-testid={`input-stop-location-${index}`}
                />
                {stop.location && (
                  <button
                    type="button"
                    onClick={() => handleStopChange(index, "location", " ")}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    data-testid={`button-clear-stop-location-${index}`}
                  >
                    <X size={16} />
                  </button>
                )}
              </div>

              {/* Time and Date */}
              <div className="grid grid-cols-2 gap-3">
                <div className="relative">
                  <Clock
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="time"
                    value={stop.arrivalTime}
                    onChange={(e) => handleStopChange(index, "arrivalTime", e.target.value)}
                    className="pl-10 text-lg h-12"
                    data-testid={`input-stop-time-${index}`}
                  />
                </div>
                <div className="relative">
                  <Calendar
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="date"
                    value={stop.arrivalDate}
                    onChange={(e) => {
                      if (index === 1) {
                        handleStop2DateChange(e.target.value);
                      } else {
                        handleStopChange(index, "arrivalDate", e.target.value);
                        // Auto-update Stop 2 date when Stop 1 changes
                        if (index === 0 && formData.stops[1]) {
                          const newDate = e.target.value;
                          handleStopChange(1, "arrivalDate", newDate);
                        }
                      }
                    }}
                    min={index === 1 ? formData.stops[0]?.arrivalDate : undefined}
                    max={index === 1 ? getMaxDateForStop2(formData.stops[0]?.arrivalDate || "") : undefined}
                    className="pl-10 text-lg h-12"
                    data-testid={`input-stop-date-${index}`}
                  />
                </div>
              </div>
            </div>
          ))}

          {/* Transit Planning Note */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800">
            <p><strong>Transit Planning:</strong> This tool is designed for short-term transit planning with exactly 2 stops over 1-2 days. For longer multi-city itineraries, please use our extended trip planner.</p>
          </div>
        </div>

        {/* Next Button */}
        <Button
          className="w-full mt-8 bg-primary text-white hover:bg-primary/90 h-12 text-lg font-medium"
          onClick={handleSubmit}
          data-testid="button-next"
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
