import { useState, useEffect } from 'react';
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";

import { ThemeProvider, ThemeToggle } from "@/components/ThemeProvider";
import Navigation from "@/components/Navigation";
import HeroSection from "@/components/HeroSection";
import TournamentCard from "@/components/TournamentCard";
import TokenBalance from "@/components/TokenBalance";
import PredictionInterface from "@/components/PredictionInterface";
import Leaderboard from "@/components/Leaderboard";
import GameManagement from "@/components/GameManagement";
// AuthForm no longer needed with Replit Auth
import NotFound from "@/pages/not-found";
import { initializeUserWallet } from '@/lib/walletService';
import LegalDisclaimer from "@/components/LegalDisclaimer";
import AdminAnalytics from "@/components/AdminAnalytics";
import ProfileEditor from "@/components/ProfileEditor";
import AuthLanding from "@/components/AuthLanding";
import AuthenticatedApp from "@/components/AuthenticatedApp";

function HomePage() {
  const { user, isLoading, isAuthenticated } = useAuth();

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold font-serif mb-4">Golf Society</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  // Show landing page if not authenticated
  if (!isAuthenticated || !user) {
    return <AuthLanding />;
  }

  // Show authenticated app
  return <AuthenticatedApp user={user} />;
}

function AnalyticsPage() {
  const { user, isLoading, isAuthenticated } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-2xl font-bold font-serif mb-4">Golf Society</div>
          <div className="text-muted-foreground">Loading...</div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <AuthLanding />;
  }
  
  // Role gating - only master_admin and game_admin can access analytics
  if (!['master_admin', 'game_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
            <p className="text-muted-foreground mb-8">You need administrator privileges to access analytics.</p>
            <Button onClick={() => window.location.href = '/'}>Return to Home</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center py-4">
            <Navigation
              userRole={user.role}
              userName={user.name}
              tokenBalance={user.tokenBalance}
              onNavigate={(page) => {
                if (page === 'hero') window.location.href = '/';
                else window.location.href = `/${page}`;
              }}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold font-serif">Analytics Dashboard</h1>
          <Button 
            variant="outline"
            onClick={() => window.location.href = '/'}
            data-testid="button-back-to-home"
          >
            Back to Home
          </Button>
        </div>
        <AdminAnalytics 
          userRole={user.role as 'master_admin' | 'game_admin'}
          gameId={user.role === 'game_admin' ? 'GAME123' : undefined}
        />
      </main>

      {/* Legal Footer */}
      <footer className="border-t bg-background/95 mt-12">
        <div className="container mx-auto px-4 py-8">
          <LegalDisclaimer variant="compact" />
        </div>
      </footer>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={HomePage} />
      <Route path="/analytics" component={AnalyticsPage} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Router />
          <Toaster />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;