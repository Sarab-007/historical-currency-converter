---
title: Historical Currency Converter API
sdk: docker
app_port: 7860
---

# Historical Currency Converter

Production-style assessment project built with Angular 19, Angular Material, and NestJS.

The frontend never calls FreeCurrencyAPI directly. All provider traffic goes through the NestJS backend so the API key stays server-side.

## Tech Stack

- Angular 19 standalone components
- Angular Material
- Signals for UI state
- NestJS 11
- FreeCurrencyAPI
- localStorage persistence for conversion history

## Architecture

```text
apps/
  api/
    src/
      currency/
        dto/
        interfaces/
        currency.controller.ts
        currency.service.ts
        currency.module.ts
      app.module.ts
      main.ts
  web/
    src/app/
      core/
        interceptors/
        models/
        services/
      features/converter/
      shared/
        directives/
        ui/
```

### Backend

- `GET /api/health`
- `GET /api/currency/currencies`
- `POST /api/currency/convert`

The backend validates DTOs globally, normalizes FreeCurrencyAPI responses, rejects future dates, handles provider failures with clear HTTP errors, and reads secrets from environment variables.

### Frontend

The Angular app uses a feature-based structure, standalone Material components, typed services, a reusable status component, a reusable loading skeleton, and a small custom directive for amount-input ergonomics. Conversion history is versioned and persisted in localStorage.

## Local Setup

Install dependencies:

```bash
npm --prefix apps/api install
npm --prefix apps/web install
```

Create backend environment config:

```bash
cp apps/api/.env.example apps/api/.env
```

Set:

```bash
FREECURRENCY_API_KEY=your_key
FREECURRENCY_API_URL=https://api.freecurrencyapi.com/v1
CORS_ORIGIN=http://localhost:4200
PORT=3000
```

Run the backend:

```bash
npm run start:api
```

Run the frontend:

```bash
npm run start:web
```

Open:

```text
http://localhost:4200
```

## Verification

```bash
npm run build
npm run test:api
npm run test:e2e
```

## Deployment

### Backend on Render

Use `render.yaml` or configure manually:

- Root directory: `apps/api`
- Build command: `npm ci && npm run build`
- Start command: `npm run start:prod`
- Environment variables:
  - `FREECURRENCY_API_KEY`
  - `FREECURRENCY_API_URL=https://api.freecurrencyapi.com/v1`
  - `CORS_ORIGIN=https://your-frontend-domain`

### Frontend on Netlify

`netlify.toml` is included:

- Base: `apps/web`
- Build: `npm ci && npm run build`
- Publish: `dist/currency-converter-web/browser`

Before production build, set `apps/web/src/environments/environment.production.ts` to your deployed backend URL:

```ts
export const environment = {
  apiUrl: 'https://your-render-backend-url.onrender.com/api',
  production: true,
} as const;
```

### Frontend on Vercel

`vercel.json` is included with the Angular output directory and SPA rewrite.

## Security Notes

- The FreeCurrencyAPI key is only read by NestJS.
- `.env` files are ignored by Git.
- Angular only talks to the backend API.
- Provider quota or subscription failures are surfaced as readable UI errors.
