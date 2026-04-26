# Soccer Team Management REST API

This project is an MVP REST API for managing soccer teams, users, matches, and player statistics with authentication and role-based access control.

## Setup Instructions

1. Install dependencies with `npm install`.
2. Create a `.env` file and set `JWT_SECRET`. You can optionally set `DB_STORAGE`.
3. Start the server with `npm start`.

## Seed Instructions

Run `npm run db:seed` to recreate and seed the SQLite database with:
- 1 coach
- 1 manager
- 2 players
- 1 team
- 2 matches
- multiple player statistics

All seeded users use the password `password123`.

## API Endpoints

- `POST /auth/register`
- `POST /auth/login`
- `GET /users`
- `PATCH /users/:id/role`
- `GET /teams`
- `POST /teams`
- `PUT /teams/:id`
- `DELETE /teams/:id`
- `GET /matches`
- `POST /matches`
- `PUT /matches/:id`
- `DELETE /matches/:id`
- `GET /statistics`
- `POST /statistics`

## Authentication Explanation

Authentication uses JWT tokens. Log in through `POST /auth/login` and send the token in the `Authorization` header as `Bearer <token>`.

## Role-Based Access Explanation

- `coach`: can manage teams, matches, player statistics, and view users
- `manager`: full admin access, including user role assignment
- `player`: read-only access and can only view their own statistics
