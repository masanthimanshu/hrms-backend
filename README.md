# HRMS Backend

[![Node.js Version](https://img.shields.io/badge/Node.js-v24+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3%20Presigned-FF9900?style=flat-square&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Email](https://img.shields.io/badge/Email-Resend-black?style=flat-square&logo=resend&logoColor=white)](https://resend.com/)
[![Validation](https://img.shields.io/badge/Validation-Zod%204.x-3068b7?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](compose.yaml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](package.json)

A modern, cloud-native REST API backend for Human Resource Management Systems (HRMS). Built with Node.js and Express 5, this service provides store location administration, employee lifecycle onboarding with automated credential dispatch, geofenced attendance tracking with real-time GPS distance calculation, direct-to-S3 presigned image uploads, and dual-token JWT authentication.

---

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Why the Project Is Useful](#why-the-project-is-useful)
- [System Architecture & Data Model](#system-architecture--data-model)
  - [Project Structure](#project-structure)
  - [Request Flow & Security Layers](#request-flow--security-layers)
  - [Authentication & Check-In Sequence](#authentication--check-in-sequence)
  - [Entity Relationship Diagram](#entity-relationship-diagram)
- [How Users Can Get Started](#how-users-can-get-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Service](#running-the-service)
  - [Running with Docker](#running-with-docker)
- [API Architecture & Usage Guide](#api-architecture--usage-guide)
  - [Security & Authentication Guards](#security--authentication-guards)
  - [Endpoint Summary](#endpoint-summary)
  - [End-to-End Workflow Examples](#end-to-end-workflow-examples)
- [Where Users Can Get Help](#where-users-can-get-help)
- [Who Maintains and Contributes](#who-maintains-and-contributes)
- [License](#license)

---

## What the Project Does

The **HRMS Backend** serves as the central operational service powering organizational workforce management. It manages:

- **Store & Workplace Locations**: Register and track physical branch locations with high-precision GPS coordinates (latitude and longitude) and street addresses.
- **Employee Lifecycle & Onboarding**: Register team members linked to designated workplace stores. Temporary passwords are automatically generated cryptographically and dispatched to employee inboxes using Resend and custom HTML email templates.
- **Account Activation & Verification**: Administrative controls to toggle employee account status (`isValid`) and manage employee rosters.
- **Geofenced Attendance Tracking**: Record employee clock-in events with live coordinates and verification selfie images. The backend calculates real-time distance (in meters) between the employee's check-in location and their assigned store using the Haversine formula via `geolib`.
- **Real-Time Distance Checks**: Dedicated endpoint (`/secure/user/distance`) allowing client applications to preview an employee's distance to their assigned branch prior to submitting attendance.
- **Direct S3 Asset Upload Pipeline**: Generate time-limited, presigned AWS S3 `PUT` URLs allowing client apps to upload verification media directly to Amazon S3 without routing heavy binary payloads through the Node.js API server.
- **Dual-Token Authentication**: Secure session management with short-lived access tokens (2 days), long-lived refresh tokens (10 days), and non-intrusive session renewal endpoints.
- **Administrative Portal Operations**: Dedicated administrator authentication and aggregated organizational attendance reporting.

---

## Why the Project Is Useful

- **Eliminates Attendance Fraud**: Automatic Haversine distance calculations verify that employees are physically on-site when clocking in, preventing remote or spoofed check-ins.
- **Zero-Bottleneck Media Pipeline**: Direct-to-S3 presigned uploads offload heavy image handling directly to cloud storage, preserving server memory and network bandwidth during peak shift check-in windows.
- **Automated Credential Delivery**: Automatically provisions new hires with cryptographically random passwords and delivers branded onboarding emails using the Resend API and [email.html](email.html).
- **Multi-Tiered Route Protection**: Segregates admin controls behind static account secrets, guards employee actions with dual-token JWT verification, and protects superadmin reporting with role-checked administrative tokens.
- **Strict Payload Validation**: All mutable endpoints enforce strict [Zod](https://zod.dev/) schemas, rejecting unknown or invalid attributes upfront.
- **Built on Express 5 & ES Modules**: Employs Express 5 native promise handling, strict ES module architecture, and clean separation between routes, controllers, and database models.
- **Containerized & Production Ready**: Preconfigured with [Dockerfile](Dockerfile) and [compose.yaml](compose.yaml) for rapid local development or automated container deployment.

---

## System Architecture & Data Model

### Project Structure

```plaintext
hrms-backend/
├── app.js                   # Application bootstrap, global middleware & route mounting
├── package.json             # Project dependencies and lifecycle scripts
├── Dockerfile               # Node 24 Alpine/Debian container definition
├── compose.yaml             # Docker Compose service definition
├── .env.example             # Template for required environment variables
├── email.html               # Responsive HTML onboarding email template
├── eslint.config.js         # ESLint flat configuration
├── aws/
│   └── s3_client.js         # AWS S3 client, presigned URL helpers & S3 streaming
├── database/
│   ├── attendance_model.js  # Mongoose schema for attendance check-ins
│   ├── store_model.js       # Mongoose schema for physical store branches
│   └── user_model.js        # Mongoose schema for employees and store references
├── routes/
│   ├── export.js            # Aggregator module for all route handlers
│   ├── admin/               # Administrator login and company-wide attendance
│   ├── attendance/          # Employee check-in submission and history
│   ├── auth/                # Employee registration, activation, login & directory
│   ├── jwt/                 # JWT token renewal and health check
│   ├── store/               # Store registration and catalog
│   ├── upload/              # Presigned S3 image upload URL generation
│   └── user/                # Employee profile and real-time distance calculation
└── utils/
    ├── middleware.js        # JWT dual-token and account ID header guards
    └── tokens.js            # JWT signing, verification, and decoding service
```

### Request Flow & Security Layers

```mermaid
flowchart TD
    Client[Client Request] --> Router{Route Group}

    Router -->|/health, /jwt/*| Public[Public Handler]
    Router -->|/account/*| AccountMW["Middleware: account Header Guard"]
    Router -->|/secure/*| JwtMW["Middleware: Dual JWT Guard (auth + refresh)"]

    AccountMW -->|Valid Account ID| AccountRoutes{Account Sub-routes}
    AccountRoutes -->|/account/auth/*| AuthCtrl[Employee Auth & Lifecycle]
    AccountRoutes -->|/account/store/*| StoreCtrl[Store Location Management]
    AccountRoutes -->|/account/admin/login| AdminAuth[Admin Login]
    AccountRoutes -->|/account/admin/attendance| AdminJWT{"Admin JWT Check (user: admin)"}
    AdminJWT -->|Authorized| AdminAttendance[Aggregated Attendance Data]

    JwtMW -->|Valid Tokens| SecureRoutes{Secure Sub-routes}
    SecureRoutes -->|/secure/user/*| UserCtrl[User Profile & Proximity Distance]
    SecureRoutes -->|/secure/upload/*| S3Service[AWS S3 Presigned URL Service]
    SecureRoutes -->|/secure/attendance/*| AttService[Attendance & Geolib Calculation]
```

### Authentication & Check-In Sequence

```mermaid
sequenceDiagram
    autonumber
    actor Employee as Employee / Mobile App
    participant API as HRMS API Server
    participant S3 as AWS S3 Storage
    participant DB as MongoDB

    Note over Employee,API: 1. Authentication
    Employee->>API: POST /account/auth/login (email, password)
    API->>DB: Find user & verify bcrypt password
    API-->>Employee: Returns { authToken, refreshToken }

    Note over Employee,S3: 2. Direct-to-S3 Image Upload
    Employee->>API: POST /secure/upload/image (text)
    API-->>Employee: Returns { uploadUrl, key }
    Employee->>S3: PUT binary image payload to uploadUrl
    S3-->>Employee: 200 OK (Uploaded)

    Note over Employee,DB: 3. Attendance Recording
    Employee->>API: POST /secure/attendance/add (lat, lon, imageUrl)
    API->>DB: Fetch user & assigned store coordinates
    API->>API: Compute Haversine distance (geolib)
    API->>DB: Save attendance record (userId, coords, distance, imageUrl)
    API-->>Employee: 200 OK { status: "Attendance added successfully" }
```

### Entity Relationship Diagram

```mermaid
erDiagram
    STORE ||--o{ USER : "assigns"
    USER ||--o{ ATTENDANCE : "submits"

    STORE {
        ObjectId _id PK
        string name UK
        string address UK
        string latitude UK
        string longitude UK
        datetime createdAt
        datetime updatedAt
    }

    USER {
        ObjectId _id PK
        ObjectId storeId FK
        string name
        string email UK
        string password
        boolean isValid
        datetime createdAt
        datetime updatedAt
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        string latitude
        string longitude
        string distance
        string imageUrl
        datetime createdAt
        datetime updatedAt
    }
```

---

## How Users Can Get Started

### Prerequisites

Ensure the following tools and accounts are available before setting up the backend:

- **Node.js** >= 24.0.0
- **npm** >= 10.0.0
- **MongoDB** instance (local server or [MongoDB Atlas](https://www.mongodb.com/cloud/atlas))
- **AWS Account** with an active S3 bucket and IAM credentials with `s3:PutObject` and `s3:GetObject` permissions
- **Resend Account** with an active API key for delivering onboarding credential emails
- _(Optional)_ **Docker** & **Docker Compose** for containerized deployments

### Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/masanthimanshu/hrms-backend.git
   cd hrms-backend
   ```

2. **Install project dependencies:**

   ```bash
   npm install
   ```

### Environment Configuration

Copy the example environment template into a local configuration file:

```bash
cp .env.example .env
```

Configure the environment variables in `.env`:

| Variable               | Required | Description                                                            | Example                                    |
| :--------------------- | :------: | :--------------------------------------------------------------------- | :----------------------------------------- |
| `PORT`                 |   Yes    | Port number on which the Express server listens                        | `5500`                                     |
| `DB_URL`               |   Yes    | MongoDB connection URI (without database query parameters)             | `mongodb://localhost:27017/hrms`           |
| `ACCOUNT_ID`           |   Yes    | Administrative secret key evaluated by the `/account` middleware guard | `adm_secret_key_99`                        |
| `AUTH_TOKEN_SECRET`    |   Yes    | Secret key used to sign and verify short-lived JWT access tokens       | `your-auth-secret`                         |
| `REFRESH_TOKEN_SECRET` |   Yes    | Secret key used to sign and verify long-lived JWT refresh tokens       | `your-refresh-secret`                      |
| `AWS_KEY`              |   Yes    | AWS IAM Access Key ID with S3 read/write permissions                   | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET`           |   Yes    | AWS IAM Secret Access Key                                              | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `BUCKET_NAME`          |   Yes    | Target AWS S3 Bucket designated for check-in images                    | `hrms-attendance-bucket`                   |
| `RESEND_API_KEY`       |   Yes    | API Key from Resend for sending onboarding credential emails           | `re_1234567890abcdef`                      |

> [!NOTE]
> MongoDB connection automatically appends `?authSource=admin` during initialization inside [app.js](app.js).

### Running the Service

#### Development Mode (with auto-reload)

```bash
npm run dev
```

#### Production Mode

```bash
npm start
```

#### Linting & Code Style

```bash
npx eslint .
```

### Running with Docker

You can containerize and run the service via Docker Compose:

```bash
# Build and run containers in detached mode
docker compose up -d --build

# Inspect real-time container output
docker compose logs -f

# Stop running containers
docker compose down
```

The service will be accessible at `http://localhost:5500`.

---

## API Architecture & Usage Guide

### Security & Authentication Guards

The API classifies routes under four distinct security contexts:

1. **Public Routes** (`/health`, `/jwt/health`): No headers required.
2. **Account Guarded Routes** (`/account/*`): Require the administrative header:
   - `account: <ACCOUNT_ID>`
3. **Dual JWT Guarded Routes** (`/secure/*`): Require both JWT authentication headers:
   - `authorization: <AUTH_TOKEN>`
   - `refresh: <REFRESH_TOKEN>`
4. **Superadmin Routes** (`/account/admin/attendance`): Require both the `account: <ACCOUNT_ID>` header and an `authorization: <AUTH_TOKEN>` token issued to the `admin` account.
5. **Token Renewal Route** (`/jwt/refresh`): Requires `authorization: <AUTH_TOKEN>` and `refresh: <REFRESH_TOKEN>` headers to issue rotated token pairs.

### Endpoint Summary

| Method | Endpoint                      | Auth / Guard    | Description                                                    |
| :----- | :---------------------------- | :-------------- | :------------------------------------------------------------- |
| `GET`  | `/health`                     | Public          | Root service health check                                      |
| `GET`  | `/jwt/health`                 | Public          | JWT service health check                                       |
| `GET`  | `/jwt/refresh`                | Dual Token      | Exchanges a valid refresh token for a fresh token pair         |
| `GET`  | `/account/store/health`       | Account Guard   | Store service health check                                     |
| `POST` | `/account/store/create`       | Account Guard   | Registers a new physical store location                        |
| `GET`  | `/account/store/get`          | Account Guard   | Lists all registered stores                                    |
| `GET`  | `/account/auth/health`        | Account Guard   | Auth service health check                                      |
| `GET`  | `/account/auth/users`         | Account Guard   | Lists all employees (excluding password hashes)                |
| `POST` | `/account/auth/create`        | Account Guard   | Registers employee, generates temporary password & emails it   |
| `POST` | `/account/auth/validate/:uid` | Account Guard   | Toggles employee active state (`isValid`)                      |
| `POST` | `/account/auth/login`         | Account Guard   | Authenticates employee credentials and returns JWT token pair  |
| `GET`  | `/account/admin/health`       | Account Guard   | Admin service health check                                     |
| `POST` | `/account/admin/login`        | Account Guard   | Authenticates superadmin credentials and issues admin JWT pair |
| `GET`  | `/account/admin/attendance`   | Account + Admin | Retrieves all attendance logs across the entire organization   |
| `GET`  | `/secure/verify`              | Dual JWT        | Validates active employee session tokens                       |
| `GET`  | `/secure/user/health`         | Dual JWT        | User proximity service health check                            |
| `POST` | `/secure/user/distance`       | Dual JWT        | Calculates live distance (in meters) to assigned store         |
| `GET`  | `/secure/upload/health`       | Dual JWT        | Upload service health check                                    |
| `POST` | `/secure/upload/image`        | Dual JWT        | Generates a 5-minute AWS S3 presigned upload URL               |
| `GET`  | `/secure/attendance/health`   | Dual JWT        | Attendance service health check                                |
| `POST` | `/secure/attendance/add`      | Dual JWT        | Submits check-in, computes distance to store, records log      |
| `GET`  | `/secure/attendance/today`    | Dual JWT        | Retrieves today's attendance logs for the authenticated user   |
| `GET`  | `/secure/attendance/all`      | Dual JWT        | Retrieves complete attendance history for authenticated user   |

---

### End-to-End Workflow Examples

#### 1. Register a Store Branch

```bash
curl -X POST http://localhost:5500/account/store/create \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "name": "Downtown Flagship",
    "address": "456 Market Street, New York, NY",
    "latitude": "40.7128",
    "longitude": "-74.0060"
  }'
```

#### 2. Onboard an Employee

```bash
curl -X POST http://localhost:5500/account/auth/create \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "name": "Alex Johnson",
    "email": "alex.johnson@example.com",
    "storeId": "<STORE_OBJECT_ID>"
  }'
```

_An 8-byte random password is generated and dispatched to the employee's email via Resend._

#### 3. Activate the Employee Account

New employees are initialized with `isValid: false`. Activate the user via their user ID:

```bash
curl -X POST http://localhost:5500/account/auth/validate/<USER_OBJECT_ID> \
  -H "account: your-admin-account-id"
```

#### 4. Employee Login

```bash
curl -X POST http://localhost:5500/account/auth/login \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "email": "alex.johnson@example.com",
    "password": "<TEMPORARY_PASSWORD_FROM_EMAIL>"
  }'
```

Sample response:

```json
{
  "status": "Success",
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 5. Check Live Distance to Store

Clients can query real-time distance (in meters) to their assigned workplace store:

```bash
curl -X POST http://localhost:5500/secure/user/distance \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{
    "latitude": "40.7129",
    "longitude": "-74.0061"
  }'
```

Sample response:

```json
{
  "distance": 14
}
```

#### 6. Refresh Expired Tokens

Rotate access and refresh tokens using `/jwt/refresh`:

```bash
curl -X GET http://localhost:5500/jwt/refresh \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>"
```

Sample response:

```json
{
  "status": "Success",
  "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

#### 7. Generate Presigned URL & Upload Verification Photo

Request a presigned AWS S3 upload URL:

```bash
curl -X POST http://localhost:5500/secure/upload/image \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{
    "text": "Morning Shift Check-in"
  }'
```

Response:

```json
{
  "uploadUrl": "https://hrms-attendance-bucket.s3.ap-south-1.amazonaws.com/images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp?X-Amz-...",
  "key": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp"
}
```

Upload the image binary directly to S3 via HTTP `PUT`:

```bash
curl -X PUT "<UPLOAD_URL>" \
  -H "Content-Type: image/webp" \
  --data-binary "@selfie.webp"
```

#### 8. Record Attendance Check-In

```bash
curl -X POST http://localhost:5500/secure/attendance/add \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{
    "latitude": "40.7130",
    "longitude": "-74.0062",
    "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp"
  }'
```

_The backend resolves the user's assigned store location, calculates the distance (in meters) between coordinates, and stores the check-in record._

#### 9. Query Attendance History

Retrieve today's records or complete personal check-in history:

```bash
# Today's check-ins
curl -X GET http://localhost:5500/secure/attendance/today \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>"

# Complete check-in history
curl -X GET http://localhost:5500/secure/attendance/all \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>"
```

#### 10. Admin Login & Full Attendance Retrieval

Superadmins can log in via `/account/admin/login` and query company-wide attendance:

```bash
# 1. Authenticate as Admin
curl -X POST http://localhost:5500/account/admin/login \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "user": "hrms@scoobies.co.in",
    "pass": "#admin@1234#"
  }'

# 2. Retrieve All Company Attendance
curl -X GET http://localhost:5500/account/admin/attendance \
  -H "account: your-admin-account-id" \
  -H "authorization: <ADMIN_AUTH_TOKEN>"
```

---

## Where Users Can Get Help

- **Issue Tracker**: Submit bug reports and feature requests through [GitHub Issues](https://github.com/masanthimanshu/hrms-backend/issues).
- **Discussions & Support**: Ask questions or discuss architectural proposals via [GitHub Discussions](https://github.com/masanthimanshu/hrms-backend/discussions).
- **Source Code**: Review implementation details directly in [routes/](routes/), [database/](database/), [aws/](aws/), and [utils/](utils/).

---

## Who Maintains and Contributes

### Maintainer

Developed and maintained by **[Himanshu Masant](https://github.com/masanthimanshu)**.

### Contributing

Contributions are welcomed! To propose changes:

1. Fork the repository.
2. Create a dedicated feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Ensure all changes pass style checks:
   ```bash
   npx eslint .
   ```
4. Commit your changes with clear, descriptive commit messages:
   ```bash
   git commit -m "feat: add store geofence radius limit validation"
   ```
5. Push to your branch:
   ```bash
   git push origin feature/your-feature-name
   ```
6. Open a Pull Request on GitHub describing your changes and testing steps.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC). See [package.json](package.json) for details.
