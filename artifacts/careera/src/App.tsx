import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";

import Landing from "@/pages/landing";
import Login from "@/pages/login";
import Signup from "@/pages/signup";
import OrganizerSignup from "@/pages/organizer-signup";
import StudentDashboard from "@/pages/student-dashboard";
import OrganizerDashboard from "@/pages/organizer-dashboard";
import AdminDashboard from "@/pages/admin-dashboard";
import EventDetail from "@/pages/event-detail";
import PendingApproval from "@/pages/pending-approval";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/login" component={Login} />
      <Route path="/signup" component={Signup} />
      <Route path="/organizer-signup" component={OrganizerSignup} />
      <Route path="/dashboard" component={StudentDashboard} />
      <Route path="/organizer" component={OrganizerDashboard} />
      <Route path="/admin" component={AdminDashboard} />
      <Route path="/events/:id" component={EventDetail} />
      <Route path="/pending-approval" component={PendingApproval} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
