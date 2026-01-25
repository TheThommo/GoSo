import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { 
  Settings, 
  Download, 
  Users, 
  Calendar, 
  Trophy, 
  BarChart3, 
  Play, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Clock, 
  AlertCircle,
  Eye
} from 'lucide-react';

interface ImportProgress {
  total: number;
  processed: number;
  successful: number;
  failed: number;
  errors: string[];
}

interface ImportLog {
  id: string;
  importType: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  createdAt: string;
  completedAt?: string;
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  errorMessage?: string;
  isAutoImport: boolean;
}

interface GolfGeniusStatus {
  configured: boolean;
  connected: boolean;
}

interface GolfGeniusPlayer {
  id: string;
  golfGeniusId: string;
  firstName?: string;
  lastName?: string;
  email?: string;
  handicapIndex?: string;
}

interface GolfGeniusEvent {
  id: string;
  golfGeniusId: string;
  name: string;
  type: string;
  startDate?: string;
  endDate?: string;
  registrationStatus?: string;
}

export default function GolfGeniusAdmin() {
  const [status, setStatus] = useState<GolfGeniusStatus>({ configured: false, connected: false });
  const [apiKey, setApiKey] = useState('');
  const [isConfiguring, setIsConfiguring] = useState(false);
  const [isImporting, setIsImporting] = useState<Record<string, boolean>>({});
  const [importProgress, setImportProgress] = useState<Record<string, ImportProgress>>({});
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [players, setPlayers] = useState<GolfGeniusPlayer[]>([]);
  const [events, setEvents] = useState<GolfGeniusEvent[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    checkStatus();
    fetchImportLogs();
    fetchData();
  }, []);

  const checkStatus = async () => {
    try {
      const response = await fetch('/api/golf-genius/status', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setStatus(data);
      }
    } catch (error) {
      console.error('Failed to check Golf Genius status:', error);
    }
  };

  const configureApi = async () => {
    if (!apiKey.trim()) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Please enter a valid API key',
      });
      return;
    }

    setIsConfiguring(true);
    try {
      const response = await fetch('/api/golf-genius/configure', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify({ apiKey }),
      });

      if (response.ok) {
        toast({
          title: 'Success',
          description: 'Golf Genius API configured successfully',
        });

        setApiKey('');
        await checkStatus();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Configuration Failed',
        description: error.message || 'Failed to configure API key',
      });
    } finally {
      setIsConfiguring(false);
    }
  };

  const runImport = async (type: string, additionalData?: any) => {
    setIsImporting(prev => ({ ...prev, [type]: true }));
    
    try {
      const response = await fetch(`/api/golf-genius/import/${type}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
        body: JSON.stringify(additionalData || {}),
      });

      if (response.ok) {
        const data = await response.json();
        setImportProgress(prev => ({ ...prev, [type]: data.result }));

        toast({
          title: 'Import Completed',
          description: `Successfully imported ${type}`,
        });

        // Refresh data and logs
        await fetchImportLogs();
        await fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Import Failed',
        description: error.message || `Failed to import ${type}`,
      });
    } finally {
      setIsImporting(prev => ({ ...prev, [type]: false }));
    }
  };

  const runScheduledImport = async () => {
    setIsImporting(prev => ({ ...prev, 'scheduled': true }));
    
    try {
      const response = await fetch('/api/golf-genius/scheduled-import', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
        },
      });

      if (response.ok) {
        toast({
          title: 'Scheduled Import Completed',
          description: 'Auto-import process completed successfully',
        });

        await fetchImportLogs();
        await fetchData();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message);
      }
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Scheduled Import Failed',
        description: error.message || 'Failed to run scheduled import',
      });
    } finally {
      setIsImporting(prev => ({ ...prev, 'scheduled': false }));
    }
  };

  const fetchImportLogs = async () => {
    try {
      const response = await fetch('/api/golf-genius/import-logs', {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setImportLogs(data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch import logs:', error);
    }
  };

  const fetchData = async () => {
    try {
      const [playersResponse, eventsResponse] = await Promise.all([
        fetch('/api/golf-genius/players?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
        fetch('/api/golf-genius/events?limit=50', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
        }),
      ]);
      
      if (playersResponse.ok && eventsResponse.ok) {
        const [playersData, eventsData] = await Promise.all([
          playersResponse.json(),
          eventsResponse.json()
        ]);
        
        setPlayers(playersData.players || []);
        setEvents(eventsData.events || []);
      }
    } catch (error) {
      console.error('Failed to fetch Golf Genius data:', error);
    }
  };

  const searchPlayers = async () => {
    if (!searchQuery.trim()) {
      fetchData();
      return;
    }

    try {
      const response = await fetch(`/api/golf-genius/players?search=${encodeURIComponent(searchQuery)}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('auth_token')}` }
      });
      if (response.ok) {
        const data = await response.json();
        setPlayers(data.players || []);
      }
    } catch (error) {
      console.error('Failed to search players:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'running':
        return <RefreshCw className="w-4 h-4 text-blue-500 animate-spin" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const renderProgressBar = (progress: ImportProgress) => {
    const percentage = progress.total > 0 ? (progress.processed / progress.total) * 100 : 0;
    return (
      <div className="space-y-2">
        <Progress value={percentage} className="w-full" />
        <div className="text-sm text-muted-foreground">
          {progress.processed} / {progress.total} processed 
          ({progress.successful} successful, {progress.failed} failed)
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto p-6 space-y-6" data-testid="golf-genius-admin">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold" data-testid="text-golf-genius-title">Golf Genius Integration</h1>
        <div className="flex items-center space-x-2">
          <Badge variant={status.configured ? 'default' : 'destructive'} data-testid="badge-configuration-status">
            {status.configured ? 'Configured' : 'Not Configured'}
          </Badge>
          <Badge variant={status.connected ? 'default' : 'destructive'} data-testid="badge-connection-status">
            {status.connected ? 'Connected' : 'Disconnected'}
          </Badge>
        </div>
      </div>

      {/* Configuration Alert */}
      {!status.configured && (
        <Alert data-testid="alert-configuration-needed">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Golf Genius API is not configured. Please configure your API key to begin importing data.
          </AlertDescription>
        </Alert>
      )}

      <Tabs defaultValue="configuration" className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="configuration" data-testid="tab-configuration">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
          <TabsTrigger value="imports" data-testid="tab-imports">
            <Download className="w-4 h-4 mr-2" />
            Data Import
          </TabsTrigger>
          <TabsTrigger value="logs" data-testid="tab-logs">
            <BarChart3 className="w-4 h-4 mr-2" />
            Import Logs
          </TabsTrigger>
          <TabsTrigger value="players" data-testid="tab-players">
            <Users className="w-4 h-4 mr-2" />
            Players
          </TabsTrigger>
          <TabsTrigger value="events" data-testid="tab-events">
            <Calendar className="w-4 h-4 mr-2" />
            Events
          </TabsTrigger>
        </TabsList>

        {/* Configuration Tab */}
        <TabsContent value="configuration" className="space-y-4">
          <Card data-testid="card-api-configuration">
            <CardHeader>
              <CardTitle>API Configuration</CardTitle>
              <CardDescription>
                Configure your Golf Genius API key to enable data imports
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="apiKey">Golf Genius API Key</Label>
                <Input
                  id="apiKey"
                  type="password"
                  placeholder="Enter your Golf Genius API key"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  data-testid="input-api-key"
                />
              </div>
              <Button 
                onClick={configureApi} 
                disabled={isConfiguring || !apiKey.trim()}
                data-testid="button-configure-api"
              >
                {isConfiguring ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Configuring...
                  </>
                ) : (
                  <>
                    <Settings className="w-4 h-4 mr-2" />
                    Configure API
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          <Card data-testid="card-connection-status">
            <CardHeader>
              <CardTitle>Connection Status</CardTitle>
              <CardDescription>
                Current status of your Golf Genius API connection
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span>API Configured</span>
                  {status.configured ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span>API Connected</span>
                  {status.connected ? (
                    <CheckCircle className="w-5 h-5 text-green-500" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-500" />
                  )}
                </div>
                <Button 
                  variant="outline" 
                  onClick={checkStatus}
                  data-testid="button-refresh-status"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Status
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Data Import Tab */}
        <TabsContent value="imports" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card data-testid="card-basic-imports">
              <CardHeader>
                <CardTitle>Basic Data Import</CardTitle>
                <CardDescription>
                  Import foundational data from Golf Genius
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => runImport('seasons')} 
                  disabled={!status.configured || isImporting.seasons}
                  className="w-full"
                  data-testid="button-import-seasons"
                >
                  {isImporting.seasons ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  Import Seasons
                </Button>

                <Button 
                  onClick={() => runImport('categories')} 
                  disabled={!status.configured || isImporting.categories}
                  className="w-full"
                  data-testid="button-import-categories"
                >
                  {isImporting.categories ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Trophy className="w-4 h-4 mr-2" />
                  )}
                  Import Categories
                </Button>

                <Button 
                  onClick={() => runImport('players')} 
                  disabled={!status.configured || isImporting.players}
                  className="w-full"
                  data-testid="button-import-players"
                >
                  {isImporting.players ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Users className="w-4 h-4 mr-2" />
                  )}
                  Import Players
                </Button>

                <Button 
                  onClick={() => runImport('events')} 
                  disabled={!status.configured || isImporting.events}
                  className="w-full"
                  data-testid="button-import-events"
                >
                  {isImporting.events ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Calendar className="w-4 h-4 mr-2" />
                  )}
                  Import Events
                </Button>
              </CardContent>
            </Card>

            <Card data-testid="card-advanced-imports">
              <CardHeader>
                <CardTitle>Advanced Import</CardTitle>
                <CardDescription>
                  Comprehensive and automated import options
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Button 
                  onClick={() => runImport('full')} 
                  disabled={!status.configured || isImporting.full}
                  className="w-full"
                  variant="default"
                  data-testid="button-import-full"
                >
                  {isImporting.full ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="w-4 h-4 mr-2" />
                  )}
                  Full Import (All Data)
                </Button>

                <Button 
                  onClick={runScheduledImport} 
                  disabled={!status.configured || isImporting.scheduled}
                  className="w-full"
                  variant="outline"
                  data-testid="button-scheduled-import"
                >
                  {isImporting.scheduled ? (
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="w-4 h-4 mr-2" />
                  )}
                  Run Scheduled Auto-Import
                </Button>

                <div className="text-sm text-muted-foreground">
                  <p>Scheduled import automatically imports recent event data including scores and results.</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Progress Display */}
          {Object.keys(importProgress).length > 0 && (
            <Card data-testid="card-import-progress">
              <CardHeader>
                <CardTitle>Import Progress</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(importProgress).map(([type, progress]) => (
                  <div key={type} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-medium capitalize">{type}</span>
                    </div>
                    {renderProgressBar(progress)}
                    {progress.errors.length > 0 && (
                      <div className="text-sm text-red-600">
                        {progress.errors.slice(0, 3).map((error, index) => (
                          <div key={index}>• {error}</div>
                        ))}
                        {progress.errors.length > 3 && (
                          <div>... and {progress.errors.length - 3} more errors</div>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Import Logs Tab */}
        <TabsContent value="logs" className="space-y-4">
          <Card data-testid="card-import-logs">
            <CardHeader>
              <CardTitle>Import History</CardTitle>
              <CardDescription>
                View all import operations and their status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {importLogs.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No import logs available
                  </div>
                ) : (
                  <div className="space-y-2">
                    {importLogs.map((log) => (
                      <div 
                        key={log.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`log-${log.id}`}
                      >
                        <div className="flex items-center space-x-4">
                          {getStatusIcon(log.status)}
                          <div>
                            <div className="font-medium capitalize">
                              {log.importType.replace('_', ' ')}
                              {log.isAutoImport && (
                                <Badge variant="outline" className="ml-2">Auto</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              Started: {formatDate(log.createdAt)}
                              {log.completedAt && (
                                <> • Completed: {formatDate(log.completedAt)}</>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm">
                            {log.recordsSuccessful} / {log.recordsProcessed} successful
                          </div>
                          {log.recordsFailed > 0 && (
                            <div className="text-sm text-red-600">
                              {log.recordsFailed} failed
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
                <Button 
                  variant="outline" 
                  onClick={fetchImportLogs}
                  data-testid="button-refresh-logs"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh Logs
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Players Tab */}
        <TabsContent value="players" className="space-y-4">
          <Card data-testid="card-players-data">
            <CardHeader>
              <CardTitle>Golf Genius Players</CardTitle>
              <CardDescription>
                View imported players from Golf Genius master roster
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex space-x-2">
                  <Input
                    placeholder="Search players..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    data-testid="input-search-players"
                  />
                  <Button onClick={searchPlayers} data-testid="button-search-players">
                    Search
                  </Button>
                </div>
                
                {players.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8">
                    No players imported yet. Run the player import to see data here.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {players.map((player) => (
                      <div 
                        key={player.id} 
                        className="flex items-center justify-between p-4 border rounded-lg"
                        data-testid={`player-${player.id}`}
                      >
                        <div>
                          <div className="font-medium">
                            {player.firstName} {player.lastName}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {player.email}
                            {player.handicapIndex && (
                              <> • Handicap: {player.handicapIndex}</>
                            )}
                          </div>
                        </div>
                        <Badge variant="outline">
                          GG ID: {player.golfGeniusId}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Events Tab */}
        <TabsContent value="events" className="space-y-4">
          <Card data-testid="card-events-data">
            <CardHeader>
              <CardTitle>Golf Genius Events</CardTitle>
              <CardDescription>
                View imported events from Golf Genius
              </CardDescription>
            </CardHeader>
            <CardContent>
              {events.length === 0 ? (
                <div className="text-center text-muted-foreground py-8">
                  No events imported yet. Run the events import to see data here.
                </div>
              ) : (
                <div className="space-y-2">
                  {events.map((event) => (
                    <div 
                      key={event.id} 
                      className="flex items-center justify-between p-4 border rounded-lg"
                      data-testid={`event-${event.id}`}
                    >
                      <div>
                        <div className="font-medium">{event.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Type: {event.type}
                          {event.startDate && (
                            <> • Start: {new Date(event.startDate).toLocaleDateString()}</>
                          )}
                          {event.registrationStatus && (
                            <> • Status: {event.registrationStatus}</>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant="outline">
                          GG ID: {event.golfGeniusId}
                        </Badge>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => runImport(`event-rounds/${event.golfGeniusId}`)}
                          disabled={isImporting[`event-rounds/${event.golfGeniusId}`]}
                          data-testid={`button-import-event-${event.id}`}
                        >
                          {isImporting[`event-rounds/${event.golfGeniusId}`] ? (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          ) : (
                            <Eye className="w-3 h-3 mr-1" />
                          )}
                          Import Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}