# Snake Game

[![CI and Deploy](https://github.com/jaimita-bansal/snake-game/actions/workflows/ci-cd.yml/badge.svg)](https://github.com/jaimita-bansal/snake-game/actions/workflows/ci-cd.yml)

Small browser Snake game built with plain HTML/CSS/JavaScript.

## Features

- Play/Pause/Restart controls
- Score tracking
- 5 auto difficulty levels (speed + obstacles)
- Toggleable shadow trail mode
- Unit tests for core game logic (Vitest)
- CI + GitHub Pages deployment pipeline

## Run locally

1. Open `index.html` directly in the browser, or
2. Serve as static files with any local server.

For tests:

```bash
npm ci
npm test
```

## Deployment

Deployment is handled by GitHub Actions (`.github/workflows/ci-cd.yml`) and documented in `DEPLOYMENT.md`.

## Badge setup note

Replace `<your-username>` and `<your-repo>` in the badge URL once the project is pushed to GitHub.
