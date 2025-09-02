import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { TravelProvider } from "@/contexts/TravelContext";
import { ProgressBar } from "@/components/ProgressBar";
import Landing from "@/pages/Landing";
import LegBasedFlightDetails from "@/pages/LegBasedFlightDetails";
import Preferences from "@/pages/Preferences";
import AIResults from "@/pages/AIResultsNew";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/flight-details" component={LegBasedFlightDetails} />
      <Route path="/preferences" component={Preferences} />
      <Route path="/results" component={AIResults} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <TravelProvider>
          <div className="min-h-screen bg-neutral">
            <ProgressBar />
            <div className="max-w-6xl mx-auto px-4 py-8">
              <Router />
            </div>
          </div>
          <Toaster />
        </TravelProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
