
# Strada — Bus Ticket Booking API

REST API pour la réservation de billets d'autocar.

## Technologies

- Node.js
- Express.js
- MongoDB
- Mongoose
- Awilix (Dependency Injection)
- JWT (Authentication)
- Docker & Docker Compose
- Jest & Supertest (Tests)

## Architecture

Le projet utilise une architecture modulaire :

- `identity` : authentification et gestion des utilisateurs
- `catalogue` : lignes, arrêts, autocars et départs
- `reservations` : réservation et annulation des billets
- `boarding` : contrôle des billets à l'embarquement
- `shared` : ressources communes
- `bootstrap` : configuration et injection des dépendances

## Prérequis

- Node.js
- npm
- Docker Desktop

## Installation locale

1. Cloner le dépôt :

   ```bash
   git clone https://github.com/yassminejabal/Strada-Bus-Ticket-Booking-API.git
   cd Strada-Bus-Ticket-Booking-API
   ```

2. Installer les dépendances :

   ```bash
   npm ci
   ```

3. Créer le fichier d'environnement :

   ```bash
   Copy-Item .env.example .env
   ```

4. Configurer les variables du fichier `.env`.

## Lancement avec Docker

Démarrer les services :

```bash
docker compose up --build
```

Arrêter les services :

```bash
docker compose down
```

## Tests

```bash
npm test
```

## Variables d'environnement

- `PORT` : port de l'API
- `NODE_ENV` : environnement d'exécution
- `MONGODB_URI` : URI de connexion MongoDB
- `JWT_SECRET` : clé secrète JWT
- `JWT_EXPIRES_IN` : durée de validité du token

## État du projet

Structure initiale et configuration de l'environnement en cours de préparation.
Les fonctionnalités métier et les tests doivent être implémentés et validés par l'équipe.
'@ | Set-Content -Encoding utf8 README.md

Get-Content README.md
