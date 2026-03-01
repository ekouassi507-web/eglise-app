# Eglise App 🏛️

Système de gestion des activités hebdomadaires d'une église avec suivi de présence, rapports PDF et permissions hiérarchiques.

## Fonctionnalités

- **Gestion des membres** par groupe (Puissance, Sagesse, Gloire) et sous-groupes
- **Suivi des activités** Mardi, Mercredi, Vendredi, Dimanche
- **Rapports hebdomadaires** des bergers avec génération PDF automatique
- **Dashboard analytique** avec statistiques et évolution
- **Permissions hiérarchiques** : Pasteur > Responsable > BG Leader

## Stack Technique

### Backend
- Node.js + Express + TypeScript
- Prisma ORM (SQLite/PostgreSQL)
- JWT Authentication
- jsPDF pour génération rapports

### Frontend
- React 18 + TypeScript
- Tailwind CSS + Framer Motion
- Zustand (State Management)
- React Router v6

## Installation

```bash
# Backend
cd backend
npm install
npx prisma generate
npx prisma db push
npm run dev

# Frontend
cd frontend
npm install
npm run dev
```

## Docker

```bash
docker-compose up -d
```

## Structure

```
eglise-app/
├── backend/          # API Node.js
├── frontend/        # Application React
├── docs/           # Documentation
└── SPEC.md         # Spécifications
```

## License

MIT
