# HRMS Backend

[![Node.js Version](https://img.shields.io/badge/node-%3E%3D18.0.0-brightgreen.svg)](https://nodejs.org/)
[![Express Version](https://img.shields.io/badge/express-v5.2.1-blue.svg)](https://expressjs.com/)
[![MongoDB Mongoose](https://img.shields.io/badge/mongoose-v9.11.1-green.svg)](https://mongoosejs.com/)
[![ES Module](https://img.shields.io/badge/module-ESM-yellow.svg)](https://nodejs.org/api/esm.html)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg)](LICENSE)

A robust, modular Node.js REST API backend for a **Human Resource Management System (HRMS)**. Designed to handle employee onboarding, multi-store location management, geo-tagged attendance logging, and secure multi-tier authentication.

---

## Table of Contents

- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Architecture & Data Model](#architecture--data-model)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
- [API Overview](#api-overview)
  - [Authentication & Account Endpoints](#authentication--account-endpoints)
  - [Store Management](#store-management)
  - [Token Management](#token-management)
  - [Verification & Health](#verification--health)
- [Contributing](#contributing)
- [Maintainers](#maintainers)
- [License](#license)

---

## Overview

**HRMS Backend** serves as the core API service for managing organizational workforce operations. It provides centralized endpoints for managing store facilities, onboarding personnel tied to specific store locations, validating secure account-level headers, and tracking attendance records with coordinates and proof of presence.

Built with Express 5 and modern ES Module syntax, the service emphasizes clean separation of concerns across controllers, route handlers, and database schemas.

---

## Key Features

- **Dual-Layer Middleware Security**:
  - **Account Verification**: Validates requests against an authorized organizational account ID (`account` header).
  - **Dual-Token Authentication**: Secure JWT flow featuring short-lived auth tokens and long-lived refresh tokens (`authorization` and `refresh` headers).
- **Store Facility Management**: Register, catalog, and query multi-location branches with geographic coordinates (latitude and longitude).
- **User Onboarding & Authentication**: Secure user registration with salted password hashing via `bcrypt` (15 rounds) and credential verification.
- **Attendance Tracking**: Pre-configured schema support for geolocation-verified attendance check-ins including image attachments and timestamps.
- **Strict Request Validation**: Incoming request payloads validated using `zod` schemas to prevent malformed data.

---

## Tech Stack

| Component         | Technology                                                                                                        | Description                                        |
| :---------------- | :---------------------------------------------------------------------------------------------------------------- | :------------------------------------------------- |
| **Runtime**       | [Node.js](https://nodejs.org/)                                                                                    | Server-side JavaScript runtime (ES Modules)        |
| **Framework**     | [Express 5](https://expressjs.com/)                                                                               | Fast, unopinionated minimalist web framework       |
| **Database**      | [MongoDB](https://www.mongodb.com/) & [Mongoose](https://mongoosejs.com/)                                         | ODM for schema definition and document modeling    |
| **Validation**    | [Zod](https://zod.dev/)                                                                                           | TypeScript-first schema declaration and validation |
| **Security**      | [Bcrypt](https://github.com/kelektiv/node.bcrypt.js) & [jsonwebtoken](https://github.com/auth0/node-jsonwebtoken) | Password hashing and JWT generation/verification   |
| **Configuration** | [dotenv](https://github.com/motdotla/dotenv)                                                                      | Zero-dependency environment variable loader        |

---

## Architecture & Data Model

The database layer consists of three interconnected entities:

```
+------------------+         1 : N         +------------------+
|      Store       |<----------------------|       User       |
|------------------|                       |------------------|
| _id (PK)         |                       | _id (PK)         |
| name             |                       | storeId (FK)     |
| address          |                       | name             |
| latitude         |                       | email            |
| longitude        |                       | password (hash)  |
| timestamps       |                       | isValid          |
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
│   ├── attendance_model.js    # Mongoose schema for attendance records
│   ├── store_model.js         # Mongoose schema for store locations
│   └── user_model.js          # Mongoose schema for user accounts
├── routes/
│   ├── auth/
│   │   ├── auth_controller.js # Login and user registration logic
│   │   └── auth_routes.js     # User authentication routes & validation
│   ├── jwt/
│   │   └── jwt_routes.js      # Token verification and refresh route
│   ├── store/
│   │   ├── store_controller.js# Store creation and retrieval handlers
│   │   └── store_routes.js    # Store management routes & validation
│   └── export.js              # Central barrel export for route modules
├── utils/
│   ├── middleware.js          # JWT and Account authorization middlewares
│   └── tokens.js              # Token generation and verification utility
├── .env.example               # Template for environment configuration
├── app.js                     # Server initialization and middleware setup
└── package.json               # Project manifest and scripts
```

---

## Getting Started

### Prerequisites

Ensure you have the following installed on your machine:

- **Node.js**: `v18.0.0` or higher
- **npm**: `v9.0.0` or higher
- **MongoDB**: Local MongoDB instance (`mongodb://localhost:27017`) or a remote MongoDB Atlas URI

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

Create a `.env` file in the project root by copying the template:

```bash
cp .env.example .env
```

Configure the environment variables according to your local setup:

```env
# Server Port
PORT=5500

# MongoDB Connection String
DB_URL=mongodb://localhost:27017/hrms

# Account Authorization Secret
ACCOUNT_ID=your_account_id_here

# JWT Signing Keys
AUTH_TOKEN_SECRET=your_auth_token_secret_here
REFRESH_TOKEN_SECRET=your_refresh_token_secret_here
```

### Running the Application

- **Development Mode** (with auto-reload via `nodemon`):

  ```bash
  npm run dev
  ```

- **Production Mode**:
  ```bash
  npm start
  ```

Upon startup, you will see:

```text
App Started
Database Connected
```

The server listens on `http://localhost:<PORT>` (default: `http://localhost:5500`).

---

## API Overview

### Verification & Health

| Method | Endpoint         | Headers Required           | Description                    |
| :----- | :--------------- | :------------------------- | :----------------------------- |
| `GET`  | `/health`        | None                       | Verify server status           |
| `GET`  | `/secure/verify` | `authorization`, `refresh` | Validate active session tokens |

### Authentication & Account Endpoints

All `/account/*` routes require the `account: <ACCOUNT_ID>` header.

| Method | Endpoint               | Body Parameters                        | Description                   |
| :----- | :--------------------- | :------------------------------------- | :---------------------------- |
| `GET`  | `/account/auth/health` | None                                   | Verify auth module status     |
| `GET`  | `/account/auth/get`    | None                                   | Retrieve list of all users    |
| `POST` | `/account/auth/create` | `name`, `email`, `storeId`, `password` | Register a new user           |
| `POST` | `/account/auth/login`  | `email`, `password`                    | Authenticate user credentials |

### Store Management

All store routes require the `account: <ACCOUNT_ID>` header.

| Method | Endpoint                | Body Parameters                            | Description                 |
| :----- | :---------------------- | :----------------------------------------- | :-------------------------- |
| `GET`  | `/account/store/health` | None                                       | Verify store module status  |
| `GET`  | `/account/store/get`    | None                                       | Retrieve list of all stores |
| `POST` | `/account/store/create` | `name`, `address`, `latitude`, `longitude` | Create a new store facility |

### Token Management

| Method | Endpoint       | Headers Required           | Description                                         |
| :----- | :------------- | :------------------------- | :-------------------------------------------------- |
| `GET`  | `/jwt/health`  | None                       | Verify JWT module status                            |
| `GET`  | `/jwt/refresh` | `authorization`, `refresh` | Exchange a valid refresh token for a new token pair |

#### Quick Example: Checking Server Health

```bash
curl -X GET http://localhost:5500/health
```

#### Quick Example: Fetching Stores

```bash
curl -X GET http://localhost:5500/account/store/get \
  -H "account: your_account_id_here"
```

---

## Contributing

Contributions are welcome! Please follow these basic steps:

1. Fork the repository.
2. Create your feature branch (`git checkout -b feature/amazing-feature`).
3. Commit your changes (`git commit -m 'Add some amazing feature'`).
4. Push to the branch (`git push origin feature/amazing-feature`).
5. Open a Pull Request.

---

## Maintainers

- **Himanshu** - [@masanthimanshu](https://github.com/masanthimanshu)

---

## License

This project is licensed under the [ISC License](LICENSE).
