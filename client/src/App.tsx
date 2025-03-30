import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { ThemeProvider } from "@/components/ui/theme-provider";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import Dashboard from "@/pages/dashboard";
import Profile from "@/pages/profile";
import Attractions from "@/pages/attractions";
import Events from "@/pages/events";
import Transportation from "@/pages/transportation";
import Feedback from "@/pages/feedback";
import { ProtectedRoute } from "@/lib/protected-route";
import { AuthProvider } from "@/hooks/use-auth";

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute path="/" component={Dashboard} />
      <ProtectedRoute path="/profile" component={Profile} />
      <ProtectedRoute path="/attractions" component={Attractions} />
      <ProtectedRoute path="/events" component={Events} />
      <ProtectedRoute path="/transportation" component={Transportation} />
      <ProtectedRoute path="/feedback" component={Feedback} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  // Add a global error boundary
  const [hasError, setHasError] = useState(false);

  // Provide a way to recover from errors
  useEffect(() => {
    window.addEventListener('error', (event) => {
      console.error('Global error caught:', event.error);
      setHasError(true);
    });
    
    return () => {
      window.removeEventListener('error', () => {});
    };
  }, []);

  // If there's a global error, show a fallback UI
  if (hasError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h1 className="text-2xl font-bold mb-4">Something went wrong</h1>
        <p className="mb-4">We're sorry, but there was an error loading the application.</p>
        <button
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          onClick={() => {
            setHasError(false);
            window.location.reload();
          }}
        >
          Try Again
        </button>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light">
        <AuthProvider>
          <Router />
          <Toaster />
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
