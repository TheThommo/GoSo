# GoSo
helping golf societies with game management and prediction results
Golf Society Prediction Platform
A full-stack web application that lets golf societies run real-world tournaments with a betting-style prediction layer, powered by a fictitious token economy (no real money involved). Members make predictions before play, watch results come in via Golf Genius integration, and earn or lose tokens based on how their picks perform.

Table of Contents
What the Platform Does
Core Concepts
Token Economy
User Roles
Tournaments and Games
Predictions
Leaderboards
Freemium Access Model
Golf Genius Integration
Authentication and Sessions
Data Architecture
Backend API Reference
Frontend Structure
Role-Based Navigation
Development Setup
Going to Production
What the Platform Does
Golf societies organise regular tournaments for their members. This platform sits alongside that activity and adds a prediction game layer:

Admins import real tournament data (players, events, rounds, scores) from Golf Genius, the industry-standard golf management platform.
Members are given a starting token balance and allocate tokens against predictions before each round begins — predicting who will win, finish top three, or hit certain scores.
Once rounds complete and results are imported, tokens are redistributed automatically based on prediction accuracy.
A live leaderboard shows both golf scores and token standings so members can track their performance across the season.
The entire token system uses fictitious, zero-monetary-value game tokens. There is no gambling element and no real money changes hands.

Core Concepts
Token Economy
Every registered user starts with 1,000 tokens (master admins start with 10,000 to enable testing). Tokens are the currency of the prediction game:

Allocation — before predictions lock, members stake tokens on their picks.
Win — if the prediction is correct, the member earns tokens back plus a return based on odds.
Loss — if the prediction is wrong, the staked tokens are forfeited.
Refund — if an event is cancelled or a round is voided, tokens are returned.
Token balances are stored per user in the database and displayed in the wallet panel. The wallet service (client/src/lib/walletService.ts) handles client-side balance management and transaction history.

Tokens have no monetary value, cannot be purchased, transferred, or redeemed for goods or services. This is enforced through the legal disclaimer shown in the platform footer and on the paywall/upgrade screens.

User Roles
The platform has four roles with progressively more access:

Role	What they can do
master_admin	Everything. Configures Golf Genius API, manages all games, promotes other users, accesses platform-wide analytics, manages all user accounts.
game_admin	Manages their own assigned game(s): creates rounds, locks predictions, enters results, views game-level analytics. Cannot access Golf Genius configuration or other admins' games.
player	Browses tournaments, makes predictions, views their token balance and transaction history, sees the leaderboard.
spectator	Can view tournaments and the public leaderboard but cannot make predictions or see token details. Free-tier users are treated as spectators for premium features.
Roles are stored in the users table as a role varchar field. They are assigned at login and preserved across sessions — logging in again never strips a user's existing role.

First-admin bootstrap (development only): The very first user to log in when the server is running in development mode is automatically promoted to master_admin if no master admin yet exists. This makes initial setup frictionless without needing manual database edits.

Tournaments and Games
A tournament maps directly to a Golf Genius event. It has:

A name, course, location, start date, and duration (number of days/rounds).
A player capacity and current registered count.
A lock state — once locked, no new predictions can be submitted.
A registration status (invitation list, open, or closed, reflecting Golf Genius).
Tournaments are imported from Golf Genius and appear on the main tournaments page. Players join a tournament to participate in predictions for that event.

A game is the prediction layer wrapped around a tournament. Each game has its own rules for how tokens are allocated and scored. Game admins create and manage games; the platform links each game to a Golf Genius event for automatic result ingestion.

Predictions
Before a round's predictions lock, eligible players allocate tokens across their picks. The prediction interface (PredictionInterface.tsx) shows:

Each eligible player/golfer in the field, with associated odds.
A token input for each pick.
Running total of tokens allocated vs available balance.
Submission confirmation with legal disclaimer acknowledgement.
Once submitted, predictions are locked per user. When a game admin locks the round, no further submissions are accepted. Results are then imported from Golf Genius, the engine scores each prediction, and token balances are updated.

Leaderboards
Two leaderboard dimensions are tracked:

Golf leaderboard — who is shooting the lowest scores on the course. Pulled from Golf Genius score imports.
Token leaderboard — who has accumulated the most tokens across the season through prediction accuracy.
The leaderboard component highlights the current user's position and shows movement arrows (up/down) compared to the previous round. Token details on the leaderboard are a premium feature — free-tier users see positions but not token amounts.

Freemium Access Model
The platform uses a freemium model. Access tiers are checked by client/src/lib/premiumAccess.ts and enforced on both the frontend (via PremiumFeatureLock and PaywallBanner components) and the backend (via role and subscription checks).

Free tier (available from 1 December 2025 onwards):

View tournaments and public leaderboard.
Basic profile.
Cannot make predictions or see token details.
Premium tier (paid subscription or granted by master_admin):

All prediction features.
Full token wallet with transaction history.
Token amounts on the leaderboard.
Advanced analytics.
CSV exports.
The PaywallBanner component renders a banner at the top of the main content area when a user is on the free tier. The PremiumFeatureLock component wraps individual features and replaces their content with an upgrade prompt.

Golf Genius Integration
Golf Genius is a cloud-based golf event management platform used by thousands of golf societies worldwide. The integration pulls live tournament data into the prediction platform automatically.

What Gets Imported
Data type	Description
Seasons	The current and past playing seasons (e.g., "2024/25 Season").
Categories	Groupings of events (e.g., "Monthly Medals", "Society Days").
Players	The full member roster with name, email, and handicap index.
Events	Individual tournaments with dates, type, and registration status.
Event Rounds	Each round within an event, including status (not started / in progress / completed) and settings like mobile score entry and tee sheet release.
Courses and Tees	Course details including hole data, par, yardage, slope, and rating for each tee set.
Scores	Hole-by-hole scores for each player in each round.
Tournament Results	Final positions, net/gross scores, and points awarded within each tournament format.
How Imports Work
The import service (server/lib/golfGeniusImportService.ts) provides both on-demand and scheduled imports:

On-demand imports are triggered manually from the Golf Genius admin panel by a master admin. Available import types are:

seasons — import/update all seasons.
categories — import/update all categories.
players — import/update the full player roster.
events — import/update events (optionally filtered by season or category).
full — run all of the above in sequence.
event-rounds/:eventId — import rounds and course/tee data for a specific event.
scores/:eventId/:roundId — import scores for a specific round.
results/:eventId/:roundId/:tournamentId — import final tournament results.
auto-import/:eventId — comprehensive import of all data for one event (rounds, courses, scores, results).
Scheduled auto-import runs hourly and automatically imports updated data for all active (in-progress) events. It can also be triggered manually. This keeps scores and results current without needing admin intervention during a tournament day.

Every import is logged to the golf_genius_import_logs table with status, timestamps, record counts (processed / successful / failed), and any error details. The import management tab in the admin UI displays this history.

Admin UI
The Golf Genius admin panel (GolfGeniusAdmin.tsx) has three tabs:

Configuration — enter and test the Golf Genius API key. Shows current connection status.
Import Management — trigger any import type, run the scheduled import manually, and view the import log history.
Data Browser — search and browse the imported players and events. Allows drilling into event rounds.
This entire section of the UI is only visible and accessible to master_admin users.

Authentication and Sessions
Authentication uses Replit's built-in OpenID Connect (OIDC) provider. The flow:

User visits the platform and is shown the landing page (AuthLanding.tsx) with a login button.
Clicking login redirects to GET /api/login, which initiates the OIDC flow with Replit's identity provider.
After successful authentication, Replit calls back to GET /api/callback. The server extracts the user's identity claims (id, email, first name, last name, profile photo).
The upsertUser function creates the user in storage if new, or updates their profile data if returning. Crucially, it preserves the existing role and token balance for returning users — OIDC login never overwrites these.
A server-side session is created and stored in PostgreSQL (sessions table via connect-pg-simple). Sessions last one week.
The session contains an access token and refresh token. On each subsequent request, the isAuthenticated middleware checks token expiry and silently refreshes using the refresh token when needed.
Logout via GET /api/logout destroys the session and redirects to Replit's end-session endpoint to clear the OIDC session too.
The client checks GET /api/auth/user on load. If the response is 401, the landing page is shown. If authenticated, AuthenticatedApp renders with the user's profile and role.

Data Architecture
Storage Layer
The application uses an in-memory storage implementation (MemStorage) during development. This means all data (users, Golf Genius imports, etc.) is reset every time the server restarts.

The IStorage interface (server/storage.ts) defines all data operations. Swapping from MemStorage to a PostgreSQL-backed implementation for production requires implementing this interface against Drizzle ORM — the schema is already fully defined in shared/schema.ts.

Database Schema
The PostgreSQL schema covers:

Core tables (required for Replit Auth):

sessions — session storage for connect-pg-simple.
users — platform members with role, token balance, and profile data.
Golf Genius integration tables:

golf_genius_seasons — playing seasons.
golf_genius_categories — event category groupings.
golf_genius_players — member roster with handicap data.
golf_genius_courses — course definitions with hole labels.
golf_genius_tees — tee sets per course with slope, rating, and per-hole data.
golf_genius_events — tournaments/events with dates and status.
golf_genius_event_rounds — individual rounds within events.
golf_genius_event_roster — which players are registered for which events.
golf_genius_tournaments — tournament formats within rounds.
golf_genius_scores — hole-by-hole player scores.
golf_genius_tournament_results — final positions and points.
golf_genius_import_logs — audit log of all import operations.
All Golf Genius records use a golf_genius_id field (the platform's own ID for the record) plus an internal id (UUID). Upsert operations match on golf_genius_id so re-running imports updates existing records rather than creating duplicates.

Backend API Reference
All routes are prefixed with /api. Protected routes require a valid session (the isAuthenticated middleware).

Auth Routes
Method	Path	Access	Description
GET	/api/login	Public	Initiates OIDC login flow.
GET	/api/callback	Public	OIDC callback handler.
GET	/api/logout	Public	Destroys session, redirects to OIDC end-session.
GET	/api/auth/user	Authenticated	Returns current user profile, role, and token balance.
PUT	/api/user/profile	Authenticated	Updates display name, email, and profile image.
Admin Routes (Development Only)
These endpoints are blocked in production (NODE_ENV === 'production').

Method	Path	Access	Description
GET	/api/admin/self-promote	Authenticated	Promotes the current user to master_admin if no master admin exists yet.
POST	/api/admin/promote-master-admin	master_admin	Promotes another user to master_admin by user ID.
PUT	/api/admin/set-role	Authenticated	Sets the current user's role to any valid role (for testing).
Golf Genius Routes
Method	Path	Access	Description
POST	/api/golf-genius/configure	master_admin	Save and test a Golf Genius API key.
GET	/api/golf-genius/status	master_admin	Check if API is configured and currently reachable.
POST	/api/golf-genius/import/:type	master_admin	Trigger an on-demand import (seasons, categories, players, events, full).
POST	/api/golf-genius/import/event-rounds/:eventId	master_admin	Import rounds and course/tee data for an event.
POST	/api/golf-genius/import/scores/:eventId/:roundId	master_admin	Import scores for a specific round.
POST	/api/golf-genius/import/results/:eventId/:roundId/:tournamentId	master_admin	Import tournament results.
POST	/api/golf-genius/import/auto-import/:eventId	master_admin	Comprehensive auto-import for one event.
POST	/api/golf-genius/scheduled-import	master_admin	Manually trigger the scheduled hourly import.
GET	/api/golf-genius/import-logs	master_admin	Retrieve import log history (default: last 50).
GET	/api/golf-genius/players	Authenticated	List or search imported players.
GET	/api/golf-genius/events	Authenticated	List or search imported events.
GET	/api/golf-genius/events/:eventId/rounds	Authenticated	Get rounds for a specific event.
Frontend Structure
client/src/
  components/
    AuthLanding.tsx         — Login page shown to unauthenticated users
    AuthenticatedApp.tsx    — Root component for logged-in users; manages view state
    Navigation.tsx          — Top navigation bar; adapts menu items to user role
    HeroSection.tsx         — Dashboard home/hero panel
    TournamentCard.tsx      — Individual tournament card with join/manage actions
    PredictionInterface.tsx — Token allocation and prediction submission form
    Leaderboard.tsx         — Golf score and token ranking table
    TokenBalance.tsx        — Wallet panel showing balance and transaction history
    GameManagement.tsx      — Admin tools for managing games and rounds
    ProfileEditor.tsx       — User profile edit form
    AdminAnalytics.tsx      — Analytics dashboard (master_admin and game_admin)
    GolfGeniusAdmin.tsx     — Golf Genius configuration, import, and data browser
    PaywallBanner.tsx       — Upgrade prompt banner and feature lock wrapper
    LegalDisclaimer.tsx     — Token/no-gambling legal notice
    ThemeProvider.tsx       — Dark/light mode context and toggle button
  lib/
    queryClient.ts          — TanStack Query client with default fetch config
    walletService.ts        — Client-side token balance and transaction management
    premiumAccess.ts        — Checks whether a user has premium feature access
  pages/
    not-found.tsx           — 404 page
  App.tsx                   — Route definitions and top-level providers
The app uses a single-page view-switching pattern for the main content area (managed by currentView state in AuthenticatedApp) rather than separate URL routes for most views. The exception is analytics, which navigates to /analytics.

Role-Based Navigation
The navigation bar renders different menu items depending on the user's role:

master_admin:

Tournaments
Leaderboard
Platform Analytics
Golf Genius (integration admin panel)
Platform Admin (game management)
User Management
game_admin:

Tournaments
Leaderboard
Game Analytics
Manage Game
Players
player / spectator:

Tournaments
Leaderboard
Token balance is shown in the nav bar only for users with premium access. The role badge is always shown.

Development Setup
The application starts with a single command via the configured workflow:

npm run dev
This starts the Express backend and Vite dev server together on the same port, with hot module replacement for the frontend.

Environment variables required:

Variable	Purpose
DATABASE_URL	PostgreSQL connection string (Neon serverless).
PGDATABASE, PGHOST, PGPASSWORD, PGPORT, PGUSER	Individual PostgreSQL connection parameters.
SESSION_SECRET	Secret key for signing session cookies.
REPLIT_DOMAINS	Comma-separated list of domains for OIDC callback URLs (set automatically by Replit).
REPL_ID	The Replit application ID used as the OIDC client ID (set automatically by Replit).
All secrets are managed through Replit's environment secrets system and are never committed to the codebase.

First-time login (development):

Start the server and open the app in the browser.
Click "Sign in with Replit".
Complete the Replit OIDC flow.
The first user to log in is automatically given the master_admin role.
From there, use the Golf Genius admin panel to configure the API key and import data.
Changing roles for testing:

In development only, any authenticated user can call PUT /api/admin/set-role with a role body to switch their own role. This makes testing different permission levels fast without needing multiple accounts.

Going to Production
Before deploying to production the following items need to be addressed:

Migrate from MemStorage to PostgreSQL — implement the IStorage interface using Drizzle ORM against the Neon database. Run npm run db:push to apply the schema.
Tournament and prediction persistence — the tournament, prediction, and token transaction tables need to be added to the schema and implemented in storage.
Remove development-only admin endpoints — the self-promote and set-role endpoints are already blocked in production but should be reviewed before launch.
Golf Genius API key — store the API key in an environment secret (not in the in-memory store) so it persists across restarts.
Scheduled import reliability — move the hourly auto-import from an in-process setInterval to a proper job queue or cron service so it survives server restarts.
Premium subscription enforcement — wire up the premiumAccess checks to a real subscription record in the database.
To publish the application click the Deploy button in Replit, which will build and host the app on a .replit.app domain with TLS handled automatically.
