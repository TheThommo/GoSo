import { useState } from 'react';
import { Card, CardHeader, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { 
  Download, 
  Users, 
  Trophy, 
  Coins, 
  TrendingUp, 
  Calendar,
  FileText,
  Filter
} from 'lucide-react';

interface AdminAnalyticsProps {
  userRole: 'master_admin' | 'game_admin';
  gameId?: string; // For game admin, restrict to specific game
}

export default function AdminAnalytics({ userRole, gameId }: AdminAnalyticsProps) {
  const [dateRange, setDateRange] = useState('30');
  const [exportFormat, setExportFormat] = useState('csv');
  
  // Mock analytics data - todo: replace with real data from API
  const overviewStats = [
    { label: 'Total Players', value: '1,247', change: '+12%', icon: Users, color: 'text-blue-600' },
    { label: 'Active Games', value: '28', change: '+3%', icon: Trophy, color: 'text-green-600' },
    { label: 'Gaming Tokens Allocated', value: '2.4M', change: '+18%', icon: Coins, color: 'text-yellow-600' },
    { label: 'Prediction Accuracy', value: '67%', change: '+5%', icon: TrendingUp, color: 'text-purple-600' }
  ];

  const gameActivityData = [
    { date: '2024-01-01', games: 12, players: 180, tokens: 45000 },
    { date: '2024-01-02', games: 15, players: 220, tokens: 52000 },
    { date: '2024-01-03', games: 18, players: 280, tokens: 68000 },
    { date: '2024-01-04', games: 22, players: 310, tokens: 78000 },
    { date: '2024-01-05', games: 25, players: 350, tokens: 85000 },
    { date: '2024-01-06', games: 28, players: 380, tokens: 92000 },
    { date: '2024-01-07', games: 30, players: 420, tokens: 105000 }
  ];

  const topPlayersData = [
    { name: 'John Doe', games: 45, winnings: 12500, accuracy: 72 },
    { name: 'Jane Smith', games: 38, winnings: 10200, accuracy: 69 },
    { name: 'Mike Johnson', games: 42, winnings: 9800, accuracy: 65 },
    { name: 'Sarah Wilson', games: 35, winnings: 8900, accuracy: 71 },
    { name: 'Tom Brown', games: 31, winnings: 7600, accuracy: 63 }
  ];

  const gameTypesData = [
    { name: 'Major Tournaments', value: 35, color: '#0088FE' },
    { name: 'Weekly Events', value: 42, color: '#00C49F' },
    { name: 'Private Games', value: 18, color: '#FFBB28' },
    { name: 'Practice Rounds', value: 5, color: '#FF8042' }
  ];

  const handleExportData = (dataType: string) => {
    // Generate CSV data based on type
    let csvData = '';
    let filename = '';
    
    switch (dataType) {
      case 'overview':
        csvData = 'Metric,Value,Change\n' + 
          overviewStats.map(stat => `${stat.label},${stat.value},${stat.change}`).join('\n');
        filename = `overview-stats-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'players':
        csvData = 'Player Name,Games Played,Total Winnings,Accuracy %\n' + 
          topPlayersData.map(player => `${player.name},${player.games},${player.winnings},${player.accuracy}%`).join('\n');
        filename = `player-stats-${new Date().toISOString().split('T')[0]}.csv`;
        break;
      case 'activity':
        csvData = 'Date,Games,Players,Gaming Tokens\n' + 
          gameActivityData.map(day => `${day.date},${day.games},${day.players},${day.tokens}`).join('\n');
        filename = `activity-report-${new Date().toISOString().split('T')[0]}.csv`;
        break;
    }

    // Create and download CSV file
    const blob = new Blob([csvData], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold font-serif">
            {userRole === 'master_admin' ? 'Platform Analytics' : 'Game Analytics'}
          </h2>
          <p className="text-muted-foreground">
            {userRole === 'master_admin' 
              ? 'Comprehensive platform usage and performance metrics'
              : `Analytics for Game ${gameId || 'Current Game'}`
            }
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Overview Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {overviewStats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <p className="text-xs text-green-600">{stat.change}</p>
                </div>
                <stat.icon className={`w-8 h-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Trends</TabsTrigger>
          <TabsTrigger value="players">Player Performance</TabsTrigger>
          <TabsTrigger value="games">Game Distribution</TabsTrigger>
          <TabsTrigger value="exports">Reports & Exports</TabsTrigger>
        </TabsList>

        <TabsContent value="activity">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="font-semibold">Activity Trends</h3>
                <p className="text-sm text-muted-foreground">Gaming activity over time</p>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => handleExportData('activity')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={gameActivityData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="games" stroke="#8884d8" name="Games" />
                  <Line type="monotone" dataKey="players" stroke="#82ca9d" name="Players" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="players">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <h3 className="font-semibold">Top Players</h3>
                <p className="text-sm text-muted-foreground">Most active and successful players</p>
              </div>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => handleExportData('players')}
              >
                <Download className="w-4 h-4 mr-2" />
                Export CSV
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topPlayersData.map((player, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="outline">#{index + 1}</Badge>
                      <div>
                        <div className="font-medium">{player.name}</div>
                        <div className="text-sm text-muted-foreground">
                          {player.games} games • {player.accuracy}% accuracy
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-medium">
                        {player.winnings.toLocaleString()} tokens
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="games">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Game Type Distribution</h3>
              <p className="text-sm text-muted-foreground">Breakdown of game types and participation</p>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 lg:grid-cols-2">
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={gameTypesData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {gameTypesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="space-y-3">
                  {gameTypesData.map((type, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: type.color }}
                        />
                        <span className="text-sm">{type.name}</span>
                      </div>
                      <Badge variant="outline">{type.value}%</Badge>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="exports">
          <Card>
            <CardHeader>
              <h3 className="font-semibold">Reports & Data Export</h3>
              <p className="text-sm text-muted-foreground">Generate and download detailed reports</p>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => handleExportData('overview')}
                >
                  <FileText className="w-5 h-5" />
                  <span className="text-sm">Overview Stats</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => handleExportData('players')}
                >
                  <Users className="w-5 h-5" />
                  <span className="text-sm">Player Data</span>
                </Button>
                <Button 
                  variant="outline" 
                  className="h-20 flex-col gap-2"
                  onClick={() => handleExportData('activity')}
                >
                  <TrendingUp className="w-5 h-5" />
                  <span className="text-sm">Activity Report</span>
                </Button>
              </div>
              
              <div className="p-4 border rounded-lg bg-muted/50">
                <h4 className="font-medium mb-2">Export Options</h4>
                <p className="text-sm text-muted-foreground mb-3">
                  All reports include comprehensive data for marketing and communication purposes.
                </p>
                <div className="flex items-center gap-3">
                  <Label className="text-sm">Format:</Label>
                  <Select value={exportFormat} onValueChange={setExportFormat}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV</SelectItem>
                      <SelectItem value="xlsx">Excel</SelectItem>
                      <SelectItem value="json">JSON</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}