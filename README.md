# Soccer Team Management REST API

This project is an MVP REST API for managing soccer teams, users, matches, and player statistics with authentication and role-based access control.

## Setup Instructions

1. Install dependencies with `npm install`.
2. Create a `.env` file and set `JWT_SECRET`. You can optionally set `DB_STORAGE`.
3. Start the server with `npm start`.

## Deploying to Render

1. Push this repo to GitHub.
2. In Render, create a new `Web Service` from the GitHub repo.
3. Use these settings:
   - Build Command: `npm install`
   - Start Command: `npm start`
   - Health Check Path: `/health`
4. Add environment variables:
   - `JWT_SECRET` = your production JWT secret
   - `DB_STORAGE` = `/opt/render/project/src/data/soccer.sqlite`
5. Add a persistent disk in Render and mount it at:
   - `/opt/render/project/src/data`
6. After the first deploy, open the Render Shell and run:
   - `npm run db:seed`

Included in this repo:
- `render.yaml` for Render Blueprint setup

Important:
- This project uses SQLite, so persistent storage matters.
- Render persistent disks require a paid web service plan. The included `render.yaml` uses `starter` for that reason.
- The app now uses `process.env.PORT` automatically, which is required for Render web services.

## Seed Instructions

Run `npm run db:seed` to recreate and seed the SQLite database with:
- 1 coach
- 1 manager
- 2 players
- 1 team
- 2 matches
- multiple player statistics

All seeded users use the password `password123`.

Seeded demo accounts:
- `coach@soccerapi.com`
- `manager@soccerapi.com`
- `player1@soccerapi.com`
- `player2@soccerapi.com`

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /users`
- `PUT /users/:id/role`
- `PATCH /users/:id/role`
- `GET /teams`
- `GET /teams/:id`
- `POST /teams`
- `PUT /teams/:id`
- `DELETE /teams/:id`
- `GET /matches`
- `GET /matches/:id`
- `POST /matches`
- `PUT /matches/:id`
- `DELETE /matches/:id`
- `GET /statistics`
- `GET /statistics/:id`
- `POST /statistics`
- `PUT /statistics/:id`
- `DELETE /statistics/:id`

## Authentication Explanation

Authentication uses JWT tokens. Log in through `POST /auth/login` and send the token in the `Authorization` header as `Bearer <token>`.

## Role-Based Access Explanation

- `coach`: can manage teams, matches, player statistics, and view users
- `manager`: full admin access, including user role assignment
- `player`: read-only access and can only view their own statistics
