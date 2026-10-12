# Contributing to HRMS Backend

Thank you for your interest in contributing to **HRMS Backend**! We welcome contributions from the community to help improve features, fix bugs, and refine documentation.

## Code of Conduct

Please be respectful, collaborative, and considerate of others when interacting with this repository and community.

## How to Contribute

### 1. Reporting Bugs & Suggesting Features

- Check existing issues to see if the problem or feature request has already been reported.
- If not, create a new issue with a clear description, reproduction steps, and relevant log outputs.

### 2. Development Workflow

1. **Fork the Repository**: Create your personal fork on GitHub.
2. **Clone Locally**:
   ```bash
   git clone https://github.com/<your-username>/hrms-backend.git
   cd hrms-backend
   ```
3. **Install Dependencies**:
   ```bash
   npm install
   ```
4. **Create a Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   # or
   git checkout -b fix/your-bugfix-name
   ```
5. **Configure Environment**:
   ```bash
   cp .env.example .env
   ```
   Set up your local MongoDB instance and environment keys.
6. **Start the Dev Server**:
   ```bash
   npm run dev
   ```

### 3. Code Style & Quality

- Ensure your code follows the existing ESLint configuration:
  ```bash
  npx eslint .
  ```
- Format your code using Prettier:
  ```bash
  npx prettier --write .
  ```
- Write clean, modular ES module code adhering to the architecture.

### 4. Submitting a Pull Request

1. Commit your changes with concise and descriptive commit messages following Conventional Commits (e.g., `feat: add attendance check-in controller`, `fix: token expiry validation`).
2. Push your branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```
3. Open a Pull Request against the `main` branch of `hrms-backend`.
4. Provide a detailed description of your changes and reference any related issues.
