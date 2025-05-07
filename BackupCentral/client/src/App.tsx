import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Machines from "@/pages/machines";
import Backups from "@/pages/backups";
import Alerts from "@/pages/alerts";
import Settings from "@/pages/settings";
import GetStarted from "@/pages/get-started";
import AuthPage from "@/pages/auth-page";
import { AuthProvider } from "@/hooks/use-auth";
import { ProtectedRoute } from "@/lib/protected-route";

function Router() {
  return (
    <Switch>
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/machines" component={Machines} />
      <ProtectedRoute path="/backups" component={Backups} />
      <ProtectedRoute path="/alerts" component={Alerts} />
      <ProtectedRoute path="/settings" component={Settings} />
      <ProtectedRoute path="/get-started" component={GetStarted} />
      <Route path="/auth" component={AuthPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
