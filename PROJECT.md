# EGISE APP - Gestion des Activités de l'Eglise

## Contexte du Projet

Système de gestion des activités hebdomadaires d'une église avec :
- Structure : Pasteur > Responsables (Puissance/Sagesse/Gloire) > BG (12) > Sous-groupes (optionnels)
- 12 BG maximum, 2 sous-groupes par BG (Louange, Force, Fausses, Richesses)
- Suivi de présence aux activités (Mardi, Mercredi, Vendredi, Dimanche)
- Rapports hebdomadaires PDF pour chaque berger
- Permissions hiérarchiques (Pastor voit tout, Responsable voit son groupe)

## Spécifications

Voir fichier SPEC.md pour les détails complets.

## Stack Technique Proposée

- **Frontend**: React 18 + TypeScript + Tailwind CSS + Framer Motion
- **Backend**: Node.js + Express + TypeScript
- **Base de données**: PostgreSQL (ou SQLite pour dev)
- **Auth**: JWT avec rôles hiérarchiques
- **PDF**: jsPDF + jspdf-autotable
- **Charts**: Recharts pour les statistiques
- **State**: Zustand
- **Forms**: React Hook Form + Zod

## Structure des Rôles

| Rôle | Accès |
|------|-------|
| PASTEUR | Tout voir (tous groupes, tous BG) |
| RESPONSABLE | Son groupe uniquement |
| BG_LEADER | Son BG uniquement |

## Données à Collecter

### Activités par Jour
- Mardi: Enseignement (19h-20h30) - certains BG
- Mercredi: Enseignement (19h-20h30) - autres BG  
- Vendredi: Prière (19h-20h30) - tous
- Dimanche: Culte - tous + présence + écoute message

### Rapport Hebdomadaire du Berger
- Vie personnelle
- Travail du berger (mobilisation par jour)
- Programme église (QI: Quotidien/Intermittent)
- Absences + raisons
- Visites pastorales
- Signature

## Contraintes

- Application web responsive (mobile-first pour les bergers sur le terrain)
- Mode hors-ligne partiel pour la saisie
- Génération PDF automatique
- Tableau de bord analytique
