# HRMS Backend

[![Node.js Version](https://img.shields.io/badge/Node.js-v24+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose%209.x-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3%20Presigned-FF9900?style=flat-square&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![Email](https://img.shields.io/badge/Email-Resend-black?style=flat-square&logo=resend&logoColor=white)](https://resend.com/)
[![Validation](https://img.shields.io/badge/Validation-Zod%204.x-3068b7?style=flat-square&logo=zod&logoColor=white)](https://zod.dev/)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](compose.yaml)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](package.json)

A modern, cloud-native REST API backend for Human Resource Management Systems (HRMS). Built with Node.js and Express 5, this service provides store location administration, employee lifecycle onboarding with automated credential dispatch via email, geofenced attendance tracking with real-time GPS distance calculation, direct-to-S3 presigned image uploads, and dual-token JWT authentication.

---

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Why the Project Is Useful](#why-the-project-is-useful)
- [Architecture & Key Workflows](#architecture--key-workflows)
  - [System Architecture](#system-architecture)
  - [Repository Structure](#repository-structure)
  - [Data Model](#data-model)
- [How Users Can Get Started](#how-users-can-get-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
  - [Running with Docker](#running-with-docker)
- [API Overview & Quickstart Usage](#api-overview--quickstart-usage)
  - [Security & Authentication Guards](#security--authentication-guards)
  - [Endpoint Summary](#endpoint-summary)
  - [Quickstart Workflow Examples](#quickstart-workflow-examples)
- [Complete API Reference](#complete-api-reference)
  - [System & Health](#system--health)
  - [JWT Service](#jwt-service)
  - [Store Management](#store-management)
  - [Authentication & User Management](#authentication--user-management)
  - [Administrative Operations](#administrative-operations)
  - [User Location Services](#user-location-services)
  - [Media Upload Pipeline](#media-upload-pipeline)
  - [Attendance Tracking](#attendance-tracking)
- [Where Users Can Get Help](#where-users-can-get-help)
- [Who Maintains and Contributes](#who-maintains-and-contributes)
- [License](#license)

---

## What the Project Does

The **HRMS Backend** serves as the core operational service powering workforce and branch management:

- **Store & Branch Management**: Register and maintain physical workplace stores with precise GPS coordinates (latitude/longitude) and street addresses.
- **Automated Employee Onboarding**: Provision user profiles assigned to specific stores. The system generates secure, cryptographically random temporary credentials and dispatches a welcome email with custom HTML branding via Resend.
- **Account Verification Lifecycle**: Administrative toggle (`isValid`) to verify and authorize employee accounts before allowing system access.
- **Geofenced Attendance Verification**: Record clock-ins with live GPS coordinates and verification selfies. Checks the distance in meters between the employee and their assigned store using the Haversine formula (`geolib`).
- **Live Distance Calculation**: On-demand distance endpoint enabling client apps to calculate proximity to the designated store before check-in.
- **Presigned Direct-to-S3 Media Uploads**: Generates short-lived AWS S3 presigned URLs, allowing client apps to upload verification photos directly to S3 without sending heavy binary data through the API server.
- **Dual-Token Authentication**: Secure authentication flow with 2-day access tokens and 10-day refresh tokens with automated session refresh.
- **Administrative Portal & Oversight**: Admin authentication and organization-wide attendance log auditing across all users or filtered by individual employee ID.

---

## Why the Project Is Useful

- **Eliminates Attendance Fraud**: Real-time GPS coordinate validation against assigned store coordinates ensures employees are physically present on-site when clocking in.
- **Zero-Bottleneck Media Pipeline**: Direct-to-S3 presigned image uploads offload heavy media processing from Node.js, keeping API memory footprints minimal and check-in latency low during peak shift hours.
- **Frictionless Onboarding**: Automates credential generation and email delivery, eliminating manual password resets during initial team setup.
- **Layered Security Architecture**: Strict header separation protects administrative provisioning endpoints (`account` header) while client sessions use dual JWT tokens (`authorization` and `refresh` headers).
- **Modern & Lightweight**: Built on Express 5 with native ECMAScript modules (ESM) and schema-validated requests via Zod.

---

## Architecture & Key Workflows

### System Architecture

```mermaid
flowchart TD
    Client["Client Apps (Web / Mobile)"]

    subgraph Security["Security & Middleware"]
        AccountGuard["Account ID Guard (/account/*)"]
        JWTGuard["Dual JWT Guard (/secure/*)"]
    end

    subgraph HRMS["HRMS Backend (Express 5)"]
        AuthModule["Auth & Admin Controller"]
        StoreModule["Store Management"]
        AttendanceModule["Attendance & Geofencing"]
        UploadModule["S3 Presigner"]
    end

    subgraph External["External Cloud Services"]
        MongoDB[("MongoDB Database")]
        S3[("AWS S3 Bucket")]
        Resend["Resend Email Service"]
    end

    Client -->|X-Account-ID| AccountGuard --> AuthModule & StoreModule
    Client -->|Bearer & Refresh Tokens| JWTGuard --> AttendanceModule & UploadModule
    AuthModule -->|User Records| MongoDB
    AuthModule -->|Welcome Email| Resend
    StoreModule -->|Store Coordinates| MongoDB
    AttendanceModule -->|Distance Math via Geolib| MongoDB
    UploadModule -->|Presigned PUT URL| Client
    Client -->|Direct Binary Upload| S3
```

### Repository Structure

```
hrms-backend/
├── app.js                   # Application entry point, routing, and database connection
├── package.json             # Dependencies, scripts, and package metadata
├── compose.yaml             # Docker Compose service definition
├── Dockerfile               # Node 24 container build configuration
├── .env.example             # Template for required environment variables
├── eslint.config.js         # ESLint configuration
├── email.html               # Responsive HTML email template for welcome credentials
├── aws/
│   └── s3_client.js         # AWS S3 client & presigned URL generators
├── database/
│   ├── .eraserdiagram       # Architecture entity relationship diagram
│   ├── user_model.js        # Mongoose schema for user accounts
│   ├── store_model.js       # Mongoose schema for stores / workplace locations
│   └── attendance_model.js   # Mongoose schema for attendance check-ins
├── routes/
│   ├── export.js            # Centralized router export barrel
│   ├── admin/               # Admin login and full attendance query endpoints
│   ├── auth/                # User login, registration, and activation endpoints
│   ├── store/               # Store creation and retrieval endpoints
│   ├── user/                # User-specific utility routes (e.g. proximity checks)
│   ├── upload/              # Direct-to-S3 presigned upload routes
│   ├── attendance/          # User attendance check-in and history routes
│   └── jwt/                 # Token refresh and renewal routes
└── utils/
    ├── middleware.js        # Express middleware for JWT and Account authentication
    └── tokens.js            # JWT signing, verification, and decoding helpers
```

### Data Model

```mermaid
erDiagram
    STORE {
        ObjectId _id PK
        string name "unique"
        string address "unique"
        string latitude
        string longitude
        datetime createdAt
        datetime updatedAt
    }

    USER {
        ObjectId _id PK
        ObjectId storeId FK
        string name
        string email "unique"
        string password "bcrypt hash"
        boolean isValid "default: false"
        datetime createdAt
        datetime updatedAt
    }

    ATTENDANCE {
        ObjectId _id PK
        ObjectId userId FK
        string latitude
        string longitude
        string distance "meters from store"
        string imageUrl "S3 object key"
        datetime createdAt
        datetime updatedAt
    }

    STORE ||--o{ USER : "employs"
    USER ||--o{ ATTENDANCE : "submits"
```

---

## How Users Can Get Started

### Prerequisites

- **Node.js**: `v24.x` or later (LTS recommended)
- **MongoDB**: Local MongoDB instance (v6.0+) or MongoDB Atlas cluster
- **AWS Account**: An S3 bucket with IAM access key permissions for `PutObject` and `GetObject`
- **Resend Account**: API key from [Resend](https://resend.com/) for email delivery

### Installation

1. Clone the repository:

   ```bash
   git clone https://github.com/masanthimanshu/hrms-backend.git
   cd hrms-backend
   ```

2. Install project dependencies:
   ```bash
   npm install
   ```

### Environment Configuration

Create a `.env` file in the project root by copying the provided example:

```bash
cp .env.example .env
```

Populate the required environment variables:

| Variable               | Description                                                  | Example                                    |
| :--------------------- | :----------------------------------------------------------- | :----------------------------------------- |
| `PORT`                 | Local port the HTTP server listens on                        | `5500`                                     |
| `DB_URL`               | MongoDB connection URI                                       | `mongodb://user:pass@localhost:27017/hrms` |
| `ACCOUNT_ID`           | Administrative secret key for `/account/*` header validation | `my-secure-account-key`                    |
| `AUTH_TOKEN_SECRET`    | Secret key for signing 2-day JWT access tokens               | `your-auth-secret`                         |
| `REFRESH_TOKEN_SECRET` | Secret key for signing 10-day JWT refresh tokens             | `your-refresh-secret`                      |
| `AWS_KEY`              | AWS IAM Access Key ID                                        | `AKIAIOSFODNN7EXAMPLE`                     |
| `AWS_SECRET`           | AWS IAM Secret Access Key                                    | `wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY` |
| `BUCKET_NAME`          | AWS S3 Bucket Name for media storage                         | `hrms-attendance-bucket`                   |
| `RESEND_API_KEY`       | Resend API authorization key                                 | `re_123456789...`                          |

### Running the Application

- **Production mode**:
  ```bash
  npm start
  ```
- **Development mode** (with auto-restart via nodemon):
  ```bash
  npm run dev
  ```

Upon startup, the console will output:

```text
App Started
Database Connected
```

### Running with Docker

You can run the backend containerized via Docker and Docker Compose:

1. Build and start the container:

   ```bash
   docker compose up -d --build
   ```

2. View container logs:

   ```bash
   docker compose logs -f
   ```

3. Stop the container:
   ```bash
   docker compose down
   ```

---

## API Overview & Quickstart Usage

### Security & Authentication Guards

The API uses two primary authorization mechanisms:

1. **Account Key Guard (`/account/*`)**: Requires the `account` header matching `ACCOUNT_ID` in `.env`.
   ```http
   account: <ACCOUNT_ID>
   ```
2. **Dual JWT Guard (`/secure/*`)**: Requires both `authorization` and `refresh` headers.
   ```http
   authorization: <AUTH_TOKEN>
   refresh: <REFRESH_TOKEN>
   ```

### Endpoint Summary

| Category       | Method | Path                             | Required Headers           | Description                                        |
| :------------- | :----- | :------------------------------- | :------------------------- | :------------------------------------------------- |
| **System**     | `GET`  | `/health`                        | None                       | Root service health check                          |
| **System**     | `GET`  | `/secure/verify`                 | `authorization`, `refresh` | Validates active session token pair                |
| **JWT**        | `GET`  | `/jwt/health`                    | None                       | JWT module health check                            |
| **JWT**        | `GET`  | `/jwt/refresh`                   | `authorization`, `refresh` | Exchanges valid refresh token for a new token pair |
| **Store**      | `GET`  | `/account/store/health`          | `account`                  | Store module health check                          |
| **Store**      | `GET`  | `/account/store/get`             | `account`                  | Lists all registered stores                        |
| **Store**      | `POST` | `/account/store/create`          | `account`                  | Registers a new store location                     |
| **Auth**       | `GET`  | `/account/auth/health`           | `account`                  | Auth module health check                           |
| **Auth**       | `GET`  | `/account/auth/users`            | `account`                  | Lists all employee accounts (omits passwords)      |
| **Auth**       | `POST` | `/account/auth/create`           | `account`                  | Onboards employee and emails generated credentials |
| **Auth**       | `POST` | `/account/auth/login`            | `account`                  | Authenticates user; returns auth & refresh tokens  |
| **Auth**       | `POST` | `/account/auth/validate/:uid`    | `account`                  | Toggles employee verification status (`isValid`)   |
| **Admin**      | `GET`  | `/account/admin/health`          | `account`                  | Admin module health check                          |
| **Admin**      | `POST` | `/account/admin/login`           | `account`                  | Authenticates system administrator                 |
| **Admin**      | `GET`  | `/account/admin/attendance`      | `account`, `authorization` | Retrieves company-wide attendance records          |
| **Admin**      | `GET`  | `/account/admin/attendance/:uid` | `account`, `authorization` | Retrieves attendance history for a single user     |
| **User**       | `GET`  | `/secure/user/health`            | `authorization`, `refresh` | User module health check                           |
| **User**       | `POST` | `/secure/user/distance`          | `authorization`, `refresh` | Calculates distance in meters from assigned store  |
| **Upload**     | `GET`  | `/secure/upload/health`          | `authorization`, `refresh` | Upload module health check                         |
| **Upload**     | `POST` | `/secure/upload/image`           | `authorization`, `refresh` | Generates presigned S3 PUT URL for photo upload    |
| **Attendance** | `GET`  | `/secure/attendance/health`      | `authorization`, `refresh` | Attendance module health check                     |
| **Attendance** | `GET`  | `/secure/attendance/today`       | `authorization`, `refresh` | Returns current user's check-ins for today         |
| **Attendance** | `GET`  | `/secure/attendance/all`         | `authorization`, `refresh` | Returns full attendance history for current user   |
| **Attendance** | `POST` | `/secure/attendance/add`         | `authorization`, `refresh` | Computes store distance and logs attendance        |

### Quickstart Workflow Examples

#### 1. Create a Store Location

```bash
curl -X POST http://localhost:5500/account/store/create \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "name": "Downtown Flagship",
    "address": "123 Market St, San Francisco, CA",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  }'
```

#### 2. Onboard an Employee & Activate Account

Register a new employee linked to the created store (a welcome email with generated credentials will be sent):

```bash
curl -X POST http://localhost:5500/account/auth/create \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "storeId": "<STORE_OBJECT_ID>"
  }'
```

Activate the user account so they can log in:

```bash
curl -X POST http://localhost:5500/account/auth/validate/<USER_OBJECT_ID> \
  -H "account: your-admin-account-id"
```

#### 3. Employee Login

```bash
curl -X POST http://localhost:5500/account/auth/login \
  -H "Content-Type: application/json" \
  -H "account: your-admin-account-id" \
  -d '{
    "email": "jane.doe@example.com",
    "password": "<PASSWORD_FROM_WELCOME_EMAIL>"
  }'
```

_Response returns `authToken` and `refreshToken`._

#### 4. Upload Verification Selfie to AWS S3

Request a presigned upload URL:

```bash
curl -X POST http://localhost:5500/secure/upload/image \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{"text": "Morning Check-In"}'
```

_Response:_

```json
{
  "uploadUrl": "https://hrms-attendance-bucket.s3.ap-south-1.amazonaws.com/images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp?...",
  "key": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp"
}
```

Upload the image directly from the client to S3:

```bash
curl -X PUT "<UPLOAD_URL>" \
  -H "Content-Type: image/webp" \
  --data-binary "@selfie.webp"
```

#### 5. Record Geofenced Attendance

```bash
curl -X POST http://localhost:5500/secure/attendance/add \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{
    "latitude": "37.7750",
    "longitude": "-122.4195",
    "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp"
  }'
```

The server automatically computes distance from the employee's assigned store and saves the check-in record.

---

## Complete API Reference

This section provides explicit specifications, required headers, URL parameters, request payloads, and sample responses for all 24 routes across the application.

### System & Health

#### `GET /health`

- **Description**: Public health check to verify backend service availability.
- **Required Headers**: None
- **Response `200 OK`**:
  ```json
  {
    "message": "Server running"
  }
  ```

#### `GET /secure/verify`

- **Description**: Validates that both the access token and refresh token are active and untampered.
- **Required Headers**:
  - `authorization`: `<AUTH_TOKEN>`
  - `refresh`: `<REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "message": "User is valid"
  }
  ```
- **Error Response `401 Unauthorized`**:
  ```json
  {
    "message": "Token not provided"
  }
  ```
  _(or `{"message": "Invalid token"}`)_

---

### JWT Service

#### `GET /jwt/health`

- **Description**: JWT service module health check.
- **Required Headers**: None
- **Response `200 OK`**:
  ```json
  {
    "status": "JWT Service is running"
  }
  ```

#### `GET /jwt/refresh`

- **Description**: Exchanges a valid refresh token for a newly generated JWT access token (2 days) and refresh token (10 days).
- **Required Headers**:
  - `authorization`: `<AUTH_TOKEN>`
  - `refresh`: `<REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "status": "Success",
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response `200 OK` / `401 Unauthorized`**:
  ```json
  {
    "message": "Invalid refresh token"
  }
  ```

---

### Store Management

> [!NOTE]
> All endpoints under `/account/store/*` require the `account: <ACCOUNT_ID>` header matching the server's configured environment variable.

#### `GET /account/store/health`

- **Description**: Store module health check.
- **Required Headers**: `account: <ACCOUNT_ID>`
- **Response `200 OK`**:
  ```json
  {
    "status": "Store Service is running"
  }
  ```

#### `GET /account/store/get`

- **Description**: Retrieves all registered store locations.
- **Required Headers**: `account: <ACCOUNT_ID>`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "_id": "671df9c8b0e8b8398b1a3e21",
        "name": "Downtown Store",
        "address": "123 Market St, San Francisco, CA",
        "latitude": "37.7749",
        "longitude": "-122.4194",
        "createdAt": "2026-10-27T08:00:00.000Z",
        "updatedAt": "2026-10-27T08:00:00.000Z"
      }
    ]
  }
  ```

#### `POST /account/store/create`

- **Description**: Registers a new physical store location with geographical coordinates.
- **Required Headers**:
  - `account`: `<ACCOUNT_ID>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "name": "Downtown Store",
    "address": "123 Market St, San Francisco, CA",
    "latitude": "37.7749",
    "longitude": "-122.4194"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "Store created successfully"
  }
  ```
- **Error Response `400 Bad Request`**:
  ```json
  {
    "error": "Missing required fields"
  }
  ```

---

### Authentication & User Management

> [!NOTE]
> All endpoints under `/account/auth/*` require the `account: <ACCOUNT_ID>` header.

#### `GET /account/auth/health`

- **Description**: Auth module health check.
- **Required Headers**: `account: <ACCOUNT_ID>`
- **Response `200 OK`**:
  ```json
  {
    "status": "Auth Service is running"
  }
  ```

#### `GET /account/auth/users`

- **Description**: Retrieves all registered user accounts with encrypted passwords omitted.
- **Required Headers**: `account: <ACCOUNT_ID>`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "_id": "671dfa1eb0e8b8398b1a3e25",
        "name": "Jane Doe",
        "email": "jane.doe@example.com",
        "storeId": "671df9c8b0e8b8398b1a3e21",
        "isValid": true,
        "createdAt": "2026-10-27T08:05:00.000Z",
        "updatedAt": "2026-10-27T08:10:00.000Z"
      }
    ]
  }
  ```

#### `POST /account/auth/create`

- **Description**: Onboards a new employee assigned to a store, generates an 8-byte cryptographic random password, hashes it using `bcrypt`, and dispatches a welcome email with credentials via Resend.
- **Required Headers**:
  - `account`: `<ACCOUNT_ID>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "storeId": "671df9c8b0e8b8398b1a3e21"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "User created successfully"
  }
  ```

#### `POST /account/auth/validate/:uid`

- **Description**: Toggles the employee's `isValid` boolean status between `true` and `false`. Only activated users (`isValid: true`) can log in.
- **URL Parameters**:
  - `uid` _(string, required)_: MongoDB ObjectId of the user.
- **Required Headers**: `account: <ACCOUNT_ID>`
- **Response `200 OK`**:
  ```json
  {
    "status": "User validation changed"
  }
  ```
- **Error Response `404 Not Found`**:
  ```json
  {
    "error": "User not found"
  }
  ```

#### `POST /account/auth/login`

- **Description**: Authenticates an employee using email and password. Checks that `isValid` is `true`.
- **Required Headers**:
  - `account`: `<ACCOUNT_ID>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "email": "jane.doe@example.com",
    "password": "temporary-password"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "Success",
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response `401 Unauthorized`**:
  ```json
  {
    "error": "Invalid password"
  }
  ```
  _(or `{"error": "Invalid user"}` if account is not activated)_

---

### Administrative Operations

> [!NOTE]
> All endpoints under `/account/admin/*` require the `account: <ACCOUNT_ID>` header. Querying attendance records additionally requires an admin JWT `authorization` header.

#### `GET /account/admin/health`

- **Description**: Admin module health check.
- **Required Headers**: `account: <ACCOUNT_ID>`
- **Response `200 OK`**:
  ```json
  {
    "status": "Admin Service is running"
  }
  ```

#### `POST /account/admin/login`

- **Description**: Authenticates portal administrator credentials and issues an administrative JWT pair (`user: "admin"`).
- **Required Headers**:
  - `account`: `<ACCOUNT_ID>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "user": "hrms@scoobies.co.in",
    "pass": "#admin@1234#"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "Success",
    "authToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
  ```
- **Error Response `401 Unauthorized`**:
  ```json
  {
    "message": "Invalid password"
  }
  ```
  _(or `{"message": "Invalid username"}`)_

#### `GET /account/admin/attendance`

- **Description**: Retrieves all attendance check-ins across the entire company.
- **Required Headers**:
  - `account`: `<ACCOUNT_ID>`
  - `authorization`: `<ADMIN_AUTH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "_id": "671dfb34b0e8b8398b1a3e30",
        "userId": "671dfa1eb0e8b8398b1a3e25",
        "latitude": "37.7750",
        "longitude": "-122.4195",
        "distance": "12",
        "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp",
        "createdAt": "2026-10-29T08:15:00.000Z",
        "updatedAt": "2026-10-29T08:15:00.000Z"
      }
    ]
  }
  ```
- **Error Response `401 Unauthorized`**:
  ```json
  {
    "message": "Invalid token"
  }
  ```

#### `GET /account/admin/attendance/:uid`

- **Description**: Retrieves all attendance records for a single employee specified by user ID.
- **URL Parameters**:
  - `uid` _(string, required)_: MongoDB ObjectId of target user.
- **Required Headers**:
  - `account`: `<ACCOUNT_ID>`
  - `authorization`: `<ADMIN_AUTH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "_id": "671dfb34b0e8b8398b1a3e30",
        "userId": "671dfa1eb0e8b8398b1a3e25",
        "latitude": "37.7750",
        "longitude": "-122.4195",
        "distance": "12",
        "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp",
        "createdAt": "2026-10-29T08:15:00.000Z",
        "updatedAt": "2026-10-29T08:15:00.000Z"
      }
    ]
  }
  ```

---

### User Location Services

> [!NOTE]
> All endpoints under `/secure/user/*` require valid `authorization: <AUTH_TOKEN>` and `refresh: <REFRESH_TOKEN>` headers.

#### `GET /secure/user/health`

- **Description**: User service health check.
- **Required Headers**: `authorization: <AUTH_TOKEN>`, `refresh: <REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "status": "User Service is running"
  }
  ```

#### `POST /secure/user/distance`

- **Description**: Computes the Haversine distance in meters between provided coordinates and the user's assigned store location.
- **Required Headers**:
  - `authorization`: `<AUTH_TOKEN>`
  - `refresh`: `<REFRESH_TOKEN>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "latitude": "37.7750",
    "longitude": "-122.4195"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "distance": 12
  }
  ```

---

### Media Upload Pipeline

> [!NOTE]
> All endpoints under `/secure/upload/*` require valid `authorization: <AUTH_TOKEN>` and `refresh: <REFRESH_TOKEN>` headers.

#### `GET /secure/upload/health`

- **Description**: Upload service health check.
- **Required Headers**: `authorization: <AUTH_TOKEN>`, `refresh: <REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "status": "Upload Service is running"
  }
  ```

#### `POST /secure/upload/image`

- **Description**: Creates an S3 presigned `PUT` URL (expires in 300 seconds) for direct client-to-S3 WebP image uploads.
- **Required Headers**:
  - `authorization`: `<AUTH_TOKEN>`
  - `refresh`: `<REFRESH_TOKEN>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "text": "Morning Shift Selfie"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "uploadUrl": "https://hrms-attendance-bucket.s3.ap-south-1.amazonaws.com/images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp?X-Amz-...",
    "key": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp"
  }
  ```

---

### Attendance Tracking

> [!NOTE]
> All endpoints under `/secure/attendance/*` require valid `authorization: <AUTH_TOKEN>` and `refresh: <REFRESH_TOKEN>` headers.

#### `GET /secure/attendance/health`

- **Description**: Attendance service health check.
- **Required Headers**: `authorization: <AUTH_TOKEN>`, `refresh: <REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "status": "Attendance Service is running"
  }
  ```

#### `GET /secure/attendance/today`

- **Description**: Retrieves attendance records submitted by the authenticated user during the current day (`00:00:00` to `23:59:59.999`).
- **Required Headers**: `authorization: <AUTH_TOKEN>`, `refresh: <REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "_id": "671dfb34b0e8b8398b1a3e30",
        "userId": "671dfa1eb0e8b8398b1a3e25",
        "latitude": "37.7750",
        "longitude": "-122.4195",
        "distance": "12",
        "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp",
        "createdAt": "2026-10-29T08:15:00.000Z",
        "updatedAt": "2026-10-29T08:15:00.000Z"
      }
    ]
  }
  ```

#### `GET /secure/attendance/all`

- **Description**: Retrieves the authenticated user's complete historical attendance log.
- **Required Headers**: `authorization: <AUTH_TOKEN>`, `refresh: <REFRESH_TOKEN>`
- **Response `200 OK`**:
  ```json
  {
    "data": [
      {
        "_id": "671dfb34b0e8b8398b1a3e30",
        "userId": "671dfa1eb0e8b8398b1a3e25",
        "latitude": "37.7750",
        "longitude": "-122.4195",
        "distance": "12",
        "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp",
        "createdAt": "2026-10-29T08:15:00.000Z",
        "updatedAt": "2026-10-29T08:15:00.000Z"
      }
    ]
  }
  ```

#### `POST /secure/attendance/add`

- **Description**: Verifies user coordinates against assigned store coordinates, calculates Haversine distance, and records attendance check-in.
- **Required Headers**:
  - `authorization`: `<AUTH_TOKEN>`
  - `refresh`: `<REFRESH_TOKEN>`
  - `Content-Type`: `application/json`
- **Request Body**:
  ```json
  {
    "latitude": "37.7750",
    "longitude": "-122.4195",
    "imageUrl": "images/4a7e9b0e-6f91-4c17-a9a3-5c26b91c1072.webp"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "status": "Attendance added successfully"
  }
  ```
- **Error Response `404 Not Found`**:
  ```json
  {
    "error": "Store not found"
  }
  ```
  _(or `{"error": "User not found"}`)_

---

## Where Users Can Get Help

- **Issues & Bug Reports**: Submit tickets via [GitHub Issues](https://github.com/masanthimanshu/hrms-backend/issues).
- **Discussions & Feedback**: Join discussions via [GitHub Discussions](https://github.com/masanthimanshu/hrms-backend/discussions).
- **Codebase References**:
  - Routing logic: [`routes/`](routes/)
  - Database schemas: [`database/`](database/)
  - Authentication & tokens: [`utils/`](utils/)
  - AWS S3 integration: [`aws/`](aws/)

---

## Who Maintains and Contributes

### Maintainer

Maintained by **[Himanshu Masant](https://github.com/masanthimanshu)**.

### Contributing

Contributions are welcome! To get started:

1. Fork the repository.
2. Create a descriptive feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. Run linting to ensure compliance with codebase formatting rules:
   ```bash
   npx eslint .
   ```
4. Commit your changes following conventional commit syntax:
   ```bash
   git commit -m "feat: add support for dynamic geofence thresholding"
   ```
5. Push to your branch and open a Pull Request against `main`.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC). See [package.json](package.json) for details.
