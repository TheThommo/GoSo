import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { createGolfGeniusImportService } from "./lib/golfGeniusImportService";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Format user data for frontend
      const displayName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}`.trim()
        : user.email?.split("@")[0] || `User${user.id}`;

      res.json({
        id: user.id,
        name: displayName,
        email: user.email,
        role: user.role || 'player',
        tokenBalance: parseInt(user.tokenBalance || '1000'),
        profileImageUrl: user.profileImageUrl,
        firstName: user.firstName,
        lastName: user.lastName,
      });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Update user profile route
  app.put('/api/user/profile', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { name, email, profileImageUrl } = req.body;
      
      const [firstName, lastName] = name ? name.split(' ') : ['', ''];
      
      const updatedUser = await storage.upsertUser({
        id: userId,
        firstName: firstName || null,
        lastName: lastName || null,
        email: email || null,
        profileImageUrl: profileImageUrl || null,
      });

      const displayName = updatedUser.firstName && updatedUser.lastName 
        ? `${updatedUser.firstName} ${updatedUser.lastName}`.trim()
        : updatedUser.email?.split("@")[0] || `User${updatedUser.id}`;

      res.json({
        id: updatedUser.id,
        name: displayName,
        email: updatedUser.email,
        role: updatedUser.role || 'player',
        tokenBalance: parseInt(updatedUser.tokenBalance || '1000'),
        profileImageUrl: updatedUser.profileImageUrl,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
      });
    } catch (error) {
      console.error("Error updating user profile:", error);
      res.status(500).json({ message: "Failed to update profile" });
    }
  });

  // Admin route to promote user to master_admin (development only)
  app.post('/api/admin/promote-master-admin', isAuthenticated, async (req: any, res) => {
    try {
      // Security: Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Admin promotion not available in production" });
      }

      const { targetUserId } = req.body;
      const currentUserId = req.user.claims.sub;
      const currentUser = await storage.getUser(currentUserId);
      
      // Only existing master_admin can promote others (or allow for first-time setup)
      const masterAdminExists = await storage.anyMasterAdminExists();
      
      if (masterAdminExists && currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Only master administrators can promote users" });
      }
      
      const targetUser = await storage.getUser(targetUserId);
      if (!targetUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Promote user to master_admin
      const updatedUser = await storage.upsertUser({
        ...targetUser,
        role: 'master_admin',
        tokenBalance: "10000" // Give master admin more tokens
      });
      
      res.json({ 
        message: "User promoted to master administrator", 
        user: {
          id: updatedUser.id,
          name: `${updatedUser.firstName} ${updatedUser.lastName}`,
          email: updatedUser.email,
          role: updatedUser.role
        }
      });
    } catch (error) {
      console.error("Error promoting user:", error);
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  // Set user role (development only - for testing)
  app.put('/api/admin/set-role', isAuthenticated, async (req: any, res) => {
    try {
      // Security: Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Role setting not available in production" });
      }

      const { role } = req.body;
      const userId = req.user.claims.sub;
      
      if (!role || !['master_admin', 'game_admin', 'player', 'spectator'].includes(role)) {
        return res.status(400).json({ message: "Invalid role specified" });
      }
      
      const user = await storage.getUser(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Update user role
      const updatedUser = await storage.upsertUser({
        ...user,
        role: role,
        tokenBalance: role === 'master_admin' ? "10000" : user.tokenBalance
      });
      
      // Update session with new role (important for immediate reflection)
      req.user.role = role;
      
      const displayName = updatedUser.firstName && updatedUser.lastName 
        ? `${updatedUser.firstName} ${updatedUser.lastName}`.trim()
        : updatedUser.email?.split("@")[0] || `User${updatedUser.id}`;
      
      res.json({ 
        message: `Role updated to ${role}`, 
        user: {
          id: updatedUser.id,
          name: displayName,
          email: updatedUser.email,
          role: updatedUser.role,
          tokenBalance: parseInt(updatedUser.tokenBalance || '1000'),
          profileImageUrl: updatedUser.profileImageUrl,
        }
      });
    } catch (error) {
      console.error("Error setting role:", error);
      res.status(500).json({ message: "Failed to set role" });
    }
  });

  // Get current user ID (for self-promotion in development)
  app.get('/api/admin/self-promote', isAuthenticated, async (req: any, res) => {
    try {
      // Security: Only allow in development environment
      if (process.env.NODE_ENV === 'production') {
        return res.status(403).json({ message: "Self-promotion not available in production" });
      }

      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if any master admin exists using proper storage interface
      const masterAdminExists = await storage.anyMasterAdminExists();
      
      if (!masterAdminExists) {
        // No master admin exists, allow self-promotion
        const updatedUser = await storage.upsertUser({
          ...user,
          role: 'master_admin',
          tokenBalance: "10000"
        });
        
        // Update session with new role
        req.user.role = 'master_admin';
        
        res.json({ 
          message: "Self-promoted to master administrator (first admin setup)", 
          user: {
            id: updatedUser.id,
            name: `${updatedUser.firstName} ${updatedUser.lastName}`,
            email: updatedUser.email,
            role: updatedUser.role
          }
        });
      } else {
        res.json({ 
          message: "Master admin already exists", 
          currentUser: {
            id: user.id,
            name: `${user.firstName} ${user.lastName}`,
            email: user.email,
            role: user.role
          },
          instructions: "Contact existing master admin for promotion or use /api/admin/promote-master-admin endpoint"
        });
      }
    } catch (error) {
      console.error("Error in self-promotion:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  // Protected route example
  app.get("/api/protected", isAuthenticated, async (req, res) => {
    const userId = (req.user as any)?.claims?.sub;
    res.json({ message: "This is protected", userId });
  });

  // Golf Genius API Routes
  
  // Configure Golf Genius API key (admin only)
  app.post('/api/golf-genius/configure', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Only master administrators can configure Golf Genius API" });
      }
      
      const { apiKey } = req.body;
      
      if (!apiKey || typeof apiKey !== 'string') {
        return res.status(400).json({ message: "API key is required" });
      }
      
      // Test the API key
      const importService = createGolfGeniusImportService(apiKey, storage);
      const connectionTest = await importService.testConnection();
      
      if (!connectionTest) {
        return res.status(400).json({ message: "Invalid API key or Golf Genius API is unreachable" });
      }
      
      await storage.setGolfGeniusApiKey(apiKey);
      
      res.json({ message: "Golf Genius API key configured successfully" });
    } catch (error) {
      console.error("Error configuring Golf Genius API:", error);
      res.status(500).json({ message: "Failed to configure API key" });
    }
  });
  
  // Get Golf Genius configuration status
  app.get('/api/golf-genius/status', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      const isConfigured = !!apiKey;
      
      let connectionStatus = false;
      if (isConfigured) {
        try {
          const importService = createGolfGeniusImportService(apiKey!, storage);
          connectionStatus = await importService.testConnection();
        } catch (error) {
          console.error("Connection test failed:", error);
        }
      }
      
      res.json({ 
        configured: isConfigured,
        connected: connectionStatus,
      });
    } catch (error) {
      console.error("Error checking Golf Genius status:", error);
      res.status(500).json({ message: "Failed to check status" });
    }
  });
  
  // Import Golf Genius data
  app.post('/api/golf-genius/import/:type', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const { type } = req.params;
      const { forceUpdate = false } = req.body;
      const importService = createGolfGeniusImportService(apiKey, storage);
      
      let result;
      
      switch (type) {
        case 'seasons':
          result = await importService.importSeasons(req.user.claims.sub, { forceUpdate });
          break;
        case 'categories':
          result = await importService.importCategories(req.user.claims.sub, { forceUpdate });
          break;
        case 'players':
          result = await importService.importPlayers(req.user.claims.sub, { forceUpdate });
          break;
        case 'events':
          const { season_id, category_id } = req.body;
          result = await importService.importEvents({ season_id, category_id }, req.user.claims.sub, { forceUpdate });
          break;
        case 'full':
          result = await importService.fullImport(req.user.claims.sub, { forceUpdate });
          break;
        default:
          return res.status(400).json({ message: `Unknown import type: ${type}` });
      }
      
      res.json({ 
        message: `Import ${type} completed`,
        result 
      });
    } catch (error) {
      console.error(`Error importing ${req.params.type}:`, error);
      res.status(500).json({ 
        message: `Failed to import ${req.params.type}`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Import event rounds for a specific event
  app.post('/api/golf-genius/import/event-rounds/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const { eventId } = req.params;
      const { forceUpdate = false } = req.body;
      const importService = createGolfGeniusImportService(apiKey, storage);
      
      // Import event rounds
      const roundsResult = await importService.importEventRounds(eventId, req.user.claims.sub, { forceUpdate });
      
      // Import courses and tees for the event
      const coursesResult = await importService.importEventCoursesAndTees(eventId, req.user.claims.sub, { forceUpdate });
      
      res.json({ 
        message: `Import event data completed for event ${eventId}`,
        rounds: roundsResult,
        courses: coursesResult
      });
    } catch (error) {
      console.error(`Error importing event data:`, error);
      res.status(500).json({ 
        message: `Failed to import event data`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Import scores for a specific event round
  app.post('/api/golf-genius/import/scores/:eventId/:roundId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const { eventId, roundId } = req.params;
      const { forceUpdate = false } = req.body;
      const importService = createGolfGeniusImportService(apiKey, storage);
      
      const result = await importService.importScores(eventId, roundId, req.user.claims.sub, { forceUpdate });
      
      res.json({ 
        message: `Import scores completed for event ${eventId}, round ${roundId}`,
        result
      });
    } catch (error) {
      console.error(`Error importing scores:`, error);
      res.status(500).json({ 
        message: `Failed to import scores`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Import tournament results
  app.post('/api/golf-genius/import/results/:eventId/:roundId/:tournamentId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const { eventId, roundId, tournamentId } = req.params;
      const { forceUpdate = false } = req.body;
      const importService = createGolfGeniusImportService(apiKey, storage);
      
      const result = await importService.importTournamentResults(eventId, roundId, tournamentId, req.user.claims.sub, { forceUpdate });
      
      res.json({ 
        message: `Import tournament results completed for tournament ${tournamentId}`,
        result
      });
    } catch (error) {
      console.error(`Error importing tournament results:`, error);
      res.status(500).json({ 
        message: `Failed to import tournament results`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Auto-import event data (comprehensive import for an event)
  app.post('/api/golf-genius/import/auto-import/:eventId', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const { eventId } = req.params;
      const importService = createGolfGeniusImportService(apiKey, storage);
      
      const result = await importService.autoImportEventData(eventId, req.user.claims.sub);
      
      res.json({ 
        message: `Auto-import completed for event ${eventId}`,
        result
      });
    } catch (error) {
      console.error(`Error in auto-import:`, error);
      res.status(500).json({ 
        message: `Failed to auto-import event data`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Run scheduled auto-import manually
  app.post('/api/golf-genius/scheduled-import', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const importService = createGolfGeniusImportService(apiKey, storage);
      await importService.scheduledAutoImport(req.user.claims.sub);
      
      res.json({ 
        message: "Scheduled auto-import completed successfully"
      });
    } catch (error) {
      console.error(`Error in scheduled auto-import:`, error);
      res.status(500).json({ 
        message: `Failed to run scheduled auto-import`,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });
  
  // Get Golf Genius import logs
  app.get('/api/golf-genius/import-logs', isAuthenticated, async (req: any, res) => {
    try {
      const currentUser = await storage.getUser(req.user.claims.sub);
      
      if (currentUser?.role !== 'master_admin') {
        return res.status(403).json({ message: "Master admin access required" });
      }
      
      const apiKey = await storage.getGolfGeniusApiKey();
      if (!apiKey) {
        return res.status(400).json({ message: "Golf Genius API not configured" });
      }
      
      const limit = parseInt(req.query.limit as string) || 50;
      const importService = createGolfGeniusImportService(apiKey, storage);
      
      const logs = await importService.getImportLogs(limit);
      
      res.json({ logs });
    } catch (error) {
      console.error("Error fetching import logs:", error);
      res.status(500).json({ message: "Failed to fetch import logs" });
    }
  });
  
  // Get Golf Genius players
  app.get('/api/golf-genius/players', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const search = req.query.search as string;
      
      let players;
      if (search) {
        players = await storage.searchGolfGeniusPlayers(search);
      } else {
        players = await storage.getGolfGeniusPlayers(limit);
      }
      
      res.json({ players });
    } catch (error) {
      console.error("Error fetching Golf Genius players:", error);
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });
  
  // Get Golf Genius events
  app.get('/api/golf-genius/events', isAuthenticated, async (req: any, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 100;
      const search = req.query.search as string;
      
      let events;
      if (search) {
        events = await storage.searchGolfGeniusEvents(search);
      } else {
        events = await storage.getGolfGeniusEvents(limit);
      }
      
      res.json({ events });
    } catch (error) {
      console.error("Error fetching Golf Genius events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  // Get Golf Genius event rounds
  app.get('/api/golf-genius/events/:eventId/rounds', isAuthenticated, async (req: any, res) => {
    try {
      const { eventId } = req.params;
      const rounds = await storage.getGolfGeniusEventRounds(eventId);
      
      res.json({ rounds });
    } catch (error) {
      console.error("Error fetching event rounds:", error);
      res.status(500).json({ message: "Failed to fetch event rounds" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
