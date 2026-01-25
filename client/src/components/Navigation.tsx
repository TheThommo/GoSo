import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Menu, X, Trophy, Users, Settings, TrendingUp, BarChart, Database } from 'lucide-react';

interface NavigationProps {
  userRole: 'master_admin' | 'game_admin' | 'player' | 'spectator';
  userName: string;
  tokenBalance?: number;
  hasFullAccess?: boolean;
  onNavigate?: (page: string) => void;
}

export default function Navigation({ userRole, userName, tokenBalance, hasFullAccess = true, onNavigate }: NavigationProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavigation = (page: string) => {
    console.log(`Navigating to ${page}`);
    
    // For analytics, still use URL navigation as it's a separate route
    if (page === 'analytics') {
      window.location.href = '/analytics';
      return;
    }
    
    // All other navigation uses internal state management
    onNavigate?.(page);
    setIsMenuOpen(false);
  };

  const getNavItems = () => {
    const baseItems = [
      { id: 'tournaments', label: 'Tournaments', icon: Trophy },
      { id: 'leaderboard', label: 'Leaderboard', icon: TrendingUp },
    ];

    if (userRole === 'master_admin') {
      return [
        ...baseItems,
        { id: 'analytics', label: 'Platform Analytics', icon: BarChart },
        { id: 'golf-genius', label: 'Golf Genius', icon: Database },
        { id: 'admin', label: 'Platform Admin', icon: Settings },
        { id: 'users', label: 'User Management', icon: Users },
      ];
    } else if (userRole === 'game_admin') {
      return [
        ...baseItems,
        { id: 'analytics', label: 'Game Analytics', icon: BarChart },
        { id: 'manage-game', label: 'Manage Game', icon: Settings },
        { id: 'players', label: 'Players', icon: Users },
      ];
    } else {
      // For view-only users, hide analytics and advanced features
      if (!hasFullAccess) {
        return baseItems;
      }
      return baseItems;
    }
  };

  const navItems = getNavItems();

  return (
    <nav className="bg-primary text-primary-foreground p-4 shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h1 className="text-xl font-bold font-serif">Golf Society</h1>
          <div className="hidden md:flex items-center space-x-3">
            <Badge variant="outline" className="border-primary-foreground/30 px-3 py-1">
              {userRole.replace('_', ' ').toUpperCase()}
            </Badge>
            <div className="text-primary-foreground">
              <span className="text-sm font-medium">{userName}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {typeof tokenBalance === 'number' && (
            <div className="hidden sm:flex items-center space-x-2">
              <span className="text-sm">Gaming Tokens:</span>
              <Badge variant="secondary" className="font-mono">
                {tokenBalance.toLocaleString()}
              </Badge>
            </div>
          )}
          
          <div className="flex items-center space-x-3">
            <div className="hidden sm:block text-right">
              <div className="text-sm font-medium text-primary-foreground">{userName}</div>
              <div className="text-xs text-primary-foreground/80">
                {userRole.replace('_', ' ').toUpperCase()}
              </div>
            </div>
            <button 
              onClick={() => handleNavigation('profile')}
              className="focus:outline-none focus:ring-2 focus:ring-primary-foreground/50 rounded-full"
              data-testid="button-open-profile"
            >
              <Avatar className="w-8 h-8 hover-elevate">
                <AvatarImage src="" />
                <AvatarFallback className="text-primary bg-primary-foreground">
                  {userName.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
            </button>
          </div>

          <Button
            size="icon"
            variant="ghost"
            className="sm:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            data-testid="button-menu-toggle"
          >
            {isMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="mt-4 pt-4 border-t border-primary-foreground/20 sm:hidden">
          <div className="space-y-2">
            {/* User Info in Mobile */}
            <div className="flex items-center justify-between p-2 bg-primary-foreground/10 rounded-lg">
              <div>
                <div className="text-sm font-medium text-primary-foreground">{userName}</div>
                <Badge variant="outline" className="border-primary-foreground/30 text-xs mt-1">
                  {userRole.replace('_', ' ').toUpperCase()}
                </Badge>
              </div>
            </div>
            {typeof tokenBalance === 'number' && (
              <div className="flex items-center justify-between p-2">
                <span className="text-sm">Gaming Tokens:</span>
                <Badge variant="secondary" className="font-mono">
                  {tokenBalance.toLocaleString()}
                </Badge>
              </div>
            )}
            {navItems.map((item) => (
              <Button
                key={item.id}
                variant="ghost"
                className="w-full justify-start"
                onClick={() => handleNavigation(item.id)}
                data-testid={`button-nav-${item.id}`}
              >
                <item.icon className="w-4 h-4 mr-2" />
                {item.label}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Desktop Menu */}
      <div className="hidden sm:flex mt-4 space-x-2">
        {navItems.map((item) => (
          <Button
            key={item.id}
            variant="ghost"
            size="sm"
            onClick={() => handleNavigation(item.id)}
            data-testid={`button-nav-${item.id}`}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.label}
          </Button>
        ))}
      </div>
    </nav>
  );
}