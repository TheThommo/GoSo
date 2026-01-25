import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { storage } from "./storage";
import { createGolfGeniusImportService } from "./lib/golfGeniusImportService";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

(async () => {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // ALWAYS serve the app on the port specified in the environment variable PORT
  // Other ports are firewalled. Default to 5000 if not specified.
  // this serves both the API and the client.
  // It is the only port that is not firewalled.
  const port = parseInt(process.env.PORT || '5000', 10);
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
    
    // Start auto-import scheduler for Golf Genius data
    startGolfGeniusAutoImport();
  });

  // Auto-import scheduler for Golf Genius
  function startGolfGeniusAutoImport() {
    const IMPORT_INTERVAL = 60 * 60 * 1000; // 1 hour in milliseconds
    
    log('Starting Golf Genius auto-import scheduler...');
    
    // Run auto-import every hour
    setInterval(async () => {
      try {
        const apiKey = await storage.getGolfGeniusApiKey();
        if (!apiKey) {
          // No API key configured, skip auto-import
          return;
        }
        
        log('Running scheduled Golf Genius auto-import...');
        const importService = createGolfGeniusImportService(apiKey, storage);
        
        // Import recent events and scores from last 7 days
        const result = await importService.importRecentEventsWithScores(7, true);
        
        log(`Auto-import completed: ${result.successful} successful, ${result.failed} failed`);
        
        if (result.errors.length > 0) {
          log(`Auto-import errors: ${result.errors.slice(0, 3).join(', ')}`);
        }
      } catch (error) {
        log(`Golf Genius auto-import failed: ${error}`);
      }
    }, IMPORT_INTERVAL);
    
    // Optional: Run initial import on startup (after a short delay)
    setTimeout(async () => {
      try {
        const apiKey = await storage.getGolfGeniusApiKey();
        if (apiKey) {
          log('Running initial Golf Genius auto-import...');
          const importService = createGolfGeniusImportService(apiKey, storage);
          await importService.importRecentEventsWithScores(7, true);
          log('Initial auto-import completed');
        }
      } catch (error) {
        log(`Initial Golf Genius auto-import failed: ${error}`);
      }
    }, 30000); // 30 seconds after startup
  }
})();
