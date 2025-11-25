# CampusConnect

## Overview

CampusConnect is a social networking platform designed to help college students build meaningful connections on campus. The application matches students based on shared courses, interests, hobbies, and goals, reducing campus loneliness through smart matching algorithms. It features event discovery, study group formation, real-time chat, campus news, and meetup location recommendations.

The platform is inspired by social platforms like Instagram (visual feed), Discord (community organization), and Bumble BFF (matching interface), creating a familiar yet purpose-built experience for campus community building.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript
- **Routing**: Wouter (lightweight client-side routing)
- **State Management**: TanStack Query (React Query) for server state
- **Form Handling**: React Hook Form with Zod validation
- **UI Components**: Radix UI primitives with shadcn/ui component library
- **Styling**: Tailwind CSS with custom design system

**Design System**:
- Typography: Inter (UI/headlines) and Work Sans (body text) via Google Fonts
- Color scheme: Neutral-based palette with purple primary accent (262° hue)
- Spacing: Tailwind spacing scale (2, 4, 6, 8, 12, 16)
- Theme support: Light and dark modes via ThemeProvider
- Component variants: Defined using class-variance-authority

**Key Pages**:
- Home: Landing page with hero and feature showcase
- Discover: Swipeable student matching interface (Tinder/Bumble-style)
- Events: Campus event browsing and RSVP
- Study Groups: Course-based study group discovery and creation
- Chat: Real-time messaging interface
- News: Campus news and announcements
- Meetups: Popular on-campus meeting locations
- Profile Setup: Multi-step onboarding flow

### Backend Architecture

**Framework**: Express.js with TypeScript
- **API Style**: RESTful JSON API
- **Real-time Communication**: WebSocket server for chat functionality
- **Development Server**: Vite middleware integration for hot module replacement
- **Production Server**: Static file serving with SPA fallback

**API Routes**:
- Student profiles: CRUD operations for user profiles
- Matches: Student-to-student connection management
- Events: Campus event creation and attendance tracking
- Study Groups: Course-based group management
- Chat: Room and message persistence
- Campus News: Announcement distribution
- Meetup Locations: Popular campus location database

**Session Management**:
- Uses connect-pg-simple for PostgreSQL-backed sessions
- Cookie-based authentication

### Data Storage

**Database**: PostgreSQL (via Neon serverless)
- **ORM**: Drizzle ORM with type-safe queries
- **Schema Management**: Drizzle Kit for migrations
- **Connection**: WebSocket-based connection pooling for serverless compatibility

**Data Models**:
- Users: Authentication credentials
- Students: Extended profile information (name, year, major, bio, avatar, courses, interests, hobbies, goals, location)
- Matches: Student-to-student connections with status tracking
- Events: Campus events with category, attendees, capacity
- Study Groups: Course-based groups with privacy settings and tags
- Chat Rooms: Group messaging channels
- Messages: Individual chat messages with sender tracking
- Campus News: Announcements with categories and authorship
- Meetup Locations: Popular on-campus spots with type classification

**Schema Features**:
- UUID primary keys via PostgreSQL gen_random_uuid()
- Array fields for multi-valued attributes (courses, interests, tags)
- Timestamp tracking for creation dates
- Zod validation schemas generated from Drizzle schemas

### External Dependencies

**Database Service**:
- Neon Serverless PostgreSQL: Managed PostgreSQL with WebSocket support
- Requires DATABASE_URL environment variable

**UI Component Library**:
- Radix UI: Accessible, unstyled component primitives
- shadcn/ui: Pre-styled component implementations
- Lucide React: Icon library

**Development Tools**:
- Vite: Build tool and dev server
- Replit-specific plugins: Cartographer (source mapping), dev banner, runtime error overlay
- ESBuild: Production bundling for server code

**Font Delivery**:
- Google Fonts CDN: Inter and Work Sans font families

**Styling Framework**:
- Tailwind CSS: Utility-first CSS framework
- PostCSS with Autoprefixer: CSS processing

**Validation**:
- Zod: Runtime type validation
- @hookform/resolvers: Form validation integration

**Date Handling**:
- date-fns: Date formatting and manipulation

**Real-time**:
- ws: WebSocket library for Node.js
- WebSocketServer for chat functionality