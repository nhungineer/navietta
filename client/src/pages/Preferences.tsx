import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTravelContext } from "@/contexts/TravelContext";
import { preferencesSchema, type Preferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Zap, Rabbit, MapPin, TreePine } from "lucide-react";

export default function PreferencesPage() {
  const { navigateToStep, setPreferences, flightDetails } = useTravelContext();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Preferences>({
    budget: 3,
    activities: 3,
    transitStyle: "scenic-route",
  });

  const handleSliderChange = (
    field: "budget" | "activities",
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

  const formatTime = (timeStr: string) => {
    if (!timeStr) return 'Invalid Time';
    try {
      const [hours, minutes] = timeStr.split(':');
      const hour24 = parseInt(hours, 10);
      const hour12 = hour24 === 0 ? 12 : hour24 > 12 ? hour24 - 12 : hour24;
      const ampm = hour24 >= 12 ? 'pm' : 'am';
      return `${hour12}:${minutes}${ampm}`;
    } catch {
      return 'Invalid Time';
    }
  };

  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'Invalid Date';
    try {
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return 'Invalid Date';
      return date.toLocaleDateString('en-GB', { 
        day: 'numeric', 
        month: 'short'
      });
    } catch {
      return 'Invalid Date';
    }
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
              Transiting plan for <strong>{flightDetails.adults} adult
              {flightDetails.adults > 1 ? "s" : ""}</strong>
              {flightDetails.children > 0 &&
                ` and ${flightDetails.children} child${flightDetails.children > 1 ? "ren" : ""}`}{" "}
              travelling from{" "}
              <strong>
                {flightDetails.from} to {flightDetails.stops[1]?.location}
              </strong>
              , arriving at{" "}
              <strong>
                {formatTime(flightDetails.stops[1]?.arrivalTime)} on{" "}
                {formatDate(flightDetails.stops[1]?.arrivalDate)}
              </strong>
              . Your next stop is <strong>{flightDetails.stops[0]?.location}</strong> at{" "}
              <strong>{formatTime(flightDetails.stops[0]?.arrivalTime)}</strong>. What
              are your preferences?
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-textPrimary" size={20} />
              <Label className="text-lg font-medium text-textPrimary">
                Budget
              </Label>
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-textSecondary">1</span>
                <span className="text-lg font-semibold text-primary">{formData.budget}</span>
                <span className="text-sm text-textSecondary">5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                step="1"
                value={formData.budget}
                onChange={(e) =>
                  handleSliderChange("budget", parseInt(e.target.value))
                }
                className="slider w-full"
                style={{
                  background: `linear-gradient(to right, #00897B 0%, #00897B ${((formData.budget - 1) / 4) * 100}%, #e5e7eb ${((formData.budget - 1) / 4) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-textSecondary px-1 mt-2">
                <span>1 - Frugal</span>
                <span>3 - Balanced</span>
                <span>5 - Luxury</span>
              </div>
              <div className="text-center text-sm text-textSecondary mt-2">
                {formData.budget === 1 && "Cheapest possible, no frills"}
                {formData.budget === 2 && "Low-cost choices, slight comfort"}
                {formData.budget === 3 && "Cost and comfort equally matter"}
                {formData.budget === 4 && "More spend for ease"}
                {formData.budget === 5 && "Max comfort, price no object"}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-textPrimary" size={20} />
              <Label className="text-lg font-medium text-textPrimary">
                Activities
              </Label>
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-textSecondary">0</span>
                <span className="text-lg font-semibold text-primary">{formData.activities}</span>
                <span className="text-sm text-textSecondary">5</span>
              </div>
              <input
                type="range"
                min="0"
                max="5"
                step="1"
                value={formData.activities}
                onChange={(e) =>
                  handleSliderChange("activities", parseInt(e.target.value))
                }
                className="slider w-full"
                style={{
                  background: `linear-gradient(to right, #00897B 0%, #00897B ${(formData.activities / 5) * 100}%, #e5e7eb ${(formData.activities / 5) * 100}%, #e5e7eb 100%)`,
                }}
              />
              <div className="flex justify-between text-xs text-textSecondary px-1 mt-2">
                <span>0 - Resting</span>
                <span>3 - Balanced</span>
                <span>5 - Energised</span>
              </div>
              <div className="text-center text-sm text-textSecondary mt-2">
                {formData.activities === 0 && "Best for downtime, relaxation"}
                {formData.activities === 1 && "Only light movement or short outings"}
                {formData.activities === 2 && "Okay with mild activities"}
                {formData.activities === 3 && "Comfortable with moderate plans"}
                {formData.activities === 4 && "Keen for active exploration"}
                {formData.activities === 5 && "High stamina, ready for all"}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="text-blue-500" size={20} />
              <Label className="text-lg font-medium text-textPrimary">
                Transit style
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, transitStyle: "fast-track" }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.transitStyle === "fast-track"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Rabbit className="text-amber-600" size={32} />
                  <span className="font-medium text-textPrimary">Fast track</span>
                  <span className="text-sm text-textSecondary">Prioritise quickest route</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, transitStyle: "scenic-route" }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.transitStyle === "scenic-route"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="text-blue-500" size={32} />
                  <span className="font-medium text-textPrimary">Scenic route</span>
                  <span className="text-sm text-textSecondary">Take time, see sights</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, transitStyle: "fewer-transfers" }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.transitStyle === "fewer-transfers"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <TreePine className="text-gray-500" size={32} />
                  <span className="font-medium text-textPrimary">Fewer transfers</span>
                  <span className="text-sm text-textSecondary">Straightforward routes</span>
                </div>
              </button>
            </div>
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
