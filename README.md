# Quantity Measurement App — Frontend

> A responsive unit conversion dashboard (compare, convert, arithmetic) built with **HTML/CSS/JavaScript** and **Bootstrap 5**, including a lightweight **login/signup demo** backed by `localStorage`.

## Table of Contents

- [Project Title](#project-title)
- [Project Description](#project-description)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Branches](#branches)
- [Project Structure](#project-structure)
- [Installation & Setup Instructions](#installation--setup-instructions)
- [Usage Instructions](#usage-instructions)
- [API Endpoints](#api-endpoints)
- [Screenshots / Demo](#screenshots--demo)
- [Progress Tracker](#progress-tracker)
- [Development Timeline](#development-timeline)
- [Challenges Faced](#challenges-faced)
- [Learnings](#learnings)
- [Future Enhancements](#future-enhancements)
- [Contributing Guidelines](#contributing-guidelines)
- [License](#license)

## Project Title

**Quantity Measurement App — Frontend**

## Project Description

This project is a **frontend-only** unit measurement utility that lets users **compare units**, **convert values**, and perform **basic arithmetic** on measurements across multiple categories (Length, Weight, Temperature, Volume, Area, Time, Speed).  
It also includes a simple **authentication demo** (signup/login/logout) using browser storage to simulate user sessions.

> Placeholder note: If you plan to connect a real backend (auth + persistence), see [API Endpoints](#api-endpoints) for a suggested contract.

## Features

- ✨ Convert units across multiple categories (Length, Weight, Temperature, Volume, Area, Time, Speed)
- 🧮 Compare values and run arithmetic (+, −, ×, ÷) with validation
- 🔁 Swap conversion units for faster workflows
- 👤 Signup/Login demo with session persistence (`localStorage` / `sessionStorage`)
- 🌓 Theme toggle (Light/Dark)
- 📱 Responsive UI using Bootstrap 5 and Bootstrap Icons

## Tech Stack

| Layer | Technology |
| --- | --- |
| Frontend | HTML5, CSS3, JavaScript (ES6), Bootstrap 5, Bootstrap Icons |
| Backend | Not implemented (frontend-only demo). _Planned_: Node.js/Express (or any REST backend) |
| Database | Not implemented. _Current_: `localStorage` / `sessionStorage` for demo. _Planned_: PostgreSQL / MongoDB |
| Tools | Git, GitHub, VS Code (recommended), Live Server (recommended) |

## Branches

The repository currently uses the following branches:

| Branch | Last Commit (IST) | Commit | Author | Summary | Notes |
| --- | --- | --- | --- | --- | --- |
| `main` | 2026-03-25 | `8e5d2d4` | anushkasinghal24 | Added first commit | Baseline/docs (UI not merged yet) |
| `dev` | 2026-03-25 | `8e5d2d4` | anushkasinghal24 | Added first commit | Currently mirrors `main` |
| `feature/QMA-HTML-CSS-JS` | 2026-03-28 | `e5c7dbb` | anushkasinghal24 | Added quantity measurement frontend | Active UI implementation |

> Tip: To run the UI locally, checkout `feature/QMA-HTML-CSS-JS` (see setup steps below).

## Project Structure

> Note: The structure below reflects the working UI available in `feature/QMA-HTML-CSS-JS`.

```text
QuantityMeasurementAppFrontend/
├─ frontend/
│  ├─ index.html        # Dashboard (convert/compare/arithmetic)
│  ├─ login.html        # Login page (fallback/alternative)
│  ├─ signup.html       # Signup page (fallback/alternative)
│  ├─ style.css         # UI styling + theming tokens
│  ├─ script.js         # App logic (routing, conversion, validation, UI events)
│  ├─ shared.js         # Theme + storage helpers (auth/session)
│  └─ favicon.svg       # App icon
└─ README.md
```

## Installation & Setup Instructions

### 1) Clone the repository

```bash
git clone https://github.com/anushkasinghal24/QuantityMeasurementAppFrontend.git
cd QuantityMeasurementAppFrontend
```

### 2) Checkout the working UI branch

```bash
git checkout feature/QMA-HTML-CSS-JS
```

### 3) Run locally (recommended: local server)

Option A — VS Code Live Server:
1. Open the project in VS Code
2. Open `frontend/index.html`
3. Click **Go Live**

Option B — Python HTTP server:

```bash
cd frontend
python -m http.server 5500
```

Then open `http://localhost:5500` in your browser.

## Usage Instructions

1. Open the app (see setup above).
2. Create an account via **Sign up**.
3. Login using your credentials.
4. In the dashboard:
   - Choose a measurement type (e.g., Length, Weight, Temperature).
   - Choose an action: **Convert**, **Compare**, or **Arithmetic**.
   - Enter values and select units.
   - Use **Swap** (where applicable) to quickly invert conversion direction.
5. Use **Theme** to toggle Light/Dark mode.

## API Endpoints

This project currently runs without a backend (no network calls).  
If you integrate an API later, here is a suggested contract:

| Method | Endpoint | Description | Request Body (example) | Response (example) |
| --- | --- | --- | --- | --- |
| `POST` | `/api/auth/signup` | Create user account | `{ "name": "Jane", "email": "jane@x.com", "password": "******" }` | `{ "id": "u1", "name": "Jane" }` |
| `POST` | `/api/auth/login` | Login + return session/JWT | `{ "email": "jane@x.com", "password": "******" }` | `{ "token": "..." }` |
| `POST` | `/api/auth/logout` | Invalidate session (optional) | `—` | `204 No Content` |
| `GET` | `/api/profile` | Get current user profile | `—` | `{ "id": "u1", "name": "Jane" }` |

## Screenshots / Demo

- Screenshots: _Coming soon_ (add images under `docs/screenshots/` and link them here)
- Demo: _Coming soon_ (GitHub Pages / Netlify / Vercel)

## Progress Tracker

| Date (YYYY-MM-DD) | Day | Task Completed | Description | Status |
| --- | --- | --- | --- | --- |
| 2026-03-25 | Wednesday | Repository initialized | Created repo and initial documentation baseline. | ✅ Done |
| 2026-03-28 | Saturday | Frontend UI implemented | Added HTML/CSS/JS frontend for unit conversion + auth demo on `feature/QMA-HTML-CSS-JS`. | ✅ Done |
| 2026-03-30 | Monday | README professionalized | Added structured README with setup, branching, and tracking sections. | ✅ Done |
| 2026-04-01 | Wednesday | API integration (planned) | Replace demo auth with real backend endpoints and persistent storage. | ⏳ Planned |

## Development Timeline

- **2026-03-25** — Project repository created (initial baseline on `main` / `dev`).
- **2026-03-28** — First working UI milestone delivered on `feature/QMA-HTML-CSS-JS`.
- **2026-03-30** — Documentation milestone: README expanded with setup, branch tracking, and timeline.
- **2026-04-01** _(planned)_ — Backend integration and production deployment.

## Challenges Faced

- Designing a clean UX for multiple measurement categories and actions without overwhelming the UI.
- Handling unit conversion consistently (base units + special cases like temperature).
- Implementing a safe, minimal auth/session demo without a backend.

## Learnings

- Practical conversion modeling using base-unit normalization.
- Building responsive layouts quickly with Bootstrap utility classes.
- Managing user session state using `localStorage` / `sessionStorage`.

## Future Enhancements

- 🔐 Replace demo auth with a real backend (JWT + refresh tokens)
- 🗄️ Persist user profiles and history (conversion logs)
- 📈 Add analytics (most-used conversions, recent activity)
- 🌍 Add i18n support and better accessibility (ARIA + keyboard flows)
- 🚀 Deploy to GitHub Pages / Netlify with CI checks

## Contributing Guidelines

1. Fork the repository.
2. Create a feature branch: `git checkout -b feature/<short-name>`.
3. Make changes with clear commits.
4. Open a Pull Request with:
   - What changed and why
   - Screenshots (UI changes)
   - Testing notes (manual steps)

## License

MIT License — see `LICENSE` for details.
