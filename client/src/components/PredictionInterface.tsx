import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Trophy, Medal, Award, Coins, Calculator, Info } from 'lucide-react';
import { walletService } from '@/lib/walletService';

interface Player {
  id: string;
  name: string;
  handicap: number;
  odds: number;
}

interface PredictionInterfaceProps {
  players: Player[];
  userId: string;              // Add userId to integrate with wallet service
  availableTokens?: number;    // Make optional since we'll use wallet service
  isLocked?: boolean;
  onSubmitPredictions?: (predictions: any) => void;
}

export default function PredictionInterface({ 
  players, 
  userId,
  availableTokens: propAvailableTokens, 
  isLocked = false, 
  onSubmitPredictions 
}: PredictionInterfaceProps) {
  // Get wallet data as single source of truth
  const walletSummary = walletService.getWalletSummary(userId);
  const availableTokens = propAvailableTokens ?? walletSummary?.balance ?? 0;
  const [firstPlace, setFirstPlace] = useState<string>('');
  const [secondPlace, setSecondPlace] = useState<string>('');
  const [thirdPlace, setThirdPlace] = useState<string>('');
  const [tokenAllocations, setTokenAllocations] = useState<Record<string, number>>({});

  const selectedPlayers = [firstPlace, secondPlace, thirdPlace].filter(Boolean);
  const totalTokensUsed = Object.values(tokenAllocations).reduce((sum, amount) => sum + amount, 0);
  const remainingTokens = availableTokens - totalTokensUsed;

  const handlePlayerSelect = (position: 'first' | 'second' | 'third', playerId: string) => {
    console.log(`Selected ${playerId} for ${position} place`);
    
    if (position === 'first') {
      if (playerId === secondPlace) setSecondPlace('');
      if (playerId === thirdPlace) setThirdPlace('');
      setFirstPlace(playerId);
    } else if (position === 'second') {
      if (playerId === firstPlace) setFirstPlace('');
      if (playerId === thirdPlace) setThirdPlace('');
      setSecondPlace(playerId);
    } else if (position === 'third') {
      if (playerId === firstPlace) setFirstPlace('');
      if (playerId === secondPlace) setSecondPlace('');
      setThirdPlace(playerId);
    }
  };

  const handleTokenAllocation = (playerId: string, amount: number) => {
    if (amount + (totalTokensUsed - (tokenAllocations[playerId] || 0)) <= availableTokens) {
      setTokenAllocations(prev => ({
        ...prev,
        [playerId]: amount
      }));
    }
  };

  const calculatePayout = (odds: number, betAmount: number) => {
    return Math.floor(betAmount * odds);
  };

  const handleSubmit = () => {
    const predictions = {
      firstPlace,
      secondPlace,
      thirdPlace,
      tokenAllocations,
      totalTokensUsed
    };
    
    console.log('Submitting predictions:', predictions);
    onSubmitPredictions?.(predictions);
  };

  const getPositionIcon = (position: 'first' | 'second' | 'third') => {
    switch (position) {
      case 'first':
        return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 'second':
        return <Medal className="w-4 h-4 text-gray-400" />;
      case 'third':
        return <Award className="w-4 h-4 text-amber-600" />;
    }
  };

  return (
    <Card data-testid="card-prediction-interface">
      <CardHeader>
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Make Your Predictions</h3>
          <div className="flex items-center gap-2">
            <Coins className="w-4 h-4 text-primary" />
            <span className="font-mono font-medium">{remainingTokens.toLocaleString()}</span>
            <span className="text-sm text-muted-foreground">gaming tokens remaining</span>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        <Alert className="border-muted bg-muted/30">
          <Info className="h-4 w-4" />
          <AlertDescription className="text-sm">
            Gaming tokens only • No monetary value • For entertainment purposes
          </AlertDescription>
        </Alert>
        {/* Position Predictions */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            Position Predictions
          </h4>
          
          {(['first', 'second', 'third'] as const).map((position) => {
            const selectedId = position === 'first' ? firstPlace : position === 'second' ? secondPlace : thirdPlace;
            const selectedPlayer = players.find(p => p.id === selectedId);
            
            return (
              <div key={position} className="p-3 border rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  {getPositionIcon(position)}
                  <span className="font-medium capitalize">{position} Place</span>
                </div>
                
                {selectedPlayer ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {selectedPlayer.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span>{selectedPlayer.name}</span>
                      <Badge variant="outline" className="text-xs">
                        HCP {selectedPlayer.handicap}
                      </Badge>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePlayerSelect(position, '')}
                      data-testid={`button-clear-${position}`}
                    >
                      Clear
                    </Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {players
                      .filter(p => !selectedPlayers.includes(p.id))
                      .map((player) => (
                        <Button
                          key={player.id}
                          variant="outline"
                          size="sm"
                          className="justify-start"
                          onClick={() => handlePlayerSelect(position, player.id)}
                          data-testid={`button-select-${position}-${player.id}`}
                        >
                          <div className="flex items-center gap-2 w-full">
                            <Avatar className="w-5 h-5">
                              <AvatarFallback className="text-xs">
                                {player.name.split(' ').map(n => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <span className="truncate">{player.name}</span>
                            <Badge variant="secondary" className="text-xs ml-auto">
                              {player.odds}:1
                            </Badge>
                          </div>
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Token Betting */}
        <div className="space-y-4">
          <h4 className="font-medium flex items-center gap-2">
            <Calculator className="w-4 h-4" />
            Token Allocations (Optional)
          </h4>
          
          <div className="grid gap-3">
            {players.map((player) => {
              const currentAllocation = tokenAllocations[player.id] || 0;
              const potentialPayout = calculatePayout(player.odds, currentAllocation);
              
              return (
                <div key={player.id} className="p-3 border rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-6 h-6">
                        <AvatarFallback className="text-xs">
                          {player.name.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{player.name}</span>
                      <Badge variant="outline" className="text-xs">
                        {player.odds}:1
                      </Badge>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      placeholder="0"
                      value={currentAllocation || ''}
                      onChange={(e) => handleTokenAllocation(player.id, parseInt(e.target.value) || 0)}
                      className="w-24 text-center font-mono"
                      min="0"
                      max={remainingTokens + currentAllocation}
                      data-testid={`input-allocation-${player.id}`}
                    />
                    <span className="text-sm text-muted-foreground">gaming tokens</span>
                    {currentAllocation > 0 && (
                      <span className="text-sm text-green-600 font-mono ml-auto">
                        → {potentialPayout} gaming tokens
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Summary */}
        {totalTokensUsed > 0 && (
          <div className="bg-muted/50 p-4 rounded-lg">
            <h4 className="font-medium mb-2">Allocation Summary</h4>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span>Gaming Tokens Betting:</span>
                <span className="font-mono">{totalTokensUsed.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Remaining:</span>
                <span className="font-mono">{remainingTokens.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Button
          className="w-full"
          disabled={isLocked || !firstPlace || !secondPlace || !thirdPlace}
          onClick={handleSubmit}
          data-testid="button-submit-predictions"
        >
          {isLocked ? 'Predictions Locked' : 'Submit Predictions'}
        </Button>
      </CardFooter>
    </Card>
  );
}