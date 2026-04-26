# Deployment Pipeline

This project is configured with GitHub Actions in `.github/workflows/ci-cd.yml`.

## What it does

- Runs tests on every pull request.
- Runs tests on every push to `main`.
- If tests pass on `main`, deploys the static site to GitHub Pages.

## One-time repo setup

1. Push this project to GitHub.
2. In GitHub, open `Settings` -> `Pages`.
3. Under **Build and deployment**, set **Source** to **GitHub Actions**.
4. Ensure your default branch is `main` (or update the workflow branch filter if different).

## Deployment files

The workflow publishes these files:

- `index.html`
- `style.css`
- `script.js`
- `gameLogic.js`

## Local checks before pushing

Run:

```bash
npm ci
npm test
```
