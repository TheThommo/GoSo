import { useState } from 'react';
import { Card, CardHeader, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { 
  Settings, 
  Users, 
  Lock, 
  Unlock, 
  Send, 
  Trophy, 
  Calendar, 
  MapPin,
  AlertCircle,
  CheckCircle,
  Calculator
} from 'lucide-react';
import ResultsEntry from './ResultsEntry';

interface GameManagementProps {
  gameId: string;
  gameName: string;
  totalPlayers: number;
  isLocked: boolean;
  userRole: 'master_admin' | 'game_admin';
  onUpdateGame?: (updates: any) => void;
  onLockToggle?: (locked: boolean) => void;
  onSendMessage?: (message: string, priority: 'info' | 'warning' | 'urgent') => void;
  onFinalizeResults?: (results: any) => void;
}

export default function GameManagement({ 
  gameId,
  gameName,
  totalPlayers,
  isLocked,
  userRole,
  onUpdateGame,
  onLockToggle,
  onSendMessage,
  onFinalizeResults
}: GameManagementProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [messageText, setMessageText] = useState('');
  const [messagePriority, setMessagePriority] = useState<'info' | 'warning' | 'urgent'>('info');
  const [gameSettings, setGameSettings] = useState({
    name: gameName,
    location: 'Augusta National Golf Club',
    startDate: '2024-04-15',
    daysCount: 2,
    maxPlayers: 60,
    intervalMinutes: 10
  });

  const handleSendMessage = () => {
    if (messageText.trim()) {
      console.log('Sending message:', { text: messageText, priority: messagePriority });
      onSendMessage?.(messageText, messagePriority);
      setMessageText('');
    }
  };

  const handleUpdateSettings = () => {
    console.log('Updating game settings:', gameSettings);
    onUpdateGame?.(gameSettings);
  };

  const handleLockToggle = () => {
    console.log('Toggling lock:', !isLocked);
    onLockToggle?.(!isLocked);
  };

  return (
    <div className="space-y-6" data-testid="panel-game-management">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif">{gameName}</h2>
          <p className="text-muted-foreground">Game ID: {gameId}</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={isLocked ? 'destructive' : 'default'} className="flex items-center gap-1">
            {isLocked ? <Lock className="w-3 h-3" /> : <Unlock className="w-3 h-3" />}
            {isLocked ? 'Locked' : 'Open'}
          </Badge>
          <Button
            variant={isLocked ? 'default' : 'destructive'}
            onClick={handleLockToggle}
            data-testid="button-lock-toggle"
          >
            {isLocked ? 'Unlock Game' : 'Lock Game'}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="overview" data-testid="tab-overview">
            <Trophy className="w-4 h-4 mr-2" />
            Overview
          </TabsTrigger>
          <TabsTrigger value="players" data-testid="tab-players">
            <Users className="w-4 h-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="messages" data-testid="tab-messages">
            <Send className="w-4 h-4 mr-2" />
            Messages
          </TabsTrigger>
          <TabsTrigger value="results" data-testid="tab-results">
            <Calculator className="w-4 h-4 mr-2" />
            Results
          </TabsTrigger>
          <TabsTrigger value="settings" data-testid="tab-settings">
            <Settings className="w-4 h-4 mr-2" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Total Players</p>
                    <p className="text-2xl font-bold">{totalPlayers}</p>
                  </div>
                  <Users className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Predictions Made</p>
                    <p className="text-2xl font-bold">{Math.floor(totalPlayers * 0.73)}</p>
                  </div>
                  <Trophy className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">Tokens in Play</p>
                    <p className="text-2xl font-bold font-mono">24.5K</p>
                  </div>
                  <Settings className="w-8 h-8 text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="players" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Player Management</h3>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <Button variant="outline" className="justify-start">
                    <Users className="w-4 h-4 mr-2" />
                    Add Players
                  </Button>
                  <Button variant="outline" className="justify-start">
                    <Settings className="w-4 h-4 mr-2" />
                    Manage Handicaps
                  </Button>
                </div>
                
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Recent Activity</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>John Doe made predictions (5 min ago)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="w-4 h-4 text-green-600" />
                      <span>Tiger Woods joined the tournament (12 min ago)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-orange-500" />
                      <span>Rory McIlroy handicap updated (1 hour ago)</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messages" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Send Message to Players</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="message-priority">Priority Level</Label>
                <div className="flex gap-2">
                  {(['info', 'warning', 'urgent'] as const).map((priority) => (
                    <Button
                      key={priority}
                      size="sm"
                      variant={messagePriority === priority ? 'default' : 'outline'}
                      onClick={() => setMessagePriority(priority)}
                      data-testid={`button-priority-${priority}`}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message-text">Message</Label>
                <Textarea
                  id="message-text"
                  placeholder="Type your message to all players..."
                  value={messageText}
                  onChange={(e) => setMessageText(e.target.value)}
                  rows={4}
                  data-testid="textarea-message"
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleSendMessage}
                disabled={!messageText.trim()}
                className="w-full"
                data-testid="button-send-message"
              >
                <Send className="w-4 h-4 mr-2" />
                Send Message
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="results" className="space-y-4">
          <ResultsEntry
            players={[
              { id: '1', name: 'Tiger Woods', handicap: 0 },
              { id: '2', name: 'Rory McIlroy', handicap: 2 },
              { id: '3', name: 'Jon Rahm', handicap: 1 },
              { id: '4', name: 'Justin Thomas', handicap: 3 },
              { id: '5', name: 'Collin Morikawa', handicap: 2 },
              { id: '6', name: 'Xander Schauffele', handicap: 4 }
            ]}
            userPredictions={[
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
              },
              {
                userId: '4',
                userName: 'Sarah Wilson',
                firstPlace: '4', // Justin Thomas
                secondPlace: '5', // Collin Morikawa
                thirdPlace: '6', // Xander Schauffele
                tokenAllocations: { '4': 400, '5': 300, '6': 200 } as Record<string, number>,
                totalTokensUsed: 900
              }
            ]}
            isFinalized={false}
            onFinalizeResults={onFinalizeResults}
          />
        </TabsContent>

        <TabsContent value="settings" className="space-y-4">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Game Settings</h3>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="game-name">Tournament Name</Label>
                  <Input
                    id="game-name"
                    value={gameSettings.name}
                    onChange={(e) => setGameSettings({...gameSettings, name: e.target.value})}
                    data-testid="input-game-name"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="game-location">Course Location</Label>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="game-location"
                      value={gameSettings.location}
                      onChange={(e) => setGameSettings({...gameSettings, location: e.target.value})}
                      className="pl-9"
                      data-testid="input-game-location"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="start-date">Start Date</Label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      id="start-date"
                      type="date"
                      value={gameSettings.startDate}
                      onChange={(e) => setGameSettings({...gameSettings, startDate: e.target.value})}
                      className="pl-9"
                      data-testid="input-start-date"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="max-players">Max Players</Label>
                  <Input
                    id="max-players"
                    type="number"
                    value={gameSettings.maxPlayers}
                    onChange={(e) => setGameSettings({...gameSettings, maxPlayers: parseInt(e.target.value)})}
                    data-testid="input-max-players"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Advanced Settings</h4>
                    <p className="text-sm text-muted-foreground">Configure detailed game parameters</p>
                  </div>
                  <Switch data-testid="switch-advanced-settings" />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button
                onClick={handleUpdateSettings}
                className="w-full"
                data-testid="button-update-settings"
              >
                Update Settings
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}