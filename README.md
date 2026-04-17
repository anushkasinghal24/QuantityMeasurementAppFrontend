# QMA Angular — Quantity Measurement App

Angular 17 conversion of the React QMA frontend.

## Setup & Run

```bash
npm install
ng serve
```

App runs at **http://localhost:4200**

## Environment Configuration

Edit `src/environments/environment.ts` (dev) or `environment.prod.ts` (prod):

```ts
export const environment = {
  production: false,
  baseUrl: 'http://localhost:8080',        // Spring Boot API Gateway
  authServiceUrl: 'http://localhost:8081'  // Auth Service (for Google OAuth)
};
```

All API calls use `${environment.baseUrl}/api/...`

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── layout/          # AppLayout, ToastContainer
│   │   └── dashboard/       # ConverterWidget, ArithmeticWidget, RecentHistory, StatsCards
│   ├── guards/              # authGuard, publicOnlyGuard
│   ├── models/              # TypeScript interfaces + unit definitions
│   ├── pages/               # Landing, Login, Register, Dashboard, History, Profile, NotFound, OAuthCallback
│   └── services/            # AuthService, ApiService, ToastService
└── environments/
    ├── environment.ts       # Development
    └── environment.prod.ts  # Production
```

## Build for Production

```bash
ng build --configuration production
```
