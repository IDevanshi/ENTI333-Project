# CampusConnect

## Overview

CampusConnect is a social networking platform designed to help college students build meaningful connections on campus. The app matches students based on shared courses, interests, hobbies, and goals to reduce loneliness and improve campus engagement. Students can discover events, join study groups, chat in real time, browse campus news, and find meetup spots.

The platform blends UX patterns inspired by Instagram (visual feed), Discord (community structure), and Bumble BFF (matching interface), creating a familiar but campus-focused experience.

---

## Development Background

The project was originally built in **Replit**, using its built-in tooling for React, TypeScript, Tailwind, and Express.
Replit also injected platform-specific modules such as:

* Cartographer (source mapping),
* Replit dev banner,
* Automatic error overlays,
* Replit file-system helpers.

Those dependencies were removed when exporting the code so the project could run **locally without Replit**.
This required:

* Replacing Replit-specific imports and middleware
* Reconfiguring Vite and Express
* Adjusting the folder structure
* Updating the server entry points (`index-dev.ts` and `index-prod.ts`)
* Cleaning the build scripts in `package.json`
* Re-adding `cross-env` manually for environment handling
* Ensuring the WebSocket server works outside of Replit’s proxy system

The project now runs fully locally and independently using standard Node.js tooling.

---

## Tech Stack

### Frontend

**Framework:** React + TypeScript
**Core Libraries:**

* Wouter for client-side routing
* TanStack Query for fetching and caching
* React Hook Form + Zod for type-safe form validation
* Radix UI + shadcn/ui for accessible UI components
* Tailwind CSS for styling
* Lucide React for icons
* Google Fonts (Inter, Work Sans)

**Key Pages & Features:**

* Home page (landing + feature overview)
* Swipe-style matching (Discover)
* Events browsing and RSVP
* Study group creation and discovery
* Real-time chat
* Campus news feed
* On-campus meetup locations
* Multi-step onboarding flow

---

### Backend

**Framework:** Express.js + TypeScript
**Features:**

* REST API endpoints for all major entities
* WebSocket server for chat
* Vite middleware for hot reload during development
* ESBuild-bundled production server

**Modules:**

* Student profiles
* Matches
* Events
* Study Groups
* Chat rooms
* Messages
* Campus News
* Meetup spots

**Authentication:**

* PostgreSQL-backed sessions (connect-pg-simple)
* Cookie-based login

---

### Database Layer

**Database:** PostgreSQL (Neon serverless)
**ORM:** Drizzle ORM
**Migrations:** Drizzle Kit
**Connection:** WebSocket-based DB pooling

**Schema Highlights:**

* UUID primary keys
* Array-based attributes (interests, courses, tags)
* Timestamps
* Zod schemas generated from Drizzle definitions

---

### External & Dev Dependencies

* Neon PostgreSQL
* Radix UI, shadcn/ui, Lucide icons
* Vite
* ESBuild
* Tailwind CSS + PostCSS
* Zod
* date-fns
* ws (WebSocket server)

---

## Running the Project Locally

### 1. Navigate to the project folder

Open a terminal and move into the directory that contains `package.json`:

```bash
cd path/to/CampusConnect
```

### 2. Install dependencies

Run:

```bash
npm install
```

If you get errors about environment variables or `cross-env`, install it manually:

```bash
npm install cross-env
```

### 3. Start the development environment

```bash
npm run dev
```

This launches:

* React frontend (Vite)
* Express backend with WebSocket support
* Hot module reload (HMR)

### 4. Open the app in your browser

```
http://localhost:5000
```

---

## Recommended Setup

* Node.js 18+
* VS Code

  * Tailwind CSS IntelliSense
  * Prettier
  * TypeScript extension
* PostgreSQL database (Neon recommended)
