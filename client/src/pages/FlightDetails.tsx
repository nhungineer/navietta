import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTravelContext } from "@/contexts/TravelContext";
import { flightDetailsSchema, type FlightDetails } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import {
  Plane,
  PlaneTakeoff,
  Minus,
  Plus,
  MapPin,
  Luggage,
} from "lucide-react";

export default function FlightDetailsPage() {
  const { navigateToStep, setFlightDetails } = useTravelContext();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FlightDetails>({
    from: "Melbourne",
    to: "Rome",
    departureTime: "07:00",
    arrivalTime: "07:15",
    departureDate: "2025-08-22",
    arrivalDate: "2025-08-23",
    adults: 2,
    children: 0,
    luggageCount: 2,
    nextStop: "Naples",
    nextStopTime: "15:30",
    transportMode: "train",
  });

  const handleInputChange = (
    field: keyof FlightDetails,
    value: string | number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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
          Flight Details
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">
              From
            </Label>
            <div className="relative">
              <PlaneTakeoff
                className="absolute left-3 top-3 text-textSecondary"
                size={16}
              />
              <Input
                type="text"
                value={formData.from}
                onChange={(e) => handleInputChange("from", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">
              To
            </Label>
            <div className="relative">
              <Plane
                className="absolute left-3 top-3 text-textSecondary"
                size={16}
              />
              <Input
                type="text"
                value={formData.to}
                onChange={(e) => handleInputChange("to", e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">
              Departure
            </Label>
            <Input
              type="time"
              value={formData.departureTime}
              onChange={(e) =>
                handleInputChange("departureTime", e.target.value)
              }
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">
              Arrival
            </Label>
            <Input
              type="time"
              value={formData.arrivalTime}
              onChange={(e) => handleInputChange("arrivalTime", e.target.value)}
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">
              Departure Date
            </Label>
            <Input
              type="date"
              value={formData.departureDate}
              onChange={(e) =>
                handleInputChange("departureDate", e.target.value)
              }
            />
          </div>

          <div>
            <Label className="block text-sm font-medium text-textSecondary mb-2">
              Arrival Date
            </Label>
            <Input
              type="date"
              value={formData.arrivalDate}
              onChange={(e) => handleInputChange("arrivalDate", e.target.value)}
            />
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-textPrimary mb-4">
            Travelers
          </h3>
          <div className="flex items-center space-x-4">
            <span className="text-textSecondary">Adults</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-primary hover:text-white"
                onClick={() => updateTravelers("adults", false)}
              >
                <Minus size={12} />
              </Button>
              <span className="w-8 text-center font-medium">
                {formData.adults}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-primary hover:text-white"
                onClick={() => updateTravelers("adults", true)}
              >
                <Plus size={12} />
              </Button>
            </div>
            <span className="ml-8 text-textSecondary">Children</span>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-primary hover:text-white"
                onClick={() => updateTravelers("children", false)}
              >
                <Minus size={12} />
              </Button>
              <span className="w-8 text-center font-medium">
                {formData.children}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-primary hover:text-white"
                onClick={() => updateTravelers("children", true)}
              >
                <Plus size={12} />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-textPrimary mb-4">
            Check-in luggage
          </h3>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Luggage className="text-textSecondary" size={16} />
              <span className="text-textSecondary">Pieces of luggage</span>
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-primary hover:text-white"
                onClick={() => updateLuggage(false)}
              >
                <Minus size={12} />
              </Button>
              <span className="w-8 text-center font-medium">
                {formData.luggageCount}
              </span>
              <Button
                variant="outline"
                size="sm"
                className="w-8 h-8 p-0 hover:bg-primary hover:text-white"
                onClick={() => updateLuggage(true)}
              >
                <Plus size={12} />
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <h3 className="text-lg font-medium text-textPrimary mb-4">
            Immediate next stop
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <MapPin
                className="absolute left-3 top-3 text-textSecondary"
                size={16}
              />
              <Input
                type="text"
                placeholder="Hotel name or location"
                value={formData.nextStop}
                onChange={(e) => handleInputChange("nextStop", e.target.value)}
                className="pl-10"
              />
            </div>
            <Input
              type="time"
              value={formData.nextStopTime}
              onChange={(e) =>
                handleInputChange("nextStopTime", e.target.value)
              }
            />
            <Select
              value={formData.transportMode}
              onValueChange={(value) =>
                handleInputChange(
                  "transportMode",
                  value as FlightDetails["transportMode"],
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Mode of transport" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flight">Flight</SelectItem>
                <SelectItem value="taxi">Taxi/Rideshare</SelectItem>
                <SelectItem value="train">Train</SelectItem>
                <SelectItem value="bus">Bus</SelectItem>
                <SelectItem value="hired_car">Hired car</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Button
          className="w-full mt-8 bg-primary text-white hover:bg-primary/90"
          onClick={handleSubmit}
        >
          NEXT
        </Button>
      </div>
    </div>
  );
}
