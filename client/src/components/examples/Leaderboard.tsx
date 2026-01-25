import Leaderboard from '../Leaderboard';

export default function LeaderboardExample() {
  //todo: remove mock functionality
  const mockEntries = [
    {
      id: '1',
      playerName: 'Tiger Woods',
      position: 1,
      previousPosition: 2,
      score: -4,
      holesCompleted: 18,
      totalHoles: 18,
      tokens: 2450,
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
      tokens: 1875,
      isUser: false
    },
    {
      id: '3',
      playerName: 'John Doe',
      position: 3,
      previousPosition: 4,
      score: -1,
      holesCompleted: 16,
      totalHoles: 18,
      tokens: 1250,
      isUser: true
    },
    {
      id: '4',
      playerName: 'Jon Rahm',
      position: 4,
      previousPosition: 3,
      score: 0,
      holesCompleted: 18,
      totalHoles: 18,
      tokens: 950,
      isUser: false
    },
    {
      id: '5',
      playerName: 'Justin Thomas',
      position: 5,
      score: 2,
      holesCompleted: 14,
      totalHoles: 18,
      tokens: 750,
      isUser: false
    }
  ];

  return (
    <div className="max-w-lg">
      <Leaderboard 
        entries={mockEntries}
        title="Tournament Leaderboard"
        showTokens={true}
        highlightUser={true}
      />
    </div>
  );
}