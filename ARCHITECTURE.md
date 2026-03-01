# Architecture Technique - Eglise App

## Vue d'Ensemble

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                              │
│  React 18 + TypeScript + Tailwind + Framer Motion          │
│  Zustand (State) | React Hook Form | Recharts              │
└────────────────────────┬────────────────────────────────────┘
                         │ REST API + JWT
┌────────────────────────▼────────────────────────────────────┐
│                        BACKEND                              │
│  Node.js + Express + TypeScript                            │
│  JWT Auth | Validation (Zod) | PDF Generation              │
└────────────────────────┬────────────────────────────────────┘
                         │
┌────────────────────────▼────────────────────────────────────┐
│                     DATABASE                                │
│  PostgreSQL (Production) | SQLite (Dev)                    │
│  Prisma ORM                                               │
└────────────────────────────────────────────────────────────┘
```

## Structure du Backend

```
src/
├── config/           # Configuration (env, database)
├── modules/
│   ├── auth/        # Authentication & Authorization
│   ├── users/       # Gestion utilisateurs (Pasteur, Resp, BG)
│   ├── groups/      # Groupes (Puissance, Sagesse, Gloire)
│   ├── activities/  # Activitéshebdomadaires
│   ├── reports/     # Rapports hebdomadaires
│   └── analytics/   # Statistiques & Dashboard
├── middleware/       # JWT, Roles, Error handling
├── utils/           # Helpers (PDF, dates, etc.)
└── index.ts         # Entry point
```

## Structure du Frontend

```
src/
├── components/
│   ├── ui/          # Composants UI (Button, Input, Card...)
│   ├── layout/      # Layout (Sidebar, Header, AuthLayout)
│   └── features/    # Composants métier
├── pages/
│   ├── auth/        # Login, Register
│   ├── dashboard/   # Dashboard (selon rôle)
│   ├── members/     # Gestion membres
│   ├── activities/  # Saisie présence
│   └── reports/     # Rapports & PDFs
├── hooks/           # Custom hooks
├── stores/          # Zustand stores
├── lib/             # Utils (API client, helpers)
└── types/           # TypeScript types
```

## Modèles de Base de Données

### User
- id, name, phone, email, password
- role: PASTEUR | RESPONSABLE | BG_LEADER
- group: PUISSANCE | SAGESSE | GLOIRE | null
- bg: 1-4 | null
- subgroup: LOUANGE | FORCE | FAUSSES | RICHESSES | null

### Member
- id, name, phone, group, bg, subgroup
- isActive, joinedAt

### Activity
- id, weekStart, day, type
- attendees[], absentees[], absenteeReasons{}
- createdBy (userId)

### WeeklyReport
- id, bergerId, weekStart, weekEnd
- personalLife, bergerWork{}, churchProgram{}
- absences[], visits[], supervision{}
- signature, signedAt, status

## API Endpoints

### Auth
- POST /api/auth/login
- POST /api/auth/register (Pasteur only)
- GET /api/auth/me

### Users
- GET /api/users (selon rôle)
- POST /api/users
- PUT /api/users/:id
- DELETE /api/users/:id

### Groups
- GET /api/groups/:groupId/stats
- GET /api/groups/:groupId/members

### Activities
- GET /api/activities?week=...
- POST /api/activities
- PUT /api/activities/:id

### Reports
- GET /api/reports?bergerId=...&week=...
- POST /api/reports
- GET /api/reports/:id/pdf

### Analytics
- GET /api/analytics/overview
- GET /api/analytics/group/:groupId
- GET /api/analytics/evolution

## Sécurité

- JWT avec expiration
- Hachage bcrypt pour mots de passe
- Middleware de vérification de rôle
- Validation Zod sur toutes les entrées
- CORS configuré
- Rate limiting

## Déploiement

- Docker pour production
- Nginx comme reverse proxy
- SSL Let's Encrypt
