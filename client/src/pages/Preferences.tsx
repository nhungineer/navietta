import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useTravelContext } from "@/contexts/TravelContext";
import { preferencesSchema, type Preferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export default function PreferencesPage() {
  const { navigateToStep, setPreferences, flightDetails } = useTravelContext();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Preferences>({
    budgetComfort: 60,
    energyLevel: 30,
    transitStyle: "opportunity_maximiser",
  });

  const handleSliderChange = (
    field: "budgetComfort" | "energyLevel",
    value: number,
  ) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = () => {
    try {
      const validated = preferencesSchema.parse(formData);
      setPreferences(validated);
      navigateToStep(4);
    } catch (error) {
      toast({
        title: "Validation Error",
        description: "Please select all preferences.",
        variant: "destructive",
      });
    }
  };

  const formatTime = (time: string) => {
    return new Date(`2000-01-01T${time}`).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
    });
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      weekday: "short",
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="bg-white rounded-xl shadow-sm p-8">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-textPrimary mb-2">
            Your Travel Preferences
          </h2>
          {flightDetails && (
            <p className="text-textSecondary">
              Transiting plan for <strong></strong>{flightDetails.adults} adult
              {flightDetails.adults > 1 ? "s" : ""}</strong>
              {flightDetails.children > 0 &&
                ` and ${flightDetails.children} child${flightDetails.children > 1 ? "ren" : ""}`}{" "}
              travelling from{" "}
              <strong>
                {flightDetails.from} to {flightDetails.to}
              </strong>
              , arriving at{" "}
              <strong>
                {formatTime(flightDetails.arrivalTime)} on{" "}
                {formatDate(flightDetails.arrivalDate)}
              </strong>
              . Your next stop is <strong>{flightDetails.nextStop}</strong> at{" "}
              <strong>{formatTime(flightDetails.nextStopTime)}</strong>. What
              are your preferences?
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-medium text-textPrimary">
                Budget
              </Label>
              <Label className="text-lg font-medium text-textPrimary">
                Comfort
              </Label>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.budgetComfort}
                onChange={(e) =>
                  handleSliderChange("budgetComfort", parseInt(e.target.value))
                }
                className="slider w-full"
                style={{
                  background: `linear-gradient(to right, #00897B 0%, #00897B ${formData.budgetComfort}%, #e5e7eb ${formData.budgetComfort}%, #e5e7eb 100%)`,
                }}
              />
              <div className="absolute top-6 left-0 w-full flex justify-between text-xs text-textSecondary px-1">
                <span>Save money</span>
                <span>Maximum comfort</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <Label className="text-lg font-medium text-textPrimary">
                Energy level
              </Label>
            </div>
            <div className="relative">
              <input
                type="range"
                min="0"
                max="100"
                value={formData.energyLevel}
                onChange={(e) =>
                  handleSliderChange("energyLevel", parseInt(e.target.value))
                }
                className="slider w-full"
                style={{
                  background: `linear-gradient(to right, #00897B 0%, #00897B ${formData.energyLevel}%, #e5e7eb ${formData.energyLevel}%, #e5e7eb 100%)`,
                }}
              />
              <div className="absolute top-6 left-0 w-full flex justify-between text-xs text-textSecondary px-1">
                <span>Tired, need rest</span>
                <span>Energetic, ready to explore</span>
              </div>
            </div>
          </div>

          <div>
            <Label className="block text-lg font-medium text-textPrimary mb-4">
              Transit style
            </Label>
            <Select
              value={formData.transitStyle}
              onValueChange={(value) =>
                setFormData((prev) => ({ ...prev, transitStyle: value as any }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select transit style" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="opportunity_maximiser">
                  Opportunity maximiser
                </SelectItem>
                <SelectItem value="direct">Direct and efficient</SelectItem>
                <SelectItem value="scenic">Scenic route</SelectItem>
                <SelectItem value="budget">Adventurer</SelectItem>
                <SelectItem value="comfortable">Casual shopper</SelectItem>
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
