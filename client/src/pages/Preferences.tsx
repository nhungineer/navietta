import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { useTravelContext } from "@/contexts/TravelContext";
import { preferencesSchema, type Preferences } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { DollarSign, Zap, Rabbit, MapPin, TreePine, Info } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export default function PreferencesPage() {
  const { navigateToStep, setPreferences, flightDetails } = useTravelContext();
  const { toast } = useToast();

  const [formData, setFormData] = useState<Preferences>({
    budget: 3,
    activities: 3,
    transitStyle: "scenic-route",
  });

  const getBudgetLabel = (value: number) => {
    const labels = {
      1: "Frugal",
      2: "Economy", 
      3: "Balanced",
      4: "Comfort",
      5: "Luxury"
    };
    return labels[value as keyof typeof labels] || "";
  };

  const getBudgetDescription = (value: number) => {
    const descriptions = {
      1: "Cheapest possible, no frills",
      2: "Low-cost choices, slight comfort",
      3: "Cost and comfort equally matter",
      4: "More spend for ease",
      5: "Max comfort, price no object"
    };
    return descriptions[value as keyof typeof descriptions] || "";
  };

  const getActivitiesLabel = (value: number) => {
    const labels = {
      0: "Resting",
      1: "Easy",
      2: "Gentle",
      3: "Balanced",
      4: "Lively",
      5: "Energised"
    };
    return labels[value as keyof typeof labels] || "";
  };

  const getActivitiesDescription = (value: number) => {
    const descriptions = {
      0: "Best for downtime, relaxation",
      1: "Only light movement or short outings",
      2: "Okay with mild activities",
      3: "Comfortable with moderate plans",
      4: "Keen for active exploration",
      5: "High stamina, ready for all"
    };
    return descriptions[value as keyof typeof descriptions] || "";
  };

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
                {flightDetails.from} to {flightDetails.to}
              </strong>
              , arriving at{" "}
              <strong>
                {formatTime(flightDetails.arrivalTime)} on{" "}
                {formatDate(flightDetails.arrivalDate)}
              </strong>
              . Your next stop is <strong>{flightDetails.stops[0]?.location}</strong> at{" "}
              <strong>{formatTime(flightDetails.stops[0]?.arrivalTime)}</strong>. What
              are your preferences?
            </p>
          )}
        </div>

        <div className="space-y-8">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <DollarSign className="text-textPrimary" size={20} />
                <Label className="text-lg font-medium text-textPrimary">
                  Budget
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Info className="text-gray-500" size={16} />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Budget Options</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div><strong>1 - Frugal:</strong> Cheapest possible, no frills</div>
                      <div><strong>2 - Economy:</strong> Low-cost choices, slight comfort</div>
                      <div><strong>3 - Balanced:</strong> Cost and comfort equally matter</div>
                      <div><strong>4 - Comfort:</strong> More spend for ease</div>
                      <div><strong>5 - Luxury:</strong> Max comfort, price no object</div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <span className="text-lg font-semibold text-textPrimary">{getBudgetLabel(formData.budget)}</span>
            </div>
            <div className="relative">
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
              <div className="text-sm text-textSecondary mt-3">
                {getBudgetDescription(formData.budget)}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Zap className="text-textPrimary" size={20} />
                <Label className="text-lg font-medium text-textPrimary">
                  Activities
                </Label>
                <Dialog>
                  <DialogTrigger asChild>
                    <button className="p-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors">
                      <Info className="text-gray-500" size={16} />
                    </button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader>
                      <DialogTitle>Activity Level Options</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-3">
                      <div><strong>0 - Resting:</strong> Best for downtime, relaxation</div>
                      <div><strong>1 - Easy:</strong> Only light movement or short outings</div>
                      <div><strong>2 - Gentle:</strong> Okay with mild activities</div>
                      <div><strong>3 - Balanced:</strong> Comfortable with moderate plans</div>
                      <div><strong>4 - Lively:</strong> Keen for active exploration</div>
                      <div><strong>5 - Energised:</strong> High stamina, ready for all</div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <span className="text-lg font-semibold text-textPrimary">{getActivitiesLabel(formData.activities)}</span>
            </div>
            <div className="relative">
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
              <div className="text-sm text-textSecondary mt-3">
                {getActivitiesDescription(formData.activities)}
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
