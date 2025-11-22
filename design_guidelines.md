# CampusConnect Design Guidelines

## Design Approach

**Selected Approach**: Reference-Based (Social + Community Platforms)

Primary inspiration from Instagram (visual social feed), Discord (community organization), and Bumble BFF (matching interface) to create an engaging, youth-oriented platform that feels familiar yet purposeful.

**Core Principles**:
- Approachable and welcoming to reduce intimidation
- Scannable content with strong visual hierarchy
- Emphasis on human connection through photography
- Clear community organization
- Quick actions and instant gratification

---

## Typography

**Font Stack**: Google Fonts via CDN
- **Primary**: Inter (headlines, UI elements) - weights 400, 500, 600, 700
- **Secondary**: Work Sans (body copy, descriptions) - weights 400, 500

**Type Scale**:
- Hero headlines: text-5xl to text-6xl, font-bold
- Section headers: text-3xl to text-4xl, font-semibold
- Card titles: text-xl, font-semibold
- Body text: text-base
- Metadata/labels: text-sm, font-medium
- Captions: text-xs

---

## Layout System

**Spacing Primitives**: Tailwind units of 2, 4, 6, 8, 12, 16
- Micro spacing (gaps, padding): 2, 4
- Component spacing: 6, 8
- Section spacing: 12, 16
- Page margins: 8, 12

**Container Strategy**:
- Main content: max-w-7xl mx-auto
- Feed/cards: max-w-4xl
- Chat interface: max-w-6xl with split layout
- Forms: max-w-md

**Grid Patterns**:
- Student cards: grid-cols-2 md:grid-cols-3 lg:grid-cols-4, gap-4
- Event cards: grid-cols-1 md:grid-cols-2 lg:grid-cols-3, gap-6
- Interest tags: flex flex-wrap gap-2

---

## Component Library

### Navigation
**Top Bar**: Fixed navigation with logo left, search center, profile/notifications right. Height h-16, backdrop-blur effect, shadow-sm

**Tab Navigation**: For main sections (Feed, Discover, Events, Groups, Chats). Horizontal scroll on mobile, fixed on desktop. Active state with underline indicator

### Cards & Content

**Student Profile Card**:
- Square aspect ratio image (1:1)
- Name + year overlay on image hover
- Match percentage badge (top-right corner, rounded-full)
- Shared interests as pill badges below image
- Quick action button (Connect/Message)

**Event Card**:
- 16:9 hero image
- Date badge (absolute positioned, top-left)
- Gradient overlay on image for text readability
- Title, location, attendee count
- RSVP button with attendee avatars (overlapping circles)

**Study Group Card**:
- Course code badge
- Member avatars in horizontal row (max 5, then +N)
- Description preview (2 lines, truncated)
- Join/Request button
- Tags for subjects/topics

**Chat Preview**:
- Avatar (left), name + last message preview
- Timestamp (top-right)
- Unread badge (rounded-full, absolute)
- Active state with slight background treatment

### Interactive Elements

**Matching Interface** (Discover page):
- Large profile card (centered, max-w-sm)
- Swipeable with gesture hints
- Action buttons below: Skip (outline), Connect (solid), Super Connect (accent)
- Profile details expandable accordion below image

**Interest Pills**:
- Rounded-full badges
- Interactive (clickable to filter)
- Selected state with subtle background
- Small × to remove from profile

**Activity Feed**:
- Mixed content types (events, group updates, campus news)
- Card-based layout with consistent spacing-6
- Interaction buttons (like, comment, share) below each post
- User avatar + timestamp header

### Forms & Inputs

**Profile Setup**:
- Multi-step wizard with progress indicator (top)
- Large image upload area with placeholder text
- Tag selector for interests (searchable, multi-select)
- Course selector with autocomplete
- Goals as textarea with character counter

**Search Bar**:
- Prominent search with icon (Heroicons)
- Rounded-full design
- Autocomplete dropdown with recent searches
- Filter chips below for categories

### Chat Interface

**Layout**: Two-column on desktop (lg:grid-cols-[320px_1fr])
- Left sidebar: Conversation list (scrollable)
- Right panel: Active chat with message bubbles
- Message input: Fixed bottom with emoji picker icon

**Message Bubbles**:
- Sent: Right-aligned, rounded corners (rounded-t-2xl rounded-bl-2xl)
- Received: Left-aligned, rounded corners (rounded-t-2xl rounded-br-2xl)
- Timestamp below each message cluster
- Avatar for received messages

### Location & Maps

**Meetup Suggestions**:
- Map view option (can use Mapbox/Google Maps)
- List view with distance indicators
- Popular spots highlighted
- Filter by: study spots, cafés, recreation

---

## Images

### Hero Section (Landing/Marketing):
**Large Hero Image**: Yes, full-width hero with diverse students collaborating on campus
- Aspect: 16:9 on desktop, 3:2 on mobile
- Overlay: Subtle gradient for headline readability
- CTA buttons: Backdrop-blur background (bg-white/10 backdrop-blur-md)

### Throughout Application:
- **Student Profiles**: Square headshots (user-uploaded)
- **Event Cards**: 16:9 event photos (campus activities, study sessions)
- **Group Headers**: Banner images for study groups/communities
- **Campus News**: Featured images for announcements (4:3 ratio)
- **Placeholder States**: Illustrated empty states (use icon libraries, not custom illustrations)

### Image Treatment:
- All user images: rounded-lg (cards) or rounded-full (avatars)
- Hover states: Slight zoom (scale-105 transform)
- Loading: Skeleton with subtle shimmer animation

---

## Icons

**Library**: Heroicons (via CDN)
- Outline variant for inactive/secondary actions
- Solid variant for active states and emphasis
- Consistent size: w-5 h-5 for UI, w-6 h-6 for feature icons

---

## Animations

**Minimal, purposeful animations**:
- Card hover: Subtle lift (shadow increase)
- Button interactions: Scale on press (scale-95)
- Navigation transitions: Smooth opacity fade
- Loading states: Skeleton shimmer only
- Swipe gestures: Transform translateX feedback

**NO** scroll-triggered animations, parallax effects, or decorative motion

---

## Accessibility

- ARIA labels for all interactive elements
- Keyboard navigation support (tab order, focus states)
- Focus rings: ring-2 ring-offset-2
- Color contrast ratios meet WCAG AA (will be ensured in color phase)
- Alt text for all images
- Form labels clearly associated with inputs

---

## Responsive Behavior

**Mobile-First Breakpoints**:
- Mobile: Single column, bottom tab navigation
- Tablet (md:): Two-column grids, side navigation appears
- Desktop (lg:): Three+ column grids, full sidebar layouts

**Priority Shifts**:
- Mobile: Swipe-first matching interface
- Desktop: Click-first with detailed previews
- Chat always accessible via floating button on mobile