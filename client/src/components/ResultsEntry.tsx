import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { 
  Trophy, 
  Medal, 
  Award, 
  Calculator, 
  CheckCircle, 
  DollarSign,
  Users
} from 'lucide-react';

interface Player {
  id: string;
  name: string;
  handicap: number;
  finalScore?: number;
  finalPosition?: number;
}

interface UserPrediction {
  userId: string;
  userName: string;
  firstPlace: string;
  secondPlace: string;
  thirdPlace: string;
  tokenAllocations: Record<string, number>;
  totalTokensUsed: number;
}

interface PayoutCalculation {
  userId: string;
  userName: string;
  positionPayout: number;
  tokenAllocationPayout: number;
  totalPayout: number;
  correctPredictions: {
    first: boolean;
    second: boolean;
    third: boolean;
  };
}

interface ResultsEntryProps {
  players: Player[];
  userPredictions: UserPrediction[];
  isFinalized?: boolean;
  onFinalizeResults?: (results: any) => void;
}

export default function ResultsEntry({ 
  players, 
  userPredictions, 
  isFinalized = false,
  onFinalizeResults
}: ResultsEntryProps) {
  const [playerResults, setPlayerResults] = useState<Record<string, { position: number; score: number }>>(
    players.reduce((acc, player) => ({
      ...acc,
      [player.id]: { 
        position: player.finalPosition || 0, 
        score: player.finalScore || 0 
      }
    }), {})
  );
  const [payoutCalculations, setPayoutCalculations] = useState<PayoutCalculation[]>([]);
  const [showPayouts, setShowPayouts] = useState(false);

  const handlePlayerResultChange = (playerId: string, field: 'position' | 'score', value: number) => {
    setPlayerResults(prev => ({
      ...prev,
      [playerId]: {
        ...prev[playerId],
        [field]: value
      }
    }));
  };

  const calculatePayouts = () => {
    console.log('Calculating payouts...');
    
    // Get top 3 players by position
    const sortedResults = Object.entries(playerResults)
      .filter(([_, result]) => result.position > 0)
      .sort(([, a], [, b]) => a.position - b.position);
    
    const firstPlaceId = sortedResults[0]?.[0];
    const secondPlaceId = sortedResults[1]?.[0];
    const thirdPlaceId = sortedResults[2]?.[0];

    // Calculate payouts for each user
    const calculations: PayoutCalculation[] = userPredictions.map(prediction => {
      let positionPayout = 0;
      let tokenAllocationPayout = 0;
      
      const correctPredictions = {
        first: prediction.firstPlace === firstPlaceId,
        second: prediction.secondPlace === secondPlaceId,
        third: prediction.thirdPlace === thirdPlaceId
      };

      // Position prediction payouts (fixed rewards)
      if (correctPredictions.first) positionPayout += 500;
      if (correctPredictions.second) positionPayout += 300;
      if (correctPredictions.third) positionPayout += 200;
      
      // Perfect prediction bonus
      if (correctPredictions.first && correctPredictions.second && correctPredictions.third) {
        positionPayout += 1000; // Perfect prediction bonus
      }

      // Token allocation payouts
      Object.entries(prediction.tokenAllocations).forEach(([playerId, allocationAmount]) => {
        const playerResult = playerResults[playerId];
        if (playerResult?.position === 1) {
          // Winner payout - 3x allocation amount
          tokenAllocationPayout += allocationAmount * 3;
        } else if (playerResult?.position === 2) {
          // Second place - 2x allocation amount
          tokenAllocationPayout += allocationAmount * 2;
        } else if (playerResult?.position === 3) {
          // Third place - 1.5x allocation amount
          tokenAllocationPayout += Math.floor(allocationAmount * 1.5);
        }
      });

      return {
        userId: prediction.userId,
        userName: prediction.userName,
        positionPayout,
        tokenAllocationPayout,
        totalPayout: positionPayout + tokenAllocationPayout,
        correctPredictions
      };
    });

    setPayoutCalculations(calculations);
    setShowPayouts(true);
  };

  const handleFinalizeResults = () => {
    const finalResults = {
      playerResults,
      payoutCalculations,
      finalizedAt: new Date().toISOString()
    };
    
    console.log('Finalizing results:', finalResults);
    onFinalizeResults?.(finalResults);
  };

  const getPositionIcon = (position: number) => {
    switch (position) {
      case 1: return <Trophy className="w-4 h-4 text-yellow-500" />;
      case 2: return <Medal className="w-4 h-4 text-gray-400" />;
      case 3: return <Award className="w-4 h-4 text-amber-600" />;
      default: return <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-xs font-bold">{position}</div>;
    }
  };

  const sortedPlayers = players.sort((a, b) => {
    const aPos = playerResults[a.id]?.position || 999;
    const bPos = playerResults[b.id]?.position || 999;
    return aPos - bPos;
  });

  return (
    <div className="space-y-6" data-testid="panel-results-entry">
      {/* Results Entry */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Trophy className="w-5 h-5" />
              Tournament Results Entry
            </h3>
            {isFinalized && (
              <Badge variant="default" className="flex items-center gap-1">
                <CheckCircle className="w-3 h-3" />
                Finalized
              </Badge>
            )}
          </div>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid gap-4">
            {sortedPlayers.map((player) => {
              const result = playerResults[player.id];
              
              return (
                <div key={player.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <Avatar className="w-10 h-10">
                    <AvatarFallback>
                      {player.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 min-w-0">
                    <div className="font-medium">{player.name}</div>
                    <div className="text-sm text-muted-foreground">
                      Handicap: {player.handicap}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result?.position > 0 && result.position <= 3 && (
                      <div className="mr-2">
                        {getPositionIcon(result.position)}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`position-${player.id}`} className="text-sm whitespace-nowrap">
                        Position:
                      </Label>
                      <Select
                        value={result?.position?.toString() || ''}
                        onValueChange={(value) => 
                          handlePlayerResultChange(player.id, 'position', parseInt(value))
                        }
                        disabled={isFinalized}
                      >
                        <SelectTrigger className="w-20" data-testid={`select-position-${player.id}`}>
                          <SelectValue placeholder="Pos" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: players.length }, (_, i) => (
                            <SelectItem key={i + 1} value={(i + 1).toString()}>
                              {i + 1}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Label htmlFor={`score-${player.id}`} className="text-sm whitespace-nowrap">
                        Score:
                      </Label>
                      <Input
                        id={`score-${player.id}`}
                        type="number"
                        value={result?.score || ''}
                        onChange={(e) => 
                          handlePlayerResultChange(player.id, 'score', parseInt(e.target.value) || 0)
                        }
                        className="w-20 text-center font-mono"
                        placeholder="0"
                        disabled={isFinalized}
                        data-testid={`input-score-${player.id}`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
        
        {!isFinalized && (
          <CardFooter className="flex gap-2">
            <Button
              onClick={calculatePayouts}
              variant="outline"
              className="flex-1"
              data-testid="button-calculate-payouts"
            >
              <Calculator className="w-4 h-4 mr-2" />
              Calculate Payouts
            </Button>
            
            {showPayouts && (
              <Button
                onClick={handleFinalizeResults}
                className="flex-1"
                data-testid="button-finalize-results"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Finalize Results
              </Button>
            )}
          </CardFooter>
        )}
      </Card>

      {/* Payout Calculations */}
      {showPayouts && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <DollarSign className="w-5 h-5" />
              Payout Calculations
            </h3>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <div className="grid gap-4">
              {payoutCalculations
                .sort((a, b) => b.totalPayout - a.totalPayout)
                .map((calculation) => (
                <div key={calculation.userId} className="p-4 border rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Avatar className="w-8 h-8">
                        <AvatarFallback className="text-xs">
                          {calculation.userName.split(' ').map(n => n[0]).join('')}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-medium">{calculation.userName}</div>
                        <div className="text-sm text-muted-foreground">
                          Predictions: {[
                            calculation.correctPredictions.first && '1st',
                            calculation.correctPredictions.second && '2nd', 
                            calculation.correctPredictions.third && '3rd'
                          ].filter(Boolean).join(', ') || 'None correct'}
                        </div>
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-xl font-bold font-mono text-primary">
                        {calculation.totalPayout.toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">tokens</div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <div className="text-muted-foreground">Position Predictions</div>
                      <div className="font-mono">{calculation.positionPayout.toLocaleString()} tokens</div>
                    </div>
                    <div>
                      <div className="text-muted-foreground">Token Allocation Winnings</div>
                      <div className="font-mono">{calculation.tokenAllocationPayout.toLocaleString()} tokens</div>
                    </div>
                  </div>
                  
                  {calculation.correctPredictions.first && 
                   calculation.correctPredictions.second && 
                   calculation.correctPredictions.third && (
                    <Badge variant="default" className="w-fit">
                      Perfect Prediction Bonus: +1000 tokens
                    </Badge>
                  )}
                </div>
              ))}
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between text-lg font-semibold">
              <span>Total Tokens Distributed:</span>
              <span className="font-mono">
                {payoutCalculations.reduce((sum, calc) => sum + calc.totalPayout, 0).toLocaleString()}
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Stats */}
      {showPayouts && (
        <Card>
          <CardHeader>
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <Users className="w-5 h-5" />
              Tournament Summary
            </h3>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold">{userPredictions.length}</div>
                <div className="text-sm text-muted-foreground">Total Players</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {payoutCalculations.filter(c => c.totalPayout > 0).length}
                </div>
                <div className="text-sm text-muted-foreground">Winners</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">
                  {payoutCalculations.filter(c => 
                    c.correctPredictions.first && c.correctPredictions.second && c.correctPredictions.third
                  ).length}
                </div>
                <div className="text-sm text-muted-foreground">Perfect Predictions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold font-mono">
                  {Math.round(payoutCalculations.reduce((sum, calc) => sum + calc.totalPayout, 0) / userPredictions.length).toLocaleString()}
                </div>
                <div className="text-sm text-muted-foreground">Avg Payout</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}