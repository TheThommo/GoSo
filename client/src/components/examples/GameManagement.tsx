import GameManagement from '../GameManagement';

export default function GameManagementExample() {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <GameManagement
        gameId="GAME123"
        gameName="Spring Championship 2024"
        totalPlayers={48}
        isLocked={false}
        userRole="game_admin"
        onUpdateGame={(updates) => console.log('Game updated:', updates)}
        onLockToggle={(locked) => console.log('Lock toggled:', locked)}
        onSendMessage={(message, priority) => console.log('Message sent:', { message, priority })}
        onFinalizeResults={(results) => console.log('Results finalized:', results)}
      />
    </div>
  );
}