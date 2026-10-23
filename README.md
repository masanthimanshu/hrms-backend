# HRMS Backend

[![Node.js Version](https://img.shields.io/badge/Node.js-v24+-339933?style=flat-square&logo=nodedotjs&logoColor=white)](https://nodejs.org/)
[![Express](https://img.shields.io/badge/Express-5.x-000000?style=flat-square&logo=express&logoColor=white)](https://expressjs.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose-47A248?style=flat-square&logo=mongodb&logoColor=white)](https://mongoosejs.com/)
[![AWS S3](https://img.shields.io/badge/AWS-S3%20Presigned-FF9900?style=flat-square&logo=amazons3&logoColor=white)](https://aws.amazon.com/s3/)
[![License: ISC](https://img.shields.io/badge/License-ISC-blue.svg?style=flat-square)](https://opensource.org/licenses/ISC)
[![Docker Ready](https://img.shields.io/badge/Docker-Ready-2496ED?style=flat-square&logo=docker&logoColor=white)](./Dockerfile)

A modular, cloud-ready RESTful backend service for Human Resource Management Systems (HRMS). It delivers employee onboarding, multi-store location management, dual-token JWT authentication, AWS S3 presigned asset uploads, and geofenced attendance verification with automated distance calculation.

---

## Table of Contents

- [What the Project Does](#what-the-project-does)
- [Why the Project Is Useful](#why-the-project-is-useful)
- [System Architecture](#system-architecture)
  - [Directory Structure](#directory-structure)
  - [Data Model](#data-model)
- [How Users Can Get Started](#how-users-can-get-started)
  - [Prerequisites](#prerequisites)
  - [Installation & Setup](#installation--setup)
  - [Environment Configuration](#environment-configuration)
  - [Running the Application](#running-the-application)
  - [Running with Docker](#running-with-docker)
- [API Overview & Usage](#api-overview--usage)
  - [Security Headers](#security-headers)
  - [Endpoints Summary](#endpoints-summary)
  - [Quick Usage Workflow](#quick-usage-workflow)
- [Where Users Can Get Help](#where-users-can-get-help)
- [Who Maintains & Contributes](#who-maintains--contributes)
- [License](#license)

---

## What the Project Does

The **HRMS Backend** serves as the core API engine for enterprise workforce operations. It enables organizations to:

- **Manage Store Locations:** Register physical store and office premises with precise GPS coordinates.
- **Administer User & Staff Accounts:** Securely register employees, assign them to designated store locations, and manage access credentials.
- **Geofence Attendance Verification:** Record employee clock-in events with real-time GPS coordinates, automatically calculating geographic distance against the assigned store location to confirm physical presence.
- **Handle Direct-to-Cloud Uploads:** Generate short-lived presigned AWS S3 URLs for uploading employee verification selfies and attendance assets directly from the client without routing heavy binary payloads through the application server.
- **Secure API Traffic:** Protect administrative operations with account ID validation and secure employee endpoints with dual-token JWT authentication (access & refresh tokens).

---

## Why the Project Is Useful

- **Accurate Geofenced Attendance:** Leverages [`geolib`](https://github.com/manuelbieh/geolib) to compute the exact distance (in meters) between employee coordinates and assigned store locations, preventing proxy attendance and check-in fraud.
- **Optimized Asset Pipeline:** Generates temporary presigned S3 upload URLs (`@aws-sdk/s3-request-presigner`), eliminating server bandwidth bottlenecks during shift-change rush hours.
- **Dual-Token Authentication Lifecycle:** Employs short-lived authorization tokens (2-day validity) and long-lived refresh tokens (10-day validity) with a dedicated refresh endpoint to ensure high security and seamless session renewals.
- **Strict Payload Validation:** Uses [`zod`](https://zod.dev/) schemas to enforce strict input validation across all write endpoints, rejecting malformed requests before processing.
- **Lightweight & Container Ready:** Built on Node.js ES Modules with Express 5 and comes with a production-ready multi-stage [Dockerfile](./Dockerfile).

---

## System Architecture

### Directory Structure

```plaintext
hrms-backend/
├── app.js                   # Application entry point, middleware & route mounting
├── package.json             # Dependencies and npm scripts
├── Dockerfile               # Node 24 container definition
├── .env.example             # Template for required environment variables
├── aws/
│   └── s3_client.js         # AWS S3 presigned URL generation and client utilities
├── database/
│   ├── user_model.js        # User schema (credentials, store relationship)
│   ├── store_model.js       # Store schema (GPS coordinates, address)
│   └── attendance_model.js  # Attendance schema (coordinates, distance, image)
├── routes/
│   ├── export.js            # Centralized router exports
│   ├── auth/                # User registration, login, and query endpoints
│   ├── store/               # Store registration and retrieval endpoints
│   ├── attendance/          # Geofenced check-in and attendance history
│   ├── upload/              # Presigned S3 image upload endpoint
│   └── jwt/                 # Token refresh and verification endpoints
└── utils/
    ├── middleware.js        # Header-based auth & account verification middlewares
    └── tokens.js            # JWT signing, decoding, and verification helpers
```

### Data Model

```mermaid
erDiagram
    STORE ||--o{ USER : "employs"
    USER ||--o{ ATTENDANCE : "submits"

    STORE {
        ObjectId _id PK
        string name
        string address
        string latitude
        string longitude
        datetime createdAt
        datetime updatedAt
    }

    USER {
        ObjectId _id PK
        ObjectId storeId FK
        string name
        string email
        string password
        boolean isValid
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

Ensure you have the following installed and configured before running the service:

- [Node.js](https://nodejs.org/) (v20 or higher; v24 recommended)
- [npm](https://www.npmjs.com/) (v10 or higher)
- [MongoDB](https://www.mongodb.com/) (v6+ running locally or a hosted Atlas URI)
- [AWS Account](https://aws.amazon.com/) with an active S3 bucket and configured IAM credentials (`~/.aws/credentials`)

### Installation & Setup

1. **Clone the repository:**

   ```bash
   git clone https://github.com/masanthimanshu/hrms-backend.git
   cd hrms-backend
   ```

2. **Install project dependencies:**

   ```bash
   npm install
   ```

3. **Configure Environment Variables:**

   Copy the sample environment file to create your local `.env`:

   ```bash
   cp .env.example .env
   ```

### Environment Configuration

Configure the `.env` file with your specific credentials:

| Variable               | Required | Description                                                          | Example                                    |
| :--------------------- | :------: | :------------------------------------------------------------------- | :----------------------------------------- |
| `PORT`                 |   Yes    | HTTP port on which the Express server listens                        | `5500`                                     |
| `DB_URL`               |   Yes    | MongoDB connection URI (`authSource=admin` appended automatically)   | `mongodb://root:pass@localhost:27017/hrms` |
| `ACCOUNT_ID`           |   Yes    | Secret master identifier used for administrative `/account/*` routes | `your-secure-account-key`                  |
| `AUTH_TOKEN_SECRET`    |   Yes    | Secret key used to sign and verify short-lived JWT access tokens     | `your-auth-secret`                         |
| `REFRESH_TOKEN_SECRET` |   Yes    | Secret key used to sign and verify long-lived JWT refresh tokens     | `your-refresh-secret`                      |
| `BUCKET_NAME`          |   Yes    | AWS S3 bucket name designated for attendance selfie/asset uploads    | `hrms-attendance-assets`                   |

> [!NOTE]
> AWS SDK credentials are loaded via the default AWS credential provider chain or your named AWS profile (`scoobies` by default in `aws/s3_client.js`). Ensure standard AWS credentials (`AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, and `AWS_REGION`) are set in your environment if not using named local profiles.

### Running the Application

- **Development mode (with auto-reload via `nodemon`):**

  ```bash
  npm run dev
  ```

- **Production mode:**

  ```bash
  npm start
  ```

Once running, verify connectivity with the public health check endpoint:

```bash
curl http://localhost:5500/health
# Response: {"message":"Server running"}
```

### Running with Docker

Build and run the application inside a container:

1. **Build the Docker image:**

   ```bash
   docker build -t hrms-backend .
   ```

2. **Run the container:**

   ```bash
   docker run -d \
     --name hrms-backend-service \
     -p 5500:5500 \
     --env-file .env \
     hrms-backend
   ```

---

## API Overview & Usage

### Security Headers

The API implements two middleware gates:

1. **Account Gate (`/account/*`):** Requires the `account` header matching `ACCOUNT_ID`.
   ```http
   account: <ACCOUNT_ID>
   ```
2. **Secure Gate (`/secure/*`):** Requires valid JWT authorization and refresh tokens in request headers.
   ```http
   authorization: <authToken>
   refresh: <refreshToken>
   ```

### Endpoints Summary

| Method | Endpoint                    | Protection | Description                                                            |
| :----- | :-------------------------- | :--------: | :--------------------------------------------------------------------- |
| `GET`  | `/health`                   |   Public   | Overall API service health check                                       |
| `GET`  | `/jwt/health`               |   Public   | JWT service health check                                               |
| `GET`  | `/jwt/refresh`              |   Tokens   | Rotates and issues new `authToken` & `refreshToken`                    |
| `GET`  | `/account/auth/health`      |  Account   | Auth service health check                                              |
| `POST` | `/account/auth/create`      |  Account   | Registers a new employee assigned to a `storeId`                       |
| `POST` | `/account/auth/login`       |  Account   | Authenticates employee credentials and returns JWT tokens              |
| `GET`  | `/account/auth/users`       |  Account   | Retrieves a list of all registered users (excluding password hashes)   |
| `GET`  | `/account/store/health`     |  Account   | Store service health check                                             |
| `POST` | `/account/store/create`     |  Account   | Creates a new physical store location with GPS coordinates             |
| `GET`  | `/account/store/get`        |  Account   | Retrieves all configured store locations                               |
| `GET`  | `/secure/verify`            |   Secure   | Validates that current session tokens are active                       |
| `GET`  | `/secure/upload/health`     |   Secure   | Upload service health check                                            |
| `POST` | `/secure/upload/image`      |   Secure   | Requests a signed AWS S3 `uploadUrl` and key for image uploads         |
| `GET`  | `/secure/attendance/health` |   Secure   | Attendance service health check                                        |
| `POST` | `/secure/attendance/add`    |   Secure   | Submits employee check-in, calculates store distance, and saves record |
| `GET`  | `/secure/attendance/today`  |   Secure   | Fetches attendance logs recorded today for the authenticated user      |
| `GET`  | `/secure/attendance/all`    |   Secure   | Fetches all historical attendance records for the authenticated user   |

### Quick Usage Workflow

#### 1. Create a Store Location

```bash
curl -X POST http://localhost:5500/account/store/create \
  -H "Content-Type: application/json" \
  -H "account: <ACCOUNT_ID>" \
  -d '{
    "name": "Central Plaza Flagship",
    "address": "123 Market Street, Suite 400",
    "latitude": "28.6139",
    "longitude": "77.2090"
  }'
```

#### 2. Register an Employee

```bash
curl -X POST http://localhost:5500/account/auth/create \
  -H "Content-Type: application/json" \
  -H "account: <ACCOUNT_ID>" \
  -d '{
    "name": "Jane Doe",
    "email": "jane.doe@example.com",
    "password": "StrongPassword123!",
    "storeId": "<STORE_OBJECT_ID>"
  }'
```

#### 3. Employee Login

```bash
curl -X POST http://localhost:5500/account/auth/login \
  -H "Content-Type: application/json" \
  -H "account: <ACCOUNT_ID>" \
  -d '{
    "email": "jane.doe@example.com",
    "password": "StrongPassword123!"
  }'
```

Response:

```json
{
  "status": "Success",
  "authToken": "eyJhbGciOi...",
  "refreshToken": "eyJhbGciOi..."
}
```

#### 4. Request S3 Image Upload URL

```bash
curl -X POST http://localhost:5500/secure/upload/image \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{
    "text": "Check-in selfie metadata"
  }'
```

Upload the image directly to S3 via HTTP `PUT` using the returned `uploadUrl`:

```bash
curl -X PUT "<UPLOAD_URL>" \
  -H "Content-Type: image/webp" \
  --data-binary "@selfie.webp"
```

#### 5. Submit Attendance Check-In

```bash
curl -X POST http://localhost:5500/secure/attendance/add \
  -H "Content-Type: application/json" \
  -H "authorization: <AUTH_TOKEN>" \
  -H "refresh: <REFRESH_TOKEN>" \
  -d '{
    "latitude": "28.6140",
    "longitude": "77.2092",
    "imageUrl": "images/uuid-key.webp"
  }'
```

The system automatically resolves the employee's assigned store coordinates, calculates the distance (in meters) using the Haversine formula via `geolib`, and records the attendance entry.

---

## Where Users Can Get Help

- **Issue Tracker:** Report bugs, request enhancements, or ask questions via [GitHub Issues](https://github.com/masanthimanshu/hrms-backend/issues).
- **Discussions & Support:** Open a topic under GitHub Discussions or contact the project maintainers.
- **Documentation:** Review inline code comments and controller definitions across the [`routes/`](./routes/) and [`utils/`](./utils/) modules.

---

## Who Maintains & Contributes

### Maintainer

Developed and maintained by [Himanshu Masant](https://github.com/masanthimanshu) and project contributors.

### Contributing

Contributions, bug reports, and pull requests are welcome! To contribute:

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/amazing-feature`.
3. Commit your changes following clean commit guidelines: `git commit -m 'feat: add amazing feature'`.
4. Ensure code formatting and linting pass (`npx eslint .`).
5. Push to the branch: `git push origin feature/amazing-feature`.
6. Open a Pull Request detailing your changes.

---

## License

This project is licensed under the [ISC License](https://opensource.org/licenses/ISC). See the `package.json` file for details.
