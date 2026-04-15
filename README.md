# Quantity Measurement App - Frontend
A sleek, modern, and highly interactive Angular frontend for unit conversions, quantity arithmetic, and operation tracking, built with performance and user experience at its core.

## Overview
The Quantity Measurement App frontend is a responsive web application designed to simplify complex unit calculations through an intuitive Angular-based interface.

It enables users to:

- Convert units seamlessly
- Perform arithmetic operations on quantities
- Track and analyze past operations
- Work through a clean, fast, and scalable UI

## Key Highlights

### Real-Time Unit Conversion
Effortlessly convert between multiple measurement units with instant results.

### Smart Quantity Arithmetic
Perform operations like addition and subtraction with automatic unit normalization.

### Interactive Dashboard
- Live stats overview
- Recent activity tracking
- Clean and structured UI components

### History Management System
- Stores all operations
- Easy-to-read and organized layout

### Authentication Ready
- Context-based or service-based auth structure
- Easily extendable to OAuth integrations such as Google Login

### Fully Responsive Design
Optimized for desktop, tablet, and mobile devices.

## UI Preview
- Modern dashboard layout
- Minimal yet functional design
- Smooth navigation and transitions
- Toast notifications for better UX

## Tech Stack

| Category | Technology |
| --- | --- |
| Frontend Framework | Angular |
| Language | TypeScript |
| Build Tool | Angular CLI |
| Styling | CSS / SCSS / Tailwind CSS |
| Routing | Angular Router |
| API Handling | Angular HttpClient |
| State Management | RxJS / Services |
| Notifications | Toast / Snackbar Integration |
| Icons | Angular-compatible icon set |

## Architecture & Design
The project follows a modular and scalable Angular architecture:

- Component-based structure
- Separation of concerns across UI, logic, and API layers
- Reusable components, services, and utilities
- Centralized API handling
- Reactive data flow with RxJS

## Folder Structure

```text
src/
|-- app/
|   |-- components/      # Reusable UI components
|   |-- pages/           # Application pages
|   |-- services/        # API calls and business logic
|   |-- models/          # Shared interfaces and types
|   |-- guards/          # Route guards for auth protection
|   |-- interceptors/    # HTTP interceptors
|   |-- shared/          # Shared modules, pipes, and utilities
|   |-- app-routing.module.ts
|   |-- app.module.ts
|   `-- app.component.*
|-- assets/              # Static assets
|-- environments/        # Environment configuration
`-- styles.scss          # Global styles
```

## Setup & Installation

### Clone the Repository
```bash
git clone <your-repo-url>
cd QuantityMeasurementAppFrontend
```

### Install Dependencies
```bash
npm install
```

### Run Locally
```bash
ng serve
```

Open the app at:

```bash
http://localhost:4200
```

### Production Build
```bash
ng build
```

## API Configuration
All backend communication is handled through Angular services and `HttpClient`.

### Suggested Location

```text
src/environments/environment.ts
```

Update the API base URL according to your backend deployment.

## Unique Selling Points (USP)

- Handles unit normalization automatically during arithmetic
- Clean separation between business logic and UI
- Designed for scalability and microservices integration
- Smooth UX with real-time feedback and notifications
- Ready for production deployment

## Future Enhancements

- Google OAuth login integration
- Advanced data visualization
- More unit categories like temperature and currency
- PWA support with offline capability
- Multi-language support

## Author

Riddhi Srivastava
