# ⚽ Soccer Team Management REST API — Blueprint

## 📌 Project Overview
This project is a REST API built with Node.js, Express, and Sequelize that manages soccer teams, users, matches, and player statistics. It includes authentication, role-based authorization, and full CRUD functionality for all core resources.

The system is designed for coaches, managers, and players to organize teams, schedule matches, and track performance data.

---

## 🧱 Tech Stack
- Node.js
- Express.js
- Sequelize ORM
- SQLite
- JWT (jsonwebtoken)
- bcrypt
- Jest + Supertest

---

## 📁 Project Structure

soccer-api/
├── server.js
├── .env
├── package.json
│
├── database/
│   ├── index.js
│   ├── setup.js
│   └── seed.js
│
├── models/
│   ├── index.js
│   ├── User.js
│   ├── Team.js
│   ├── Match.js
│   └── PlayerStat.js
│
├── routes/
│   ├── auth.js
│   ├── users.js
│   ├── teams.js
│   ├── matches.js
│   └── statistics.js
│
├── middleware/
│   ├── auth.js
│   ├── role.js
│   ├── logger.js
│   └── errorHandler.js
│
├── tests/
│   ├── auth.test.js
│   ├── teams.test.js
│   └── matches.test.js
│
└── auth/
    └── jwt.js

---

## 🗄️ Database Schema

### 👤 Users
- id
- name (string, required)
- email (string, unique, required)
- password (string, hashed)
- role (player | coach | manager)
- TeamId (foreign key)

---

### ⚽ Teams
- id
- team_name (required)
- league_name
- coach_id (optional logical reference)

Relationships:
- Team has many Users
- Team has many Matches

---

### 🏟 Matches
- id
- opponent_name
- match_date
- location
- final_score
- TeamId (foreign key)

Relationships:
- Match belongs to Team
- Match has many PlayerStats

---

### 📊 PlayerStats
- id
- goals (default 0)
- assists (default 0)
- minutes_played
- yellow_cards
- red_cards
- UserId (foreign key)
- MatchId (foreign key)

Relationships:
- belongs to User
- belongs to Match

---

## 🔗 Model Relationships

- Team hasMany Users
- User belongsTo Team

- Team hasMany Matches
- Match belongsTo Team

- User hasMany PlayerStats
- Match hasMany PlayerStats
- PlayerStat belongsTo User
- PlayerStat belongsTo Match

---

## 🔐 Authentication System

### Method:
- JWT (JSON Web Tokens)
- bcrypt password hashing

### Flow:

#### Register
POST /auth/register
- Hash password
- Save user
- Return user

#### Login
POST /auth/login
- Validate credentials
- Return JWT token

### JWT Payload:
{
  "id": "userId",
  "role": "player | coach | manager"
}

---

## 🛡️ Middleware

### auth middleware
- Validates JWT token
- Attaches user to request
- Returns 401 if invalid

---

### role middleware
- Checks user role
- Restricts access based on permissions
- Returns 403 if unauthorized

Example:
role(["coach"])

---

### logger middleware
- Logs every request method and URL

---

### errorHandler middleware
- Returns standardized error response:
{
  "error": "message"
}

---

## 🔄 API Endpoints

### Auth
- POST /auth/register
- POST /auth/login

---

### Users
- GET /users

---

### Teams
- GET /teams
- POST /teams (coach only)
- PUT /teams/:id (coach only)
- DELETE /teams/:id (coach only)

---

### Matches
- GET /matches
- POST /matches (coach or manager)
- PUT /matches/:id (coach or manager)
- DELETE /matches/:id (coach only)

---

### Player Statistics
- GET /statistics
- POST /statistics (coach only)

Role rules:
- Player → sees own stats only
- Coach → sees all stats
- Manager → limited access (matches + scheduling)

---

## 🌱 Seed Data Requirements

Seed script must create:

- 1 coach
- 1 manager
- 2 players
- 1 team
- 2 matches
- multiple player stats entries

All passwords:
password123 (hashed with bcrypt)

---

## ⚙️ Server Setup Requirements

server.js must:
- Initialize Express app
- Use express.json()
- Use logger middleware
- Register all routes:
  - /auth
  - /teams
  - /matches
  - /statistics
- Use errorHandler last
- Run on port 3000

---

## 🧪 Testing Requirements

Use Jest + Supertest

Must test:
- Auth login success
- Team creation (coach only)
- GET /teams
- Unauthorized access (401)

---

## ❌ Error Handling Rules

Standard response format:
{
  "error": "message"
}

Status codes:
- 400 → Bad request
- 401 → Unauthorized
- 403 → Forbidden
- 404 → Not found
- 500 → Server error

---

## 📄 README Requirements

Must include:
- Project overview
- Setup instructions
- Seed instructions
- API endpoint list
- Authentication explanation
- Role-based access explanation

---

## 🚀 Goal of MVP

This MVP demonstrates:
- REST API design
- Database relationships
- Authentication (JWT)
- Authorization (roles)
- CRUD operations
- Middleware usage
- Testing fundamentals