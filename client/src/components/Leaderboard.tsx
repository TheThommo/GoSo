import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Trophy, Medal, Award, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface LeaderboardEntry {
  id: string;
  playerName: string;
  position: number;
  previousPosition?: number;
  score: number;
  holesCompleted: number;
  totalHoles: number;
  tokens?: number;
  isUser?: boolean;
}

interface LeaderboardProps {
  entries: LeaderboardEntry[];
  title?: string;
  showTokens?: boolean;
  highlightUser?: boolean;
}

export default function Leaderboard({ 
  entries, 
  title = 'Leaderboard', 
  showTokens = false, 
  highlightUser = true 
}: LeaderboardProps) {
  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Award className="w-5 h-5 text-amber-600" />;
      default:
        return (
          <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">
            {position}
          </div>
        );
    }
  };

  const getPositionChange = (current: number, previous?: number) => {
    if (!previous || previous === current) {
      return <Minus className="w-3 h-3 text-muted-foreground" />;
    }
    
    if (current < previous) {
      return <TrendingUp className="w-3 h-3 text-green-600" />;
    } else {
      return <TrendingDown className="w-3 h-3 text-red-600" />;
    }
  };

  const formatScore = (score: number) => {
    if (score === 0) return 'E';
    if (score > 0) return `+${score}`;
    return score.toString();
  };

  return (
    <Card data-testid="card-leaderboard">
      <CardHeader>
        <h3 className="font-semibold text-lg">{title}</h3>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-2">
          {entries.map((entry, index) => (
            <div
              key={entry.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                highlightUser && entry.isUser 
                  ? 'bg-primary/10 border border-primary/20' 
                  : 'hover:bg-muted/50'
              }`}
              data-testid={`row-leaderboard-${entry.id}`}
            >
              {/* Position */}
              <div className="flex items-center gap-2 w-12">
                {getPositionIcon(entry.position)}
                {getPositionChange(entry.position, entry.previousPosition)}
              </div>

              {/* Player Info */}
              <div className="flex items-center gap-3 flex-1 min-w-0">
                <Avatar className="w-8 h-8">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-xs">
                    {entry.playerName.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{entry.playerName}</div>
                  <div className="text-sm text-muted-foreground">
                    {entry.holesCompleted}/{entry.totalHoles} holes
                    {entry.holesCompleted < entry.totalHoles && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        In Progress
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Score */}
              <div className="text-right">
                <div className={`text-lg font-bold font-mono ${
                  entry.score < 0 ? 'text-green-600' : 
                  entry.score > 0 ? 'text-red-600' : 
                  'text-foreground'
                }`}>
                  {formatScore(entry.score)}
                </div>
                
                {showTokens && typeof entry.tokens === 'number' && (
                  <div className="text-sm text-muted-foreground font-mono">
                    {entry.tokens.toLocaleString()} tokens
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {entries.length === 0 && (
          <div className="text-center text-muted-foreground py-8">
            <Trophy className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No leaderboard data available</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}