import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Coins, TrendingUp, TrendingDown, History, Wallet, Info } from 'lucide-react';
import { walletService } from '@/lib/walletService';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface TokenBalanceProps {
  userId: string;              // Add userId to fetch wallet data
  currentBalance?: number;     // Optional - will use wallet service if not provided
  totalEarned?: number;
  totalSpent?: number;
  recentTransactions?: Array<{
    id: string;
    type: 'win' | 'loss' | 'allocation' | 'bonus';
    amount: number;
    description: string;
    timestamp: string;
  }>;
  onViewHistory?: () => void;
  showDisclaimer?: boolean;    // Option to show/hide disclaimer
}

export default function TokenBalance({ 
  userId,
  currentBalance, 
  totalEarned, 
  totalSpent, 
  recentTransactions,
  onViewHistory,
  showDisclaimer = true
}: TokenBalanceProps) {
  // Initialize wallet if needed and get wallet summary
  const walletSummary = walletService.getWalletSummary(userId);
  
  // Use wallet service data if available, otherwise use provided props
  const displayBalance = currentBalance ?? walletSummary?.balance ?? 0;
  const displayEarned = totalEarned ?? walletSummary?.totalEarned ?? 0;
  const displaySpent = totalSpent ?? walletSummary?.totalSpent ?? 0;
  const displayTransactions = recentTransactions ?? walletSummary?.recentTransactions ?? [];
  
  const netGain = displayEarned - displaySpent;
  const showStats = displayEarned > 0 || displaySpent > 0;

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'win':
        return <TrendingUp className="w-3 h-3 text-green-600" />;
      case 'loss':
        return <TrendingDown className="w-3 h-3 text-red-600" />;
      default:
        return <Coins className="w-3 h-3 text-muted-foreground" />;
    }
  };

  const formatAmount = (amount: number, showSign = false) => {
    const formatted = amount.toLocaleString();
    if (showSign && amount > 0) {
      return `+${formatted}`;
    }
    return formatted;
  };

  return (
    <Card data-testid="card-token-balance">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-primary" />
            <h3 className="font-semibold">Gaming Wallet</h3>
          </div>
          {onViewHistory && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                console.log('View token history');
                onViewHistory();
              }}
              data-testid="button-view-history"
            >
              <History className="w-4 h-4" />
            </Button>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {showDisclaimer && (
          <Alert className="border-muted bg-muted/30">
            <Info className="h-4 w-4" />
            <AlertDescription className="text-sm">
              Gaming tokens only • No monetary value • For entertainment purposes
            </AlertDescription>
          </Alert>
        )}
        <div className="text-center">
          <div className="text-3xl font-bold font-mono text-primary">
            {formatAmount(displayBalance)}
          </div>
          <div className="text-sm text-muted-foreground">Available Gaming Tokens</div>
          <div className="text-xs text-muted-foreground/80 mt-1">
            No monetary value • Gaming tokens only
          </div>
        </div>

        {showStats && (
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold text-green-600 font-mono">
                {formatAmount(displayEarned)}
              </div>
              <div className="text-xs text-muted-foreground">Total Gaming Tokens Earned</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold text-red-600 font-mono">
                {formatAmount(displaySpent)}
              </div>
              <div className="text-xs text-muted-foreground">Total Gaming Tokens Spent</div>
            </div>
          </div>
        )}

        {showStats && (
          <div className="text-center pt-2 border-t">
            <div className={`text-sm font-medium ${netGain >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              Net: {formatAmount(netGain, true)} gaming tokens
            </div>
          </div>
        )}

        {displayTransactions.length > 0 && (
          <div>
            <h4 className="text-sm font-medium mb-2">Recent Activity</h4>
            <div className="space-y-2">
              {displayTransactions.slice(0, 3).map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between text-sm p-2 rounded bg-muted/50"
                >
                  <div className="flex items-center gap-2">
                    {getTransactionIcon(transaction.type)}
                    <span className="truncate">{transaction.description}</span>
                  </div>
                  <Badge
                    variant={transaction.type === 'win' ? 'default' : 'outline'}
                    className="font-mono text-xs"
                  >
                    {transaction.type === 'win' ? '+' : '-'}{Math.abs(transaction.amount)}
                  </Badge>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}