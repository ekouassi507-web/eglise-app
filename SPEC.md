# SPEC.md - Gestion Église

## 1. Project Overview

**Project Name:** Eglise Management System  
**Type:** SaaS Web Application  
**Core Functionality:** Système de gestion des activités hebdomadaires d'une église, suivi de présence par groupe (BG), rapports automatisés pour le Pasteur et responsables.  
**Target Users:** Pasteur, Responsables de groupe (Puissance, Sagesse, Gloire), Leaders BG

---

## 2. Structure Organisation

```
Pasteur (Admin Total)
    │
    ├── Responsable Puissance
    │       ├── BG Puissance 1
    │       ├── BG Puissance 2
    │       ├── BG Puissance 3
    │       └── BG Puissance 4
    │
    ├── Responsable Sagesse
    │       ├── BG Sagesse 1
    │       ├── BG Sagesse 2
    │       ├── BG Sagesse 3
    │       └── BG Sagesse 4
    │
    └── Responsable Gloire
            ├── BG Gloire 1
            ├── BG Gloire 2
            ├── BG Gloire 3
            └── BG Gloire 4
```

---

## 3. Fonctionnalités

### 3.1 Authentication & Authorization
- Login par rôle (Pasteur, Responsable, BG Leader)
- Permissions hiérarchiques :
  - **Pasteur** : Accès total (tous groupes, tous stats)
  - **Responsable** : Voit uniquement son groupe
  - **BG Leader** : Voit uniquement son BG

### 3.2 Gestion des Membres et Sous-groupes
- Ajouter/modifier/supprimer des membres
- Attribution à un BG
- Sous-groupes optionnels par BG :
  - Louange
  - [Autre] (à définir)
- Informations : Nom, téléphone,date de rejointte

### 3.3 Suivi des Activités Hebdomadaires

| Jour | Activité | Type de suivi |
|------|----------|---------------|
| Lundi | Mobilisation message dimanche | Nombre mobilisés |
| Mardi | Enseignement (19h-20h30) | Liste présence (certains BG) |
| Mercredi | Enseignement (19h-20h30) | Liste présence (autres BG) |
|Jeudi | Prière en ligne (21h-1h30) | Liste présence |
| Vendredi | Prière (19h-20h30) | Liste présence |
| Samedi | Programmes divers | Notes libres |
| Dimanche | Culte | Liste présence + absent + écoute message |

### 3.4 Rapports
- Génération automatique rapport PDF hebdomadaire
- Envoyé au Pasteur chaque dimanche
- Contenu :
  - Résumé présence par groupe
  - Taux de participation
  - Évolution vs semaine précédente
  - Liste des absents

### 3.5 Dashboard & Statistiques
- Taux de présence global
- Comparaison par groupe
- Graphiques évolution
- Classement des BG les plus actifs

---

## 4. Modèles de Données

### User
```json
{
  "id": "uuid",
  "name": "string",
  "phone": "string",
  "role": "PASTEUR | RESPONSABLE | BG_LEADER",
  "group": "PUISSANCE | SAGESSE | GLOIRE | null",
  "bg": "1-4 | null",
  "subgroup": "LOUANGE | AUTRE | null",  // Optionnel par BG
  "createdAt": "date"
}
```

### Activity
```json
{
  "id": "uuid",
  "weekStart": "date (lundi)",
  "day": "MONDAY | TUESDAY | WEDNESDAY | THURSDAY | FRIDAY | SATURDAY | SUNDAY",
  "type": "MOBILISATION | TEACHING | PRAYER | SERVICE",
  "attendees": ["userId"],
  "absentees": ["userId"],
  "listened": ["userId"],
  "notes": "string",
  "createdBy": "userId"
}
```

### WeeklyReport
```json
{
  "id": "uuid",
  "weekStart": "date",
  "generatedAt": "date",
  "data": {
    "totalMembers": "number",
    "attendance": {},
    "absentees": [],
    "evolution": {},
    "groupStats": {}
  },
  "pdfUrl": "string"
}
```

---

## 5. Contraintes Techniques

- **Frontend:** React + Tailwind
- **Backend:** Node.js + PostgreSQL (ou SQLite pour commencer)
- **Auth:** JWT
- **PDF:** jsPDF ou pdfkit
- **Deployment:** Docker

---

## 6. User Flows

### Flow BG Leader
1. Login → Dashboard BG
2. Voir liste membres
3. Après chaque activité → Remplir présence
4. Voir stats de son BG

### Flow Responsable
1. Login → Dashboard Groupe
2. Voir stats de son groupe uniquement
3. Voir rapport hebdomadaire de son groupe
4. Comparer les BG de son groupe

### Flow Pasteur
1. Login → Dashboard Admin
2. Voir toutes les stats
3. Générer rapport PDF global
4. Voir évolution de tous les groupes
5. Gérer utilisateurs et rôles

---

## 7. Écrans

1. **Login** - Authentification
2. **Dashboard** - Différent selon rôle
3. **Membres** - Liste + gestion membres
4. **Activités** - Formulaire de saisie présence
5. **Rapports** - Visualisation + export PDF
6. **Paramètres** - Profil + configuration
