# HRMS Backend

[![Live API](https://img.shields.io/badge/Live_API-Online-success?style=flat&logo=cloudflare)](https://hrms.scoobies.ai/app/health)
[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.3.0-blue.svg)](https://expressjs.com/)
[![MongoDB Mongoose](https://img.shields.io/badge/mongoose-v9.11.1-green.svg)](https://mongoosejs.com/)
[![Docker Ready](https://img.shields.io/badge/docker-ready-2496ED?logo=docker&logoColor=white)](compose.yaml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A modular, production-ready Node.js REST API backend for an enterprise **Human Resource Management System (HRMS)**. Engineered with Express 5, MongoDB (Mongoose), native ES Modules, AWS S3 presigned asset storage, and Docker containerization, this service manages workforce operations including employee onboarding, multi-branch store cataloging, geo-tagged attendance tracking, and dual-layer security verification.

> **Live Deployment Base URL:** [`https://hrms.scoobies.ai/app/`](https://hrms.scoobies.ai/app/)  
> **Health Check:** [`https://hrms.scoobies.ai/app/health`](https://hrms.scoobies.ai/app/health)

---

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Why It Is Useful](#why-it-is-useful)
- [Tech Stack](#tech-stack)
- [Architecture & Data Model](#architecture--data-model)
- [Project Structure](#project-structure)
- [How to Get Started](#how-to-get-started)
  - [Prerequisites](#prerequisites)
  - [Environment Configuration](#environment-configuration)
  - [Option A: Run with Docker (Recommended)](#option-a-run-with-docker-recommended)
  - [Option B: Run Locally with Node.js](#option-b-run-locally-with-nodejs)
- [Usage Examples](#usage-examples)
  - [1. Health Check](#1-health-check)
  - [2. Store Management](#2-store-management)
  - [3. User Registration & Authentication](#3-user-registration--authentication)
  - [4. Dual-Token Refresh Flow](#4-dual-token-refresh-flow)
  - [5. Protected Route Access](#5-protected-route-access)
- [Where Users Can Get Help](#where-users-can-get-help)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

---

## What the Project Does

**HRMS Backend** operates as the core API service for enterprise workforce, facility, and attendance administration:

- **Store & Branch Cataloging**: Register and query physical facility branches with geo-coordinates (latitude & longitude) and physical addresses.
- **Employee Onboarding & Authentication**: Onboard organizational personnel mapped to specific store branches with securely salted password hashing (`bcrypt` 15 rounds).
- **Two-Tier Middleware Protection**: Secure administrative endpoints via static account key headers (`account`), while protecting session-based actions via signature-verified JSON Web Tokens (JWT).
- **Dual-Token Lifecycle**: Issue short-lived access tokens (2-day validity) and long-lived refresh tokens (10-day validity) with automated token rotation and renewal.
- **Geo-Verified Attendance & Media Proofs**: Store schemas designed for tracking check-ins with location coordinates and presigned AWS S3 URLs for photo verification.

---

## Why It Is Useful

- **Instant Live Access**: Test endpoints immediately against the live deployment at [`https://hrms.scoobies.ai/app/`](https://hrms.scoobies.ai/app/) without local configuration.
- **Dual-Layer Middleware Security**: Route guards enforce tenant/account validation across `/account/*` routes, while cryptographic JWT checks protect `/secure/*` resources.
- **Fail-Safe Schema Validation**: Integrates [Zod](https://zod.dev/) strict runtime validation to reject invalid or unauthorized payload shapes before reaching business logic.
- **Modern ES Module & Express 5 Core**: Built cleanly with native Node.js ES Modules (`import`/`export`) and Express 5 for enhanced async route handling and error handling.
- **Containerized for Production**: Pre-configured with a lightweight `Dockerfile` and `compose.yaml` for one-command deployment alongside MongoDB.
- **Scalable Document Modeling**: Optimized Mongoose schemas with indexed foreign keys (`storeId`, `userId`) and unique integrity constraints.

---

## Tech Stack

| Layer | Technology | Purpose |
| :--- | :--- | :--- |
| **Runtime** | [Node.js](https://nodejs.org/) (ESM, Node 24 support) | Server-side JavaScript runtime |
| **Framework** | [Express 5](https://expressjs.com/) (`v5.3.0`) | High-performance routing & web server |
| **Database** | [MongoDB](https://www.mongodb.com/) via [Mongoose 9](https://mongoosejs.com/) | Relational document modeling & validation |
| **Validation** | [Zod](https://zod.dev/) (`v4.x`) | Strict runtime schema parsing & type safety |
| **Authentication** | [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) & [bcrypt](https://github.com/kelektiv/node.bcrypt.js) | Password hashing (15 rounds) & dual JWT lifecycle |
| **Cloud Storage** | [AWS SDK for JavaScript v3](https://aws.amazon.com/sdk-for-javascript/) (`@aws-sdk/client-s3`) | Presigned S3 upload & retrieval for proof images |
| **Containerization**| [Docker](https://www.docker.com/) & Docker Compose | Multi-container reproducible development & deployment |
| **Code Quality** | [ESLint](https://eslint.org/) | Code style linting and ES standard enforcement |

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
                                           | imageUrl (S3)    |
                                           | timestamps       |
                                           +------------------+
```

---

## Project Structure

```text
hrms-backend/
├── aws/
│   └── s3_client.js           # AWS S3 presigned URL generation and client utilities
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
├── .dockerignore              # Files excluded from Docker image builds
├── .env.example               # Environment variable configuration template
├── app.js                     # Application entry point & middleware mounting
├── compose.yaml               # Docker Compose service definition (App + Mongo)
├── CONTRIBUTING.md            # Guidelines for open source contributors
├── Dockerfile                 # Container image configuration (Node.js base)
├── LICENSE                    # ISC license terms
└── package.json               # NPM scripts, metadata, and dependencies
```

---

## How to Get Started

### Prerequisites

Ensure you have one of the following installed:
- **Docker & Docker Compose** (Recommended for zero-dependency local runs), OR
- **Node.js**: `v18.0.0` or higher (tested on Node 24)
- **MongoDB**: A running local instance (`mongodb://localhost:27017`) or a [MongoDB Atlas](https://www.mongodb.com/atlas) connection URI

### Environment Configuration

Create a local environment file from the template:

```bash
cp .env.example .env
```

Open `.env` and configure your variables:

```env
# Server Port
PORT=5500

# MongoDB URI (database query appends ?authSource=admin at runtime)
DB_URL=mongodb://localhost:27017/hrms

# Account Authorization Key (sent in 'account' header)
ACCOUNT_ID=your_account_id_here

# JWT Secrets for Access and Refresh Tokens
AUTH_TOKEN_SECRET=your_auth_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here

# AWS Configuration (optional, for attendance image storage)
BUCKET_NAME=your_s3_bucket_name
```

---

### Option A: Run with Docker (Recommended)

Start both the backend application and MongoDB with a single command:

```bash
docker compose up -d --build
```

- The API is available at: `http://localhost:5500`
- To stop the containers: `docker compose down`

---

### Option B: Run Locally with Node.js

1. Clone the repository:

   ```bash
   git clone https://github.com/masanthimanshu/hrms-backend.git
   cd hrms-backend
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Start the application:
   - **Development Mode** (with automatic reload via `nodemon`):

     ```bash
     npm run dev
     ```

   - **Production Mode**:

     ```bash
     npm start
     ```

4. The console will confirm:

   ```text
   App Started
   Database Connected
   ```

---

## Usage Examples

You can test these endpoints against the **Live Production API** (`https://hrms.scoobies.ai/app`) or your **Local Instance** (`http://localhost:5500`).

Set your base URL in your shell:

```bash
# Target live production server:
API_URL="https://hrms.scoobies.ai/app"

# Or target local development server:
# API_URL="http://localhost:5500"
```

### 1. Health Check

Verify the API server is operational:

```bash
curl -X GET "$API_URL/health"
```

**Response (`200 OK`)**:
```json
{
  "message": "Server running"
}
```

Check individual subservice health:
```bash
curl -X GET "$API_URL/jwt/health"
```

---

### 2. Store Management

All `/account/*` endpoints require the `account: <ACCOUNT_ID>` header matching your configured account key.

**Create a Store Branch**:

```bash
curl -X POST "$API_URL/account/store/create" \
  -H "Content-Type: application/json" \
  -H "account: your_account_id_here" \
  -d '{
    "name": "Downtown Tech Hub",
    "address": "100 Innovation Blvd, Suite 400",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  }'
```

**List All Stores**:

```bash
curl -X GET "$API_URL/account/store/get" \
  -H "account: your_account_id_here"
```

---

### 3. User Registration & Authentication

**Register an Employee**:

```bash
curl -X POST "$API_URL/account/auth/create" \
  -H "Content-Type: application/json" \
  -H "account: your_account_id_here" \
  -d '{
    "name": "Alex Mercer",
    "email": "alex.mercer@example.com",
    "storeId": "651f1f1b2c3d4e5f6a7b8c9d",
    "password": "SuperSecretPassword123!"
  }'
```

**Authenticate / Login**:

```bash
curl -X POST "$API_URL/account/auth/login" \
  -H "Content-Type: application/json" \
  -H "account: your_account_id_here" \
  -d '{
    "email": "alex.mercer@example.com",
    "password": "SuperSecretPassword123!"
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

---

### 4. Dual-Token Refresh Flow

When the access token expires (2-day validity), use the long-lived refresh token (10-day validity) to acquire a fresh token pair:

```bash
curl -X GET "$API_URL/jwt/refresh" \
  -H "authorization: <authToken>" \
  -H "refresh: <refreshToken>"
```

**Response (`200 OK`)**:
```json
{
  "status": "Success",
  "authToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

---

### 5. Protected Route Access

Endpoints prefixed with `/secure/*` require both `authorization` and `refresh` headers:

```bash
curl -X GET "$API_URL/secure/verify" \
  -H "authorization: <authToken>" \
  -H "refresh: <refreshToken>"
```

**Response (`200 OK`)**:
```json
{
  "message": "User is valid"
}
```

---

## Where Users Can Get Help

If you run into issues, need assistance, or want to report a bug:

- **Issue Tracker**: Submit a bug report or feature proposal on GitHub via [Issues](https://github.com/masanthimanshu/hrms-backend/issues).
- **Direct Support**: Contact the project maintainer directly at [masanthimanshu@gmail.com](mailto:masanthimanshu@gmail.com).
- **Live Status Check**: Validate deployment status anytime at the [Live Health Endpoint](https://hrms.scoobies.ai/app/health).
- **Documentation**: Consult [CONTRIBUTING.md](CONTRIBUTING.md) for development workflows and standards.

---

## Contributing

Contributions are welcomed and greatly appreciated!

Please review our [CONTRIBUTING.md](CONTRIBUTING.md) guide for details on coding standards, commit formatting, ESLint verification, and pull request submissions.

1. Fork the project repository.
2. Create a feature branch (`git checkout -b feature/amazing-feature`).
3. Verify linting (`npx eslint .`).
4. Commit your changes (`git commit -m 'feat: add amazing feature'`).
5. Push to your branch (`git push origin feature/amazing-feature`).
6. Open a Pull Request.

---

## Maintainers

- **Himanshu** - [@masanthimanshu](https://github.com/masanthimanshu) • [masanthimanshu@gmail.com](mailto:masanthimanshu@gmail.com)

---

## License

This project is open source and available under the terms of the [ISC License](LICENSE).
