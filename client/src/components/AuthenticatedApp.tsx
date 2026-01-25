import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import HeroSection from '@/components/HeroSection';
import TournamentCard from '@/components/TournamentCard';
import Navigation from '@/components/Navigation';
import TokenBalance from '@/components/TokenBalance';
import PredictionInterface from '@/components/PredictionInterface';
import Leaderboard from '@/components/Leaderboard';
import GameManagement from '@/components/GameManagement';
import ProfileEditor from '@/components/ProfileEditor';
import AdminAnalytics from '@/components/AdminAnalytics';
import GolfGeniusAdmin from '@/components/GolfGeniusAdmin';
import LegalDisclaimer from '@/components/LegalDisclaimer';
import PaywallBanner, { PremiumFeatureLock } from '@/components/PaywallBanner';
import { ThemeToggle } from '@/components/ThemeProvider';
import { initializeUserWallet } from '@/lib/walletService';
import { checkPremiumAccess } from '@/lib/premiumAccess';
import { queryClient } from '@/lib/queryClient';
interface User {
  id: string;
  name: string;
  email?: string;
  role: 'master_admin' | 'player' | 'game_admin' | 'spectator';
  profileImageUrl?: string;
  tokenBalance: number;
}

// Mock tournament data with required fields for TournamentCard
const getMockTournaments = (userRole: string) => [
  {
    id: 'spring-championship',
    name: 'Spring Championship',
    courseName: 'Pebble Beach Golf Links',
    location: 'Pebble Beach, CA',
    startDate: '2024-04-01',
    daysCount: 3,
    totalPlayers: 25,
    maxPlayers: 60,
    isLocked: false,
    myPredictions: false,
    userRole: userRole as 'master_admin' | 'game_admin' | 'player' | 'spectator',
    description: 'Annual spring tournament at Pebble Beach'
  },
  {
    id: 'masters-preview',
    name: 'Masters Preview Event',
    courseName: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    startDate: '2024-04-08',
    daysCount: 1,
    totalPlayers: 18,
    maxPlayers: 30,
    isLocked: true,
    myPredictions: true,
    userRole: userRole as 'master_admin' | 'game_admin' | 'player' | 'spectator',
    description: 'Warm-up for the Masters tournament'
  },
  {
    id: 'weekend-classic',
    name: 'Weekend Classic',
    courseName: 'Torrey Pines Golf Course',
    location: 'San Diego, CA',
    startDate: '2024-04-15',
    daysCount: 2,
    totalPlayers: 22,
    maxPlayers: 40,
    isLocked: false,
    myPredictions: false,
    userRole: userRole as 'master_admin' | 'game_admin' | 'player' | 'spectator',
    description: 'Two-day weekend competition'
  }
];

const mockPlayers = [
  { id: '1', name: 'Tiger Woods', odds: 3.5, isEligible: true },
  { id: '2', name: 'Rory McIlroy', odds: 4.2, isEligible: true },
  { id: '3', name: 'Jon Rahm', odds: 5.1, isEligible: true },
  { id: '4', name: 'Scottie Scheffler', odds: 6.0, isEligible: true },
  { id: '5', name: 'Justin Thomas', odds: 8.5, isEligible: true }
];

const mockTransactions = [
  {
    id: '1',
    type: 'win' as const,
    amount: 450,
    description: 'Spring Championship - 2nd Place',
    timestamp: '2024-03-20T10:30:00Z'
  },
  {
    id: '2',
    type: 'allocation' as const,
    amount: 200,
    description: 'Weekend Classic Prediction',
    timestamp: '2024-03-19T15:45:00Z'
  },
  {
    id: '3',
    type: 'loss' as const,
    amount: 150,
    description: 'Masters Preview - No Winner',
    timestamp: '2024-03-18T09:15:00Z'
  }
];

const mockLeaderboardEntries = [
  {
    id: '1',
    playerName: 'Tiger Woods',
    position: 1,
    previousPosition: 3,
    score: -5,
    holesCompleted: 18,
    totalHoles: 18,
    tokens: 2400,
    isUser: false
  },
  {
    id: '2',
    playerName: 'Rory McIlroy',
    position: 2,
    previousPosition: 1,
    score: -3,
    holesCompleted: 18,
    totalHoles: 18,
    tokens: 1800,
    isUser: false
  },
  {
    id: '3',
    playerName: 'Current User',
    position: 3,
    previousPosition: 4,
    score: -1,
    holesCompleted: 16,
    totalHoles: 18,
    tokens: 1200,
    isUser: true
  },
  {
    id: '4',
    playerName: 'Jon Rahm',
    position: 4,
    previousPosition: 2,
    score: 1,
    holesCompleted: 18,
    totalHoles: 18,
    tokens: 800,
    isUser: false
  },
  {
    id: '5',
    playerName: 'Scottie Scheffler',
    position: 5,
    previousPosition: 5,
    score: 3,
    holesCompleted: 15,
    totalHoles: 18,
    tokens: 600,
    isUser: false
  }
];

interface AuthenticatedAppProps {
  user: User;
}

export default function AuthenticatedApp({ user }: AuthenticatedAppProps) {
  const [currentView, setCurrentView] = useState<'hero' | 'tournaments' | 'prediction' | 'leaderboard' | 'management' | 'analytics' | 'profile'>('hero');
  const mockTournaments = getMockTournaments(user.role);
  const premiumAccess = checkPremiumAccess(user.role);

  // Initialize user wallet on component mount
  useEffect(() => {
    if (user?.id) {
      initializeUserWallet(user.id);
    }
  }, [user?.id]);

  const handleNavigation = (view: string) => {
    console.log('Navigating to:', view);
    if (view === 'tournaments') setCurrentView('tournaments');
    else if (view === 'leaderboard') setCurrentView('leaderboard');
    else if (view === 'manage-game') setCurrentView('management');
    else if (view === 'admin') setCurrentView('management'); // Platform Admin → Management
    else if (view === 'users') setCurrentView('management'); // User Management → Management  
    else if (view === 'players') setCurrentView('management'); // Players → Management
    else if (view === 'golf-genius') setCurrentView('golf-genius'); // Golf Genius → Golf Genius Admin
    else if (view === 'profile') setCurrentView('profile');
    else if (view === 'hero') setCurrentView('hero');
  };

  const renderMainContent = () => {
    switch (currentView) {
      case 'tournaments':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">Active Tournaments</h2>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hero')}
                data-testid="button-back-to-home"
              >
                Back to Home
              </Button>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {mockTournaments.map((tournament) => (
                <TournamentCard
                  key={tournament.id}
                  tournament={tournament}
                  accessStatus={premiumAccess}
                  onJoin={() => setCurrentView('prediction')}
                  onManage={() => setCurrentView('management')}
                  onViewPredictions={() => setCurrentView('prediction')}
                />
              ))}
            </div>
          </div>
        );

      case 'prediction':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">Make Your Predictions</h2>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('tournaments')}
                data-testid="button-back-to-tournaments"
              >
                Back to Tournaments
              </Button>
            </div>
            <PremiumFeatureLock accessStatus={premiumAccess} featureName="Making predictions">
              <div className="bg-gradient-to-b from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20 rounded-lg p-8">
                <PredictionInterface
                  players={mockPlayers}
                  userId={user.id}
                  availableTokens={user.tokenBalance}
                  onSubmitPredictions={(predictions) => {
                    console.log('Predictions submitted:', predictions);
                    setCurrentView('tournaments');
                  }}
                />
              </div>
            </PremiumFeatureLock>
          </div>
        );

      case 'leaderboard':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">Leaderboard</h2>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hero')}
                data-testid="button-back-to-home"
              >
                Back to Home
              </Button>
            </div>
            <div className="grid gap-8 lg:grid-cols-2">
              <Leaderboard 
                entries={mockLeaderboardEntries}
                title="Tournament Leaderboard"
                showTokens={premiumAccess.hasPremiumAccess}
                highlightUser={true}
              />
              <div className="space-y-6">
                <PremiumFeatureLock accessStatus={premiumAccess} featureName="Token tracking and wallet">
                  <TokenBalance
                    userId={user.id}
                    currentBalance={user.tokenBalance}
                    totalEarned={2400}
                    totalSpent={1150}
                    recentTransactions={mockTransactions}
                  />
                </PremiumFeatureLock>
              </div>
            </div>
          </div>
        );

      case 'management':
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">Game Management</h2>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hero')}
                data-testid="button-back-to-home"
              >
                Back to Home
              </Button>
            </div>
            <GameManagement />
          </div>
        );

      case 'analytics':
        // Role gating - only master_admin and game_admin can access analytics
        if (!['master_admin', 'game_admin'].includes(user.role)) {
          return (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
              <p className="text-muted-foreground mb-8">You need administrator privileges to access analytics.</p>
              <Button onClick={() => setCurrentView('hero')}>Return to Home</Button>
            </div>
          );
        }
        
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">Analytics Dashboard</h2>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hero')}
                data-testid="button-back-to-home"
              >
                Back to Home
              </Button>
            </div>
            <PremiumFeatureLock 
              accessStatus={premiumAccess} 
              featureName="Advanced analytics and CSV exports"
            >
              <AdminAnalytics 
                userRole={user.role as 'master_admin' | 'game_admin'}
                gameId={user.role === 'game_admin' ? 'GAME123' : undefined}
              />
            </PremiumFeatureLock>
          </div>
        );

      case 'golf-genius':
        // Role gating - only master_admin can access Golf Genius integration
        if (user.role !== 'master_admin') {
          return (
            <div className="text-center py-16">
              <h2 className="text-2xl font-bold mb-4">Access Restricted</h2>
              <p className="text-muted-foreground mb-8">You need master administrator privileges to access Golf Genius integration.</p>
              <Button onClick={() => setCurrentView('hero')}>Return to Home</Button>
            </div>
          );
        }
        
        return (
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-bold font-serif">Golf Genius Integration</h2>
              <Button 
                variant="outline" 
                onClick={() => setCurrentView('hero')}
                data-testid="button-back-to-home"
              >
                Back to Home
              </Button>
            </div>
            <GolfGeniusAdmin />
          </div>
        );

      case 'profile':
        return (
          <div className="space-y-8">
            <ProfileEditor
              user={{
                ...user,
                joinedDate: '2024-01-15',
                gamesPlayed: 24,
                accuracy: 68
              }}
              onSave={async (updatedUser) => {
                try {
                  // Update profile via API
                  const response = await fetch('/api/user/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(updatedUser),
                  });
                  
                  if (response.ok) {
                    // Refresh user data
                    await queryClient.invalidateQueries({ queryKey: ['/api/auth/user'] });
                    setCurrentView('hero');
                  }
                } catch (error) {
                  console.error('Profile update failed:', error);
                }
              }}
              onCancel={() => setCurrentView('hero')}
            />
          </div>
        );

      default:
        return (
          <div className="space-y-12">
            <HeroSection
              userRole={user.role}
              userName={user.name}
              onGetStarted={() => console.log('Get started')}
              onViewTournaments={() => setCurrentView('tournaments')}
            />
            
            <div className="grid gap-8 lg:grid-cols-2">
              <div className="space-y-6">
                <h3 className="text-xl font-semibold font-serif">Active Tournaments</h3>
                <div className="grid gap-4">
                  {mockTournaments.slice(0, 2).map((tournament) => (
                    <TournamentCard
                      key={tournament.id}
                      tournament={tournament}
                      onJoin={() => setCurrentView('prediction')}
                      onManage={() => setCurrentView('management')}
                      onViewPredictions={() => setCurrentView('prediction')}
                    />
                  ))}
                </div>
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setCurrentView('tournaments')}
                  data-testid="button-view-all-tournaments"
                >
                  View All Tournaments
                </Button>
              </div>
              
              <div className="space-y-6">
                <PremiumFeatureLock 
                  accessStatus={premiumAccess} 
                  featureName="Detailed transaction history"
                >
                  <TokenBalance
                    userId={user.id}
                    currentBalance={user.tokenBalance}
                    totalEarned={2400}
                    totalSpent={1150}
                    recentTransactions={mockTransactions}
                  />
                </PremiumFeatureLock>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header Navigation - Full Width */}
      <div className="sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 w-full">
        <div className="w-full px-4">
          <div className="flex justify-between items-center py-4">
            <Navigation
              userRole={user.role}
              userName={user.name}
              tokenBalance={premiumAccess.hasPremiumAccess ? user.tokenBalance : undefined}
              hasFullAccess={premiumAccess.hasPremiumAccess}
              onNavigate={handleNavigation}
            />
            <ThemeToggle />
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {/* Paywall Banner - Show if user doesn't have premium access */}
        <PaywallBanner accessStatus={premiumAccess} variant="banner" />
        
        {renderMainContent()}
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