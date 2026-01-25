import TournamentCard from '../TournamentCard';

export default function TournamentCardExample() {
  const tournament = {
    id: '1',
    name: 'Spring Championship 2024',
    courseName: 'Augusta National Golf Club',
    location: 'Augusta, GA',
    startDate: '2024-04-15',
    daysCount: 2,
    totalPlayers: 48,
    maxPlayers: 60,
    isLocked: false,
    myPredictions: true,
    userRole: 'player' as const
  };

  return (
    <div className="max-w-sm">
      <TournamentCard 
        tournament={tournament}
        onJoin={(id) => console.log('Join tournament:', id)}
        onManage={(id) => console.log('Manage tournament:', id)}
        onViewPredictions={(id) => console.log('View predictions:', id)}
      />
    </div>
  );
}