import ResultsEntry from '../ResultsEntry';

export default function ResultsEntryExample() {
  const mockPlayers = [
    { id: '1', name: 'Tiger Woods', handicap: 0 },
    { id: '2', name: 'Rory McIlroy', handicap: 2 },
    { id: '3', name: 'Jon Rahm', handicap: 1 },
    { id: '4', name: 'Justin Thomas', handicap: 3 },
    { id: '5', name: 'Collin Morikawa', handicap: 2 },
    { id: '6', name: 'Xander Schauffele', handicap: 4 }
  ];

  const mockPredictions = [
    {
      userId: '1',
      userName: 'John Doe',
      firstPlace: '1', // Tiger Woods
      secondPlace: '2', // Rory McIlroy  
      thirdPlace: '3', // Jon Rahm
      tokenAllocations: { '1': 300, '2': 200 } as Record<string, number>,
      totalTokensUsed: 500
    },
    {
      userId: '2', 
      userName: 'Jane Smith',
      firstPlace: '2', // Rory McIlroy
      secondPlace: '1', // Tiger Woods
      thirdPlace: '4', // Justin Thomas
      tokenAllocations: { '2': 400, '4': 150 } as Record<string, number>,
      totalTokensUsed: 550
    },
    {
      userId: '3',
      userName: 'Mike Johnson', 
      firstPlace: '3', // Jon Rahm
      secondPlace: '4', // Justin Thomas
      thirdPlace: '1', // Tiger Woods
      tokenAllocations: { '3': 250, '1': 100 } as Record<string, number>,
      totalTokensUsed: 350
    }
  ];

  return (
    <div className="max-w-4xl mx-auto p-4">
      <ResultsEntry
        players={mockPlayers}
        userPredictions={mockPredictions}
        isFinalized={false}
        onFinalizeResults={(results) => console.log('Results finalized:', results)}
      />
    </div>
  );
}