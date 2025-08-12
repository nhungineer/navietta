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
    budgetComfort: 62,
    energyLevel: 62,
    transitStyle: "explore",
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
              Transiting plan for <strong>{flightDetails.adults} adult
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
              <strong>{formatTime(flightDetails.nextStopTime)}</strong> by{" "}
              <strong>{flightDetails.transportMode.replace('_', ' ')}</strong>. What
              are your preferences?
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <DollarSign className="text-textPrimary" size={20} />
              <Label className="text-lg font-medium text-textPrimary">
                Budget vs Convenience
              </Label>
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-textSecondary">0</span>
                <span className="text-lg font-semibold text-primary">{formData.budgetComfort}</span>
                <span className="text-sm text-textSecondary">100</span>
              </div>
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
              <div className="flex justify-between text-xs text-textSecondary px-1 mt-2">
                <span>Save money</span>
                <span>Max convenience</span>
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 mb-4">
              <Zap className="text-textPrimary" size={20} />
              <Label className="text-lg font-medium text-textPrimary">
                Energy level
              </Label>
            </div>
            <div className="relative">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-textSecondary">0</span>
                <span className="text-lg font-semibold text-primary">{formData.energyLevel}</span>
                <span className="text-sm text-textSecondary">100</span>
              </div>
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
              <div className="flex justify-between text-xs text-textSecondary px-1 mt-2">
                <span>Exhausted</span>
                <span>Energetic</span>
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
                onClick={() => setFormData((prev) => ({ ...prev, transitStyle: "quickly" }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.transitStyle === "quickly"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <Rabbit className="text-amber-600" size={32} />
                  <span className="font-medium text-textPrimary">Get there</span>
                  <span className="font-medium text-textPrimary">quickly</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, transitStyle: "explore" }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.transitStyle === "explore"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <MapPin className="text-blue-500" size={32} />
                  <span className="font-medium text-textPrimary">Explore along</span>
                  <span className="font-medium text-textPrimary">the way</span>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, transitStyle: "simple" }))}
                className={`p-4 rounded-lg border-2 text-center transition-all ${
                  formData.transitStyle === "simple"
                    ? "border-primary bg-primary/5"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <TreePine className="text-gray-500" size={32} />
                  <span className="font-medium text-textPrimary">Keep</span>
                  <span className="font-medium text-textPrimary">it simple</span>
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
