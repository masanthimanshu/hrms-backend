# HRMS Backend

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.2.1-blue.svg)](https://expressjs.com/)
[![MongoDB Mongoose](https://img.shields.io/badge/mongoose-v9.11.1-green.svg)](https://mongoosejs.com/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A modular, production-ready Node.js REST API backend for a **Human Resource Management System (HRMS)**. Engineered with Express 5, MongoDB (Mongoose), and modern ES Modules, this service powers workforce operations including employee onboarding, multi-branch store cataloging, geo-tagged attendance tracking, and dual-layer security verification.

---

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Why It Is Useful](#why-it-is-useful)
- [Tech Stack](#tech-stack)
- [Architecture & Data Model](#architecture--data-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [Usage Examples](#usage-examples)
  - [1. Health Check](#1-health-check)
  - [2. User Registration & Login](#2-user-registration--login)
  - [3. Token Refresh Flow](#3-token-refresh-flow)
  - [4. Store Management](#4-store-management)
- [Support & Help](#support--help)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

---

## What the Project Does

**HRMS Backend** serves as the central API service for enterprise workforce and facility management:

- **Store & Branch Cataloging**: Register and query physical store locations with geocoded coordinates (latitude & longitude) and physical addresses.
- **Employee Onboarding**: Register organizational users linked to designated store locations with salted, hashed passwords (`bcrypt` 15 rounds).
- **Secure Access Control**: Protect organizational resources using account-level header validation (`account`) alongside JSON Web Tokens (JWT).
- **Dual-Token Session Lifecycle**: Distribute short-lived access tokens (2 days) and long-lived refresh tokens (10 days) with dedicated token rotation routes.
- **Geo-Verified Attendance Modeling**: Database schema ready for recording field employee attendance with geolocation coordinates, proof photo URLs, and timestamps.

---

## Why It Is Useful

- **Dual-Layer Middleware Security**: Guards all sensitive `/account/*` routes with account validation and protects protected endpoints with signature-verified JWT checking.
- **Fail-Safe Request Validation**: Integrates [Zod](https://zod.dev/) runtime schema validation to reject malformed payloads before hitting controllers.
- **Modern ES Module Architecture**: Built cleanly with native Node.js ES Modules (`import`/`export`) and Express 5 for enhanced async route handling.
- **Scalable Document Modeling**: Pre-indexed Mongoose schemas with relational foreign keys (`storeId`, `userId`) and unique constraints on critical fields.
- **Developer-Friendly Setup**: Zero extraneous build tooling—clone, configure your `.env`, and start immediately with `npm run dev`.

---

## Tech Stack

| Layer              | Technology                                                                                                        | Purpose                                            |
| :----------------- | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| **Runtime**        | [Node.js](https://nodejs.org/) (ESM)                                                                              | Server-side JavaScript runtime                     |
| **Framework**      | [Express 5](https://expressjs.com/)                                                                               | Lightweight web server & routing framework         |
| **Database**       | [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/)                                     | Schema modeling, validation, and persistence       |
| **Validation**     | [Zod](https://zod.dev/)                                                                                           | Strict runtime request schema validation           |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing (15 rounds) & dual JWT management |
| **Code Quality**   | [ESLint](https://eslint.org/) & [Prettier](https://prettier.io/)                                                  | Code style linting and formatting                  |

---

## Architecture & Data Model

The database layer models relations between physical stores, employees, and daily attendance logs:

```text
+------------------+         1 : N         +------------------+
|      Store       |<----------------------|       User       |
|------------------|                       |------------------|
| _id (PK)         |                       | _id (PK)         |
| name (unique)    |                       | storeId (FK)     |
| address (unique) |                       | name             |
| latitude (unique)|                       | email (unique)   |
| longitude(unique)|                       | password (hash)  |
| timestamps       |                       | isValid (bool)   |
+------------------+                       +------------------+
                                                    |
                                                    | 1 : N
                                                    v
                                           +------------------+
                                           |    Attendance    |
                                           |------------------|
                                           | _id (PK)         |
                                           | userId (FK)      |
                                           | latitude         |
                                           | longitude        |
                                           | imageUrl         |
                                           | timestamps       |
                                           +------------------+
```

---

## Project Structure

```text
hrms-backend/
├── database/
│   ├── attendance_model.js    # Mongoose schema for attendance check-ins
│   ├── store_model.js         # Mongoose schema for store locations
│   └── user_model.js          # Mongoose schema for user accounts
├── routes/
│   ├── auth/
│   │   ├── auth_controller.js # User registration and credential authentication
│   │   └── auth_routes.js     # User endpoints (/account/auth/*)
│   ├── jwt/
│   │   └── jwt_routes.js      # Token verification and refresh (/jwt/*)
│   ├── store/
│   │   ├── store_controller.js# Store creation and catalog handlers
│   │   └── store_routes.js    # Store endpoints (/account/store/*)
│   └── export.js              # Central barrel export for route modules
├── utils/
│   ├── middleware.js          # JWT and Account authorization middlewares
│   └── tokens.js              # Token generation and verification utility
├── .env.example               # Environment variable configuration template
├── app.js                     # Application entry point & middleware mounting
├── CONTRIBUTING.md            # Guidelines for open source contributors
├── LICENSE                    # ISC license terms
└── package.json               # NPM scripts, metadata, and dependencies
```

---

## Getting Started

### Prerequisites

Ensure the following tools are installed on your environment:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a remote [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/masanthimanshu/hrms-backend.git
   cd hrms-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

### Environment Configuration

Create a local environment file from the provided template:

```bash
cp .env.example .env
```

Open `.env` and fill in your environment values:

```env
# Server Port
PORT=5500

# MongoDB URI (appends ?authSource=admin at runtime)
DB_URL=mongodb://localhost:27017/hrms

# Account Authorization Key (sent in 'account' header)
ACCOUNT_ID=your_account_id_here

# JWT Secrets for Access and Refresh Tokens
AUTH_TOKEN_SECRET=your_auth_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
```

### Running the Application

- **Development Mode** (with automatic reload via `nodemon`):

  ```bash
  npm run dev
  ```

- **Production Mode**:

  ```bash
  npm start
  ```

Once launched, the console will confirm:

```text
App Started
Database Connected
```

The server is available at `http://localhost:5500` (or your configured `PORT`).

---

## Usage Examples

### 1. Health Check

Verify the API server is operational:

```bash
curl -X GET http://localhost:5500/health
```

**Response (`200 OK`)**:

```json
{
  "message": "Server running"
}
```

### 2. User Registration & Login

All `/account/*` endpoints require the `account: <ACCOUNT_ID>` header matching your `.env`.

**Register an Employee**:

```bash
curl -X POST http://localhost:5500/account/auth/create \
  -H "Content-Type: application/json" \
  -H "account: your_account_id_here" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "storeId": "651f1f1b2c3d4e5f6a7b8c9d",
    "password": "SecurePassword123!"
  }'
```

**Authenticate / Login**:

```bash
curl -X POST http://localhost:5500/account/auth/login \
  -H "Content-Type: application/json" \
  -H "account: your_account_id_here" \
  -d '{
    "email": "jane@example.com",
    "password": "SecurePassword123!"
  }'
```

**Response (`200 OK`)**:

```json
{
  "status": "Success",
  "authToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

### 3. Token Refresh Flow

When the access token expires, use the refresh token to obtain a fresh token pair:

```bash
curl -X GET http://localhost:5500/jwt/refresh \
  -H "authorization: <authToken>" \
  -H "refresh: <refreshToken>"
```

### 4. Store Management

**Create a Store Branch**:

```bash
curl -X POST http://localhost:5500/account/store/create \
  -H "Content-Type: application/json" \
  -H "account: your_account_id_here" \
  -d '{
    "name": "Downtown Branch",
    "address": "123 Market St, San Francisco, CA",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  }'
```

**List All Stores**:

```bash
curl -X GET http://localhost:5500/account/store/get \
  -H "account: your_account_id_here"
```

---

## Support & Help

If you run into issues, need assistance, or want to report a problem:

- **Issue Tracker**: Submit a bug report or feature proposal on GitHub via [Issues](https://github.com/masanthimanshu/hrms-backend/issues).
- **Direct Inquiries**: Contact the maintainer directly at [masanthimanshu@gmail.com](mailto:masanthimanshu@gmail.com).
- **Code Reference**: Inspect the [routes/](routes/) and [database/](database/) directories for entity models and controller logic.

---

## Contributing

Contributions are welcomed and greatly appreciated!

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on code standards, branch naming, ESLint/Prettier checks, and submitting pull requests.

1. Fork the project repository.
2. Create a feature branch (`git checkout -b feature/new-feature`).
3. Verify linting (`npx eslint .`) and formatting (`npx prettier --write .`).
4. Commit your changes (`git commit -m 'feat: add feature description'`).
5. Push to your branch (`git push origin feature/new-feature`).
6. Open a Pull Request.

---

## Maintainers

- **Himanshu** - [@masanthimanshu](https://github.com/masanthimanshu) • [masanthimanshu@gmail.com](mailto:masanthimanshu@gmail.com)

---

## License

This project is licensed under the terms of the [ISC License](LICENSE).
