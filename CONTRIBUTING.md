# Contributing to HRMS Backend

Thank you for your interest in contributing to HRMS Backend! We welcome community contributions, bug reports, and feature proposals.

---

## Development Workflow

### 1. Fork & Clone
- Fork the repository on GitHub.
- Clone your fork locally:
  ```bash
  git clone https://github.com/<your-username>/hrms-backend.git
  cd hrms-backend
  ```

### 2. Branching Strategy
Create a dedicated topic branch with a descriptive name:
```bash
git checkout -b feat/dynamic-geofence
# or
git checkout -b fix/token-refresh-expiry
```

### 3. Install Dependencies & Setup Environment
- Ensure you have Node.js 24+ installed.
- Install dependencies:
  ```bash
  npm install
  ```
- Copy `.env.example` to `.env` and configure your local MongoDB and service credentials:
  ```bash
  cp .env.example .env
  ```

### 4. Running Locally
Start the development server with live reload:
```bash
npm run dev
```

---

## Code Quality & Standards

### Linting
We use ESLint to maintain consistent code quality across ES modules. Before opening a pull request, run:
```bash
npx eslint .
```
Fix any reported errors or warnings before committing.

### Code Style Guidelines
- **Modularity**: Place routes in `routes/<module>/<module>_routes.js` and business controllers in `routes/<module>/<module>_controller.js`.
- **Validation**: Always validate incoming request payloads with Zod schemas.
- **Error Handling**: Gracefully catch runtime errors and return consistent status codes and error JSON payloads.
- **Security**: Never commit secrets, credentials, or actual `.env` files into source control.

---

## Commit Guidelines

Follow the [Conventional Commits](https://www.conventionalcommits.org/) convention:

```
<type>(<scope>): <short summary>

[optional body]

[optional footer(s)]
```

Common types:
- `feat`: A new feature or capability
- `fix`: A bug fix
- `docs`: Documentation updates
- `refactor`: Code changes that neither fix a bug nor add a feature
- `perf`: Performance optimizations
- `chore`: Build tasks, dependency updates, configuration changes

Example:
```bash
git commit -m "feat(attendance): add configurable geofence radius validation"
```

---

## Submitting Pull Requests

1. Push your branch to your remote fork:
   ```bash
   git push origin feat/dynamic-geofence
   ```
2. Open a Pull Request against the `main` branch of `masanthimanshu/hrms-backend`.
3. Provide a clear PR title and summary describing the problem solved and changes made.
4. Respond to any code review feedback promptly.

