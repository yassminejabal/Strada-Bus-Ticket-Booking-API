# 🚌 Strada — Bus Ticket Booking API

**API REST de réservation de billets d’autocar**, développée avec Node.js, Express.js et MongoDB. Strada permet de gérer les lignes, les autocars, les départs, les réservations de sièges et le contrôle sécurisé des billets à l’embarquement.

---

## 📌 Présentation du projet

Strada est un projet backend collectif visant à concevoir une API REST fiable et sécurisée pour une plateforme de réservation de billets d’autocar.

L’application permet aux voyageurs de consulter les départs disponibles, de réserver un siège, de consulter leurs billets et d’annuler leurs réservations selon les règles métier. Les agents peuvent contrôler les billets à l’embarquement afin d’empêcher toute utilisation multiple d’un même billet.

Le projet met en pratique une **architecture monolithique modulaire**, l’**injection de dépendances** et la gestion des opérations concurrentes avec MongoDB.

## 🎯 Objectifs

- Gérer les lignes, les autocars et les départs.
- Réserver et annuler des billets.
- Garantir l’unicité des réservations de sièges.
- Empêcher le double embarquement d’un même billet.
- Sécuriser les routes avec JWT et des rôles.
- Assurer la cohérence des données grâce aux transactions MongoDB.
- Tester les services indépendamment de la base de données.
- Documenter et déployer l’API avec Docker Compose.

## 🛠️ Technologies utilisées

| Technologie | Utilisation |
|---|---|
| Node.js | Environnement d’exécution JavaScript |
| Express.js | Création de l’API REST |
| MongoDB | Base de données NoSQL |
| Mongoose | Modèles et accès aux données |
| Awilix | Injection de dépendances |
| JWT | Authentification |
| bcryptjs | Hachage des mots de passe |
| Joi | Validation des entrées |
| Jest | Tests unitaires |
| Supertest | Tests HTTP |
| Docker Compose | Environnement de développement |
| OpenAPI | Documentation de l’API |

## 🏗️ Architecture

Strada adopte une architecture monolithique modulaire organisée autour de quatre modules métier :

### 1. Identity
- Authentification avec JWT.
- Consultation du compte connecté.
- Gestion des rôles : `admin`, `passenger` et `agent`.

### 2. Catalogue
- Gestion des lignes et des autocars.
- Consultation des villes et des arrêts.
- Création et consultation des départs.
- Gestion des états et du plan de sièges figé de chaque départ.

### 3. Reservations
- Réservation individuelle d’un siège.
- Génération d’un code de billet unique.
- Consultation des réservations personnelles.
- Annulation des réservations autorisées.

### 4. Boarding
- Ouverture de l’embarquement.
- Vérification et validation des billets.
- Enregistrement des embarquements réussis.
- Prévention du double contrôle d’un billet.

## 📁 Structure du projet

```text
src/
├── app.js
├── server.js
├── bootstrap/
│   ├── container.js
│   └── register-modules.js
├── shared/
│   ├── database.js
│   ├── transaction.js
│   ├── errors.js
│   └── error-handler.js
├── application/
│   └── cancel-departure.js
└── modules/
    ├── identity/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   └── models/
    ├── catalogue/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   └── models/
    ├── reservations/
    │   ├── routes/
    │   ├── controllers/
    │   ├── services/
    │   ├── repositories/
    │   └── models/
    └── boarding/
        ├── routes/
        ├── controllers/
        ├── services/
        ├── repositories/
        └── models/

tests/
├── unit/
└── integration/

docs/
```

## 🔐 Rôles et permissions

| Rôle | Permissions principales |
|---|---|
| `admin` | Gestion du catalogue, création et annulation des départs |
| `passenger` | Consultation de l’offre, réservation et annulation de ses propres billets |
| `agent` | Ouverture de l’embarquement, contrôle des billets et déclaration du départ effectué |

L’API applique des contrôles d’authentification, de rôle et de propriété afin de protéger les données des voyageurs.

## 🔄 Règles métier principales

- Un siège ne peut pas être attribué à deux réservations actives pour le même départ.
- Un passager ne peut posséder qu’une réservation non annulée par départ.
- Une réservation annulée conserve son historique et son ancien code devient inutilisable.
- Un billet ne peut être contrôlé qu’une seule fois.
- Les opérations critiques utilisent des transactions MongoDB pour éviter les états incohérents.
- Les informations essentielles du départ sont figées au moment de sa création.
- Les départs suivent les transitions autorisées : `OPEN`, `BOARDING`, `DEPARTED` et `CANCELLED`.

## ⚙️ Installation

### Prérequis

- Node.js et npm
- Docker et Docker Compose
- Git

### 1. Cloner le repository

```bash
git clone https://github.com/yassminejabal/team-api.git
cd team-api
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d’environnement

Créer un fichier `.env` à partir du fichier d’exemple :

```bash
cp .env.example .env
```

Sous Windows PowerShell, utiliser :

```powershell
Copy-Item .env.example .env
```

Configurer les variables nécessaires, notamment la connexion MongoDB et le secret JWT, selon les instructions du fichier `.env.example`.

### 4. Démarrer les services

Lorsque la configuration Docker Compose et MongoDB Replica Set est prête :

```bash
docker compose up --build
```

L’application nécessite un MongoDB Replica Set pour les transactions. Vérifier que son initialisation est prévue dans la configuration Docker avant d’exécuter les opérations critiques.

### 5. Lancer l’API en développement

Après avoir configuré MongoDB et les variables d’environnement :

```bash
npm run dev
```

Les commandes exactes de démarrage dépendent de la configuration effective du projet.

## 🧪 Tests

Exécuter les tests avec :

```bash
npm test
```

Les tests prévus couvrent notamment :

- Les permissions et la propriété des réservations.
- Les réservations concurrentes d’un même siège.
- L’annulation d’une réservation et d’un départ.
- Le contrôle concurrent d’un même billet.
- Le rollback en cas d’échec d’une transaction.
- Les réponses HTTP et la validation des entrées.

## 📚 Documentation API

La documentation OpenAPI sera accessible à l’adresse suivante lorsque la route sera implémentée :

```text
http://localhost:3000/api-docs
```

Le port et l’URL définitifs dépendront de la configuration du serveur.

## 🌐 Principales routes API

Toutes les routes métier utilisent le préfixe `/api/v1`.

| Méthode | Route | Description |
|---|---|---|
| `POST` | `/auth/login` | Connexion |
| `GET` | `/auth/me` | Compte connecté |
| `GET` | `/cities` | Liste des villes |
| `GET` | `/stops` | Liste des arrêts |
| `GET` | `/lines` | Consultation des lignes |
| `POST` | `/lines` | Création d’une ligne |
| `POST` | `/coaches` | Création d’un autocar |
| `POST` | `/departures` | Création d’un départ |
| `GET` | `/departures` | Consultation des départs |
| `GET` | `/departures/:id/seats` | Disponibilité des sièges |
| `POST` | `/departures/:id/bookings` | Réservation d’un siège |
| `GET` | `/bookings` | Consultation des réservations |
| `POST` | `/bookings/:id/cancel` | Annulation d’une réservation |
| `POST` | `/departures/:id/start-boarding` | Ouverture de l’embarquement |
| `POST` | `/departures/:id/boarding-records` | Contrôle d’un billet |
| `POST` | `/departures/:id/depart` | Déclaration du départ effectué |

Les routes protégées nécessitent un token JWT valide et le rôle approprié.

## 👥 Organisation de l’équipe

Projet collectif réalisé par une squad de 4 à 5 personnes sur une durée de cinq jours ouvrés.

La collaboration repose sur Git et GitHub, avec une branche `develop`, des branches individuelles et des Pull Requests pour intégrer les changements.

## 📦 Livrables

- API REST fonctionnelle.
- Architecture monolithique modulaire.
- Injection de dépendances avec Awilix.
- Tests unitaires et d’intégration ciblés.
- Documentation OpenAPI.
- Collection Postman ou fichier HTTP de démonstration.
- Dockerfile et Docker Compose avec MongoDB Replica Set.
- Documentation d’installation et de lancement.

## 📄 Périmètre

Le projet couvre la gestion des départs, les réservations et le contrôle d’embarquement. Le paiement en ligne, le frontend, la génération d’images QR et la gestion avancée de flotte ne font pas partie du périmètre obligatoire.

---

**Strada — Reliable reservations, secure boarding.**
