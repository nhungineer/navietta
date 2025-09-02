import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useTravelContext } from "@/contexts/TravelContext";
import {
  flightDetailsSchema,
  type FlightDetails,
  type Stop,
  type ExtractedField,
} from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { ConfidenceField } from "@/components/ConfidenceField";
import { VerificationBanner } from "@/components/VerificationBanner";
import {
  validateLocation,
  type LocationValidationResponse
} from "@/lib/validation";
import {
  Plane,
  PlaneTakeoff,
  MapPin,
  Clock,
  Calendar,
  Users,
  Luggage,
  Loader2,
  CheckCircle,
  AlertCircle,
  ArrowRight,
} from "lucide-react";

interface LegFormErrors {
  from?: string;
  to?: string;
  departureTime?: string;
  departureDate?: string;
  arrivalTime?: string;
  arrivalDate?: string;
  adults?: string;
  children?: string;
  luggageCount?: string;
  stops?: Array<{
    location?: string;
    arrivalTime?: string;
    arrivalDate?: string;
    departureTime?: string;
    departureDate?: string;
  }>;
}

interface ValidationStates {
  isValidating: boolean;
  locations: string[];
  errors: string[];
}

export default function LegBasedFlightDetailsPage() {
  const { navigateToStep, setFlightDetails, extractedData, hasExtractedData } =
    useTravelContext();
  const { toast } = useToast();

  const [formData, setFormData] = useState<FlightDetails>({
    from: "",
    to: "",
    departureTime: "08:00",
    arrivalTime: "18:00",
    departureDate: "2025-09-02",
    arrivalDate: "2025-09-02",
    adults: 2,
    children: 0,
    luggageCount: 2,
    stops: [
      {
        location: "",
        arrivalTime: "12:00",
        arrivalDate: "2025-09-02",
        departureTime: "13:00", // Enhanced field
        departureDate: "2025-09-02", // Enhanced field
      },
      {
        location: "",
        arrivalTime: "16:00",
        arrivalDate: "2025-09-02",
        departureTime: "17:00", // Enhanced field  
        departureDate: "2025-09-02", // Enhanced field
      },
    ],
  });

  const [errors, setErrors] = useState<LegFormErrors>({});
  const [validationState, setValidationState] = useState<ValidationStates>({
    isValidating: false,
    locations: [],
    errors: [],
  });

  // Helper function to apply extracted string field data
  const applyExtractedStringField = (
    extractedField: ExtractedField | undefined,
    fallbackValue: string,
  ): string => {
    if (!extractedField) return fallbackValue;
    const confidence = extractedField.confidence;
    if (confidence < 50) return "";
    return extractedField.value;
  };

  // Helper function to apply extracted number field data
  const applyExtractedNumberField = (
    extractedField:
      | { value: number; confidence: number; source: "manual" | "extracted" }
      | undefined,
    fallbackValue: number,
  ): number => {
    if (!extractedField) return fallbackValue;
    const confidence = extractedField.confidence;
    if (confidence < 50) return fallbackValue;
    return extractedField.value;
  };

  // Apply extracted data when available
  useEffect(() => {
    if (extractedData) {
      // Get Stop 1 date first
      const stop1Date = applyExtractedStringField(
        extractedData.stops?.[0]?.arrivalDate,
        "2025-09-02",
      );

      // Calculate Stop 2 date with constraint
      let stop2Date = applyExtractedStringField(
        extractedData.stops?.[1]?.arrivalDate,
        "",
      );
      if (!stop2Date && stop1Date) {
        stop2Date = stop1Date; // Same day as Stop 1 if no Stop 2 date extracted
      }

      setFormData({
        from: applyExtractedStringField(extractedData.from, ""),
        to: formData.to,
        departureTime: applyExtractedStringField(
          extractedData.departureTime,
          "08:00",
        ),
        arrivalTime: formData.arrivalTime,
        departureDate: applyExtractedStringField(
          extractedData.departureDate,
          "2025-09-02",
        ),
        arrivalDate: formData.arrivalDate,
        adults: applyExtractedNumberField(extractedData.adults, 2),
        children: applyExtractedNumberField(extractedData.children, 0),
        luggageCount: applyExtractedNumberField(extractedData.luggageCount, 2),
        stops: [
          {
            location: applyExtractedStringField(
              extractedData.stops?.[0]?.location,
              "",
            ),
            arrivalTime: applyExtractedStringField(
              extractedData.stops?.[0]?.arrivalTime,
              "12:00",
            ),
            arrivalDate: stop1Date,
            departureTime: applyExtractedStringField(
              extractedData.stops?.[0]?.departureTime,
              "13:00",
            ),
            departureDate: stop1Date,
          },
          {
            location: applyExtractedStringField(
              extractedData.stops?.[1]?.location,
              "",
            ),
            arrivalTime: applyExtractedStringField(
              extractedData.stops?.[1]?.arrivalTime,
              "16:00",
            ),
            arrivalDate: stop2Date || stop1Date,
            departureTime: applyExtractedStringField(
              extractedData.stops?.[1]?.departureTime,
              "17:00",
            ),
            departureDate: stop2Date || stop1Date,
          },
        ],
      });
    }
  }, [extractedData]);

  const handleInputChange = (field: keyof FlightDetails, value: any) => {
    setFormData({ ...formData, [field]: value });
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors({ ...errors, [field]: undefined });
    }
  };

  const handleStopChange = (
    index: number,
    field: keyof Stop,
    value: string,
  ) => {
    const newStops = [...formData.stops];
    newStops[index] = { ...newStops[index], [field]: value };
    setFormData({ ...formData, stops: newStops });
    
    // Clear stop error when user starts typing
    if (errors.stops?.[index]?.[field]) {
      const newStopErrors = [...(errors.stops || [])];
      if (newStopErrors[index]) {
        newStopErrors[index] = { ...newStopErrors[index], [field]: undefined };
        setErrors({ ...errors, stops: newStopErrors });
      }
    }
  };

  // Batch validation on Next button click
  const handleSubmit = async () => {
    const validationErrors: LegFormErrors = {};
    
    // Collect all locations for validation
    const locationsToValidate = [
      { type: 'from', value: formData.from },
      { type: 'to', value: formData.to },
      ...formData.stops.map((stop, index) => ({ 
        type: `stop-${index}` as const, 
        value: stop.location 
      }))
    ];

    // Check required fields first (before expensive API calls)
    if (!formData.from?.trim()) {
      validationErrors.from = "Start location is required";
    }
    if (!formData.to?.trim()) {
      validationErrors.to = "Final destination is required";
    }
    if (!formData.departureTime?.trim()) {
      validationErrors.departureTime = "Departure time is required";
    }
    if (!formData.departureDate?.trim()) {
      validationErrors.departureDate = "Departure date is required";
    }
    if (!formData.arrivalTime?.trim()) {
      validationErrors.arrivalTime = "Final arrival time is required";
    }
    if (!formData.arrivalDate?.trim()) {
      validationErrors.arrivalDate = "Final arrival date is required";
    }

    const stopsErrors: Array<{
      location?: string;
      arrivalTime?: string;
      arrivalDate?: string;
      departureTime?: string;
      departureDate?: string;
    }> = [];
    let hasStopErrors = false;

    for (let i = 0; i < formData.stops.length; i++) {
      const stopErrors: any = {};
      
      if (!formData.stops[i].location?.trim()) {
        stopErrors.location = "Location is required";
        hasStopErrors = true;
      }
      if (!formData.stops[i].arrivalTime?.trim()) {
        stopErrors.arrivalTime = "Arrival time is required";
        hasStopErrors = true;
      }
      if (!formData.stops[i].arrivalDate?.trim()) {
        stopErrors.arrivalDate = "Arrival date is required";
        hasStopErrors = true;
      }
      if (!formData.stops[i].departureTime?.trim()) {
        stopErrors.departureTime = "Departure time is required";
        hasStopErrors = true;
      }
      if (!formData.stops[i].departureDate?.trim()) {
        stopErrors.departureDate = "Departure date is required";
        hasStopErrors = true;
      }
      
      stopsErrors[i] = stopErrors;
    }

    if (hasStopErrors) {
      validationErrors.stops = stopsErrors;
    }

    // If basic validation fails, show errors immediately
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }

    // Clear basic errors
    setErrors({});

    // Now validate locations (expensive API calls)
    setValidationState({
      isValidating: true,
      locations: locationsToValidate.map(l => l.value),
      errors: [],
    });

    try {
      const locationValidationPromises = locationsToValidate
        .filter(loc => loc.value.trim()) // Only validate non-empty locations
        .map(async (loc) => {
          try {
            const result = await validateLocation(loc.value);
            return { type: loc.type, result };
          } catch (error) {
            return { 
              type: loc.type, 
              result: { 
                success: false, 
                error: "Could not validate location" 
              } as LocationValidationResponse 
            };
          }
        });

      const validationResults = await Promise.all(locationValidationPromises);
      
      // Process validation results
      const finalValidationErrors: LegFormErrors = {};
      const validationErrorsList: string[] = [];

      for (const { type, result } of validationResults) {
        if (!result.success) {
          const errorMessage = result.error || "Invalid location";
          
          if (type === 'from') {
            finalValidationErrors.from = errorMessage;
          } else if (type === 'to') {
            finalValidationErrors.to = errorMessage;
          } else if (type.startsWith('stop-')) {
            const stopIndex = parseInt(type.split('-')[1]);
            if (!finalValidationErrors.stops) {
              finalValidationErrors.stops = [];
            }
            if (!finalValidationErrors.stops[stopIndex]) {
              finalValidationErrors.stops[stopIndex] = {};
            }
            finalValidationErrors.stops[stopIndex].location = errorMessage;
          }
          
          validationErrorsList.push(errorMessage);
        }
      }

      setValidationState({
        isValidating: false,
        locations: [],
        errors: validationErrorsList,
      });

      if (Object.keys(finalValidationErrors).length > 0) {
        setErrors(finalValidationErrors);
        toast({
          title: "Location Validation Failed",
          description: `${validationErrorsList.length} location(s) could not be verified. Please check the spelling or provide more details.`,
          variant: "destructive",
        });
        return;
      }

      // All validations passed!
      toast({
        title: "Validation Successful",
        description: "All locations verified. Proceeding to preferences.",
        variant: "default",
      });

      // Validate with Zod schema
      const validatedData = flightDetailsSchema.parse(formData);
      
      // Save and proceed
      setFlightDetails(validatedData);
      navigateToStep(3);

    } catch (error) {
      setValidationState({
        isValidating: false,
        locations: [],
        errors: ["Validation failed"],
      });
      
      toast({
        title: "Validation Error",
        description: "Something went wrong during validation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-bgPrimary">
      <div className="max-w-2xl mx-auto px-6 py-8">
        {hasExtractedData && <VerificationBanner hasExtractedData={hasExtractedData} />}
        
        <div className="space-y-8">
          {/* Header */}
          <div className="text-center space-y-4">
            <h1 className="text-3xl font-bold text-textPrimary">
              Flight Details
            </h1>
            <p className="text-lg text-textSecondary">
              Tell us about your journey with departure and arrival details
            </p>
          </div>

          {/* Departure Section */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <PlaneTakeoff className="text-primary" size={24} />
              <h2 className="text-xl font-semibold text-textPrimary">Departure</h2>
            </div>

            <div className="space-y-6">
              {/* From Location */}
              <ConfidenceField
                label="From"
                value={formData.from}
                onChange={(value) => handleInputChange("from", value)}
                extractedField={extractedData?.from}
                placeholder="Enter departure location (e.g., Melbourne)"
                data-testid="input-start-location"
                className="text-lg h-12"
              />
              {errors.from && (
                <p className="text-red-500 text-sm mt-1">{errors.from}</p>
              )}

              {/* Departure Time & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Time</Label>
                  <div className="relative mt-2">
                    <Clock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      type="time"
                      value={formData.departureTime}
                      onChange={(e) => handleInputChange("departureTime", e.target.value)}
                      className={`pl-10 text-lg h-12 ${errors.departureTime ? "border-red-500" : ""}`}
                      data-testid="input-departure-time"
                    />
                  </div>
                  {errors.departureTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.departureTime}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Date</Label>
                  <div className="relative mt-2">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      type="date"
                      value={formData.departureDate}
                      onChange={(e) => handleInputChange("departureDate", e.target.value)}
                      className={`pl-10 text-lg h-12 ${errors.departureDate ? "border-red-500" : ""}`}
                      data-testid="input-departure-date"
                    />
                  </div>
                  {errors.departureDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.departureDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Transit Stops */}
          <div className="space-y-6">
            {formData.stops.map((stop, index) => (
              <div key={index} className="bg-white rounded-xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <MapPin className="text-accent" size={24} />
                  <h2 className="text-xl font-semibold text-textPrimary">
                    Transit Stop {index + 1}
                  </h2>
                </div>

                <div className="space-y-6">
                  {/* Location */}
                  <ConfidenceField
                    label="Location"
                    value={stop.location}
                    onChange={(value) => handleStopChange(index, "location", value)}
                    extractedField={extractedData?.stops?.[index]?.location}
                    placeholder={`Enter stop ${index + 1} location (e.g., ${index === 0 ? "Rome" : "Amsterdam"})`}
                    data-testid={`input-stop-location-${index}`}
                    className="text-lg h-12"
                  />
                  {errors.stops?.[index]?.location && (
                    <p className="text-red-500 text-sm mt-1">
                      {errors.stops[index].location}
                    </p>
                  )}

                  {/* Arrival Time & Date */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Arrival</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <Input
                          type="time"
                          value={stop.arrivalTime}
                          onChange={(e) => handleStopChange(index, "arrivalTime", e.target.value)}
                          className={`pl-10 text-lg h-12 ${errors.stops?.[index]?.arrivalTime ? "border-red-500" : ""}`}
                          data-testid={`input-stop-arrival-time-${index}`}
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
                          onChange={(e) => handleStopChange(index, "arrivalDate", e.target.value)}
                          className={`pl-10 text-lg h-12 ${errors.stops?.[index]?.arrivalDate ? "border-red-500" : ""}`}
                          data-testid={`input-stop-arrival-date-${index}`}
                        />
                      </div>
                    </div>
                    {(errors.stops?.[index]?.arrivalTime || errors.stops?.[index]?.arrivalDate) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.stops[index].arrivalTime || errors.stops[index].arrivalDate}
                      </p>
                    )}
                  </div>

                  {/* Departure Time & Date */}
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Departure</h4>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="relative">
                        <Clock
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <Input
                          type="time"
                          value={stop.departureTime}
                          onChange={(e) => handleStopChange(index, "departureTime", e.target.value)}
                          className={`pl-10 text-lg h-12 ${errors.stops?.[index]?.departureTime ? "border-red-500" : ""}`}
                          data-testid={`input-stop-departure-time-${index}`}
                        />
                      </div>
                      <div className="relative">
                        <Calendar
                          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                          size={16}
                        />
                        <Input
                          type="date"
                          value={stop.departureDate}
                          onChange={(e) => handleStopChange(index, "departureDate", e.target.value)}
                          className={`pl-10 text-lg h-12 ${errors.stops?.[index]?.departureDate ? "border-red-500" : ""}`}
                          data-testid={`input-stop-departure-date-${index}`}
                        />
                      </div>
                    </div>
                    {(errors.stops?.[index]?.departureTime || errors.stops?.[index]?.departureDate) && (
                      <p className="text-red-500 text-sm mt-1">
                        {errors.stops[index].departureTime || errors.stops[index].departureDate}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Final Destination */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Plane className="text-primary" size={24} />
              <h2 className="text-xl font-semibold text-textPrimary">Final Destination</h2>
            </div>

            <div className="space-y-6">
              {/* To Location */}
              <ConfidenceField
                label="To"
                value={formData.to}
                onChange={(value) => handleInputChange("to", value)}
                extractedField={extractedData?.stops?.[1]?.location}
                placeholder="Enter final destination (e.g., Barcelona)"
                data-testid="input-final-destination"
                className="text-lg h-12"
              />
              {errors.to && (
                <p className="text-red-500 text-sm mt-1">{errors.to}</p>
              )}

              {/* Final Arrival Time & Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-700">Arrival Time</Label>
                  <div className="relative mt-2">
                    <Clock
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      type="time"
                      value={formData.arrivalTime}
                      onChange={(e) => handleInputChange("arrivalTime", e.target.value)}
                      className={`pl-10 text-lg h-12 ${errors.arrivalTime ? "border-red-500" : ""}`}
                      data-testid="input-arrival-time"
                    />
                  </div>
                  {errors.arrivalTime && (
                    <p className="text-red-500 text-sm mt-1">{errors.arrivalTime}</p>
                  )}
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-700">Arrival Date</Label>
                  <div className="relative mt-2">
                    <Calendar
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                      size={16}
                    />
                    <Input
                      type="date"
                      value={formData.arrivalDate}
                      onChange={(e) => handleInputChange("arrivalDate", e.target.value)}
                      className={`pl-10 text-lg h-12 ${errors.arrivalDate ? "border-red-500" : ""}`}
                      data-testid="input-arrival-date"
                    />
                  </div>
                  {errors.arrivalDate && (
                    <p className="text-red-500 text-sm mt-1">{errors.arrivalDate}</p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Travel Details */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-accent" size={24} />
              <h2 className="text-xl font-semibold text-textPrimary">Travel Details</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              <div>
                <Label className="text-sm font-medium text-gray-700">Adults</Label>
                <div className="relative mt-2">
                  <Users
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="number"
                    min="1"
                    max="10"
                    value={formData.adults}
                    onChange={(e) => handleInputChange("adults", parseInt(e.target.value) || 1)}
                    className="pl-10 text-lg h-12"
                    data-testid="input-adults"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Children</Label>
                <div className="relative mt-2">
                  <Users
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="10"
                    value={formData.children}
                    onChange={(e) => handleInputChange("children", parseInt(e.target.value) || 0)}
                    className="pl-10 text-lg h-12"
                    data-testid="input-children"
                  />
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-gray-700">Luggage</Label>
                <div className="relative mt-2">
                  <Luggage
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                    size={16}
                  />
                  <Input
                    type="number"
                    min="0"
                    max="20"
                    value={formData.luggageCount}
                    onChange={(e) => handleInputChange("luggageCount", parseInt(e.target.value) || 0)}
                    className="pl-10 text-lg h-12"
                    data-testid="input-luggage"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Validation Status */}
          {validationState.isValidating && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="flex items-center gap-3">
                <Loader2 className="animate-spin text-blue-500" size={20} />
                <div>
                  <h3 className="font-medium text-blue-800">Validating Locations...</h3>
                  <p className="text-sm text-blue-600">
                    Checking {validationState.locations.length} location(s) for accuracy
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Next Button */}
          <div className="flex justify-between items-center pt-6">
            <Button
              variant="outline"
              onClick={() => navigateToStep(1)}
              className="px-6 py-3"
              data-testid="button-back"
            >
              Back
            </Button>

            <Button
              onClick={handleSubmit}
              disabled={validationState.isValidating}
              className="px-8 py-3 text-lg"
              data-testid="button-next"
            >
              {validationState.isValidating ? (
                <>
                  <Loader2 className="animate-spin mr-2" size={20} />
                  Validating...
                </>
              ) : (
                <>
                  Next
                  <ArrowRight className="ml-2" size={20} />
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}