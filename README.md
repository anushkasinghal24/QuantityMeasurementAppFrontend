# QuantityMeasurementAppFrontend

## Google Sign-In setup (OAuth 2.0)

1. Create a Google OAuth Client ID (Web) in Google Cloud Console.
2. Add your local dev origin to **Authorized JavaScript origins**:
   - `http://localhost:4200`
3. Put the Client ID into:
   - `src/environments/environment.ts` (`googleOAuthClientId`)

## Run

- Install deps: `npm.cmd i`
- Start dev server: `npm.cmd start`
