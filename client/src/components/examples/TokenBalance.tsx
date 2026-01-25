import TokenBalance from '../TokenBalance';

export default function TokenBalanceExample() {
  //todo: remove mock functionality
  const recentTransactions = [
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

  return (
    <div className="max-w-sm">
      <TokenBalance
        currentBalance={1250}
        totalEarned={2400}
        totalSpent={1150}
        recentTransactions={recentTransactions}
        onViewHistory={() => console.log('View full token history')}
      />
    </div>
  );
}