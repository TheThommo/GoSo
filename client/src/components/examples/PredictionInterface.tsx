import PredictionInterface from '../PredictionInterface';

export default function PredictionInterfaceExample() {
  //todo: remove mock functionality
  const mockPlayers = [
    { id: '1', name: 'Tiger Woods', handicap: 0, odds: 3.5 },
    { id: '2', name: 'Rory McIlroy', handicap: 2, odds: 4.2 },
    { id: '3', name: 'Jon Rahm', handicap: 1, odds: 3.8 },
    { id: '4', name: 'Justin Thomas', handicap: 3, odds: 5.1 },
    { id: '5', name: 'Collin Morikawa', handicap: 2, odds: 4.7 },
    { id: '6', name: 'Xander Schauffele', handicap: 4, odds: 6.2 }
  ];

  return (
    <div className="max-w-2xl">
      <PredictionInterface
        players={mockPlayers}
        availableTokens={1000}
        isLocked={false}
        onSubmitPredictions={(predictions) => console.log('Predictions submitted:', predictions)}
      />
    </div>
  );
}