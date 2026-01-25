import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { MapPin, Calendar, Users, Clock, Lock, Eye } from 'lucide-react';
import { PremiumAccessStatus } from '@/lib/premiumAccess';
import { PremiumFeatureLock } from './PaywallBanner';

interface TournamentCardProps {
  tournament: {
    id: string;
    name: string;
    courseName: string;
    location: string;
    startDate: string;
    daysCount: number;
    totalPlayers: number;
    maxPlayers: number;
    isLocked: boolean;
    myPredictions?: boolean;
    userRole: 'master_admin' | 'game_admin' | 'player' | 'spectator';
  };
  accessStatus?: PremiumAccessStatus;
  onJoin?: (tournamentId: string) => void;
  onManage?: (tournamentId: string) => void;
  onViewPredictions?: (tournamentId: string) => void;
}

export default function TournamentCard({ tournament, accessStatus, onJoin, onManage, onViewPredictions }: TournamentCardProps) {
  const {
    id,
    name,
    courseName,
    location,
    startDate,
    daysCount,
    totalPlayers,
    maxPlayers,
    isLocked,
    myPredictions,
    userRole
  } = tournament;

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  };

  const getStatusBadge = () => {
    if (isLocked) {
      return <Badge variant="secondary" className="flex items-center gap-1">
        <Lock className="w-3 h-3" />
        Locked
      </Badge>;
    }
    
    const spotsLeft = maxPlayers - totalPlayers;
    if (spotsLeft === 0) {
      return <Badge variant="secondary">Full</Badge>;
    }
    
    return <Badge variant="outline">{spotsLeft} spots left</Badge>;
  };

  const handleAction = (action: string) => {
    console.log(`${action} tournament ${id}`);
    
    if (action === 'join') {
      onJoin?.(id);
    } else if (action === 'manage') {
      onManage?.(id);
    } else if (action === 'view-predictions') {
      onViewPredictions?.(id);
    }
  };

  return (
    <Card className="hover-elevate" data-testid={`card-tournament-${id}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-start gap-2">
          <div>
            <h3 className="font-semibold text-lg font-serif">{name}</h3>
            <p className="text-sm text-muted-foreground font-medium">{courseName}</p>
          </div>
          {getStatusBadge()}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="w-4 h-4" />
          <span>{location}</span>
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Calendar className="w-4 h-4" />
          <span>{formatDate(startDate)}</span>
          {daysCount > 1 && (
            <>
              <span>•</span>
              <Clock className="w-4 h-4" />
              <span>{daysCount} days</span>
            </>
          )}
        </div>
        
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Users className="w-4 h-4" />
          <span>{totalPlayers}/{maxPlayers} players</span>
        </div>
        
        {myPredictions && (
          <Badge variant="outline" className="w-fit">
            Predictions made
          </Badge>
        )}
      </CardContent>
      
      <CardFooter className="pt-0 flex gap-2">
        {userRole === 'master_admin' ? (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction('manage')}
              data-testid={`button-manage-${id}`}
            >
              Manage Game
            </Button>
            <Button
              className="flex-1"
              disabled={isLocked}
              onClick={() => handleAction('join')}
              data-testid={`button-join-${id}`}
            >
              {myPredictions ? 'View Predictions' : 'Make Predictions'}
            </Button>
            {myPredictions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('view-predictions')}
                data-testid={`button-view-predictions-${id}`}
              >
                Edit
              </Button>
            )}
          </>
        ) : userRole === 'game_admin' ? (
          <>
            <Button
              variant="outline"
              onClick={() => handleAction('manage')}
              data-testid={`button-manage-${id}`}
            >
              Manage
            </Button>
            <Button
              className="flex-1"
              disabled={isLocked}
              onClick={() => handleAction('join')}
              data-testid={`button-join-${id}`}
            >
              {myPredictions ? 'View Predictions' : 'Make Predictions'}
            </Button>
            {myPredictions && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleAction('view-predictions')}
                data-testid={`button-view-predictions-${id}`}
              >
                Edit
              </Button>
            )}
          </>
        ) : (
          <>
            {/* For view-only users (free tier after Dec 1), show view-only button */}
            {accessStatus?.accessLevel === 'view_only' ? (
              <Button
                variant="outline"
                className="flex-1"
                disabled
                data-testid={`button-view-only-${id}`}
              >
                <Eye className="w-4 h-4 mr-2" />
                View Only
              </Button>
            ) : (
              <>
                <Button
                  className="flex-1"
                  disabled={isLocked}
                  onClick={() => handleAction('join')}
                  data-testid={`button-join-${id}`}
                >
                  {myPredictions ? 'View Predictions' : 'Make Predictions'}
                </Button>
                {myPredictions && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleAction('view-predictions')}
                    data-testid={`button-view-predictions-${id}`}
                  >
                    Edit
                  </Button>
                )}
              </>
            )}
          </>
        )}
      </CardFooter>
    </Card>
  );
}