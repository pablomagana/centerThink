# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **centerThink**, an event management application for organizing "Thinkglaos" (events) across multiple cities. The app manages speakers, venues, cities, users, and event orders with a role-based access system.

**Tech Stack:**
- React 18 + Vite
- React Router for routing
- Tailwind CSS + shadcn/ui for styling
- Lucide React for icons
- Framer Motion for animations

## Development Commands

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:3000)
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

## Architecture

### Project Structure

```
src/
├── api/             # API client layer
│   └── base44Client.js  # Base44 API client with Entity classes
├── components/       # React components organized by feature
│   ├── ui/          # shadcn/ui base components (button, card, input, select, alert, etc.)
│   ├── events/      # Event-related components
│   ├── speakers/    # Speaker components
│   ├── venues/      # Venue components
│   ├── cities/      # City components
│   ├── users/       # User components
│   └── profile/     # Profile page components (ProfileForm, PasswordChangeForm)
├── entities/        # Data schema definitions + Entity class exports
├── Pages/           # Page components
├── Layout.js        # Main layout with sidebar
├── App.jsx          # Route configuration
├── main.jsx         # Application entry point
├── utils.js         # Shared utilities (cn, createPageUrl)
└── index.css        # Global styles with Tailwind
```

### Entity-Driven Design

The application follows a schema-first approach where all data models are defined as entities in the `src/entities/` folder. Each entity file exports a JavaScript object containing:
- Schema definition with properties, types, descriptions
- Validation rules (required fields, enums, defaults)
- Field formats (date, date-time, etc.)

**Key Entities:**
- `Event` - The core entity representing Thinkglaos with preparations tracking, volunteer management, and status workflow
- `Speaker` - Ponentes with contact status and proposal workflow states
- `Venue` - Event locations with capacity and contact information
- `City` - Geographic organization unit; users are assigned to cities
- `User` - Additional user data schema (extends base user system)
- `OrderType` - Types of tasks/orders with priority levels
- `EventOrder` - Tasks associated with events, assigned to users

### Application Context

The app uses a centralized context pattern via `AppContextProvider` that manages:
- Current user authentication and role
- User's assigned cities (filtered by active status)
- Selected city (persisted to localStorage)
- Loading states

**Context Flow:**
1. On app load, fetches current user via `User.me()`
2. Loads all cities and filters by user's assigned cities
3. Restores previously selected city from localStorage or defaults to first city
4. All pages respect the selected city context for filtering data

### Layout and Navigation

`Layout.jsx` provides the main application shell with:
- Sidebar navigation with role-based menu filtering
- City selector component (single city display or dropdown for multiple)
- User profile display in footer (clickable to navigate to profile page)
- Responsive design with mobile trigger

**Navigation items are role-filtered:**
- Admin role: sees all menu items including Users and Cities settings
- Supplier role: sees Users and Cities settings (limited to assigned cities)
- User role: sees only operational pages (Events, Speakers, Venues, Orders, Calendar)

### Page Structure

Pages follow a consistent pattern (see `Pages/` folder):
- Load related data on mount (events, speakers, venues, cities)
- Maintain local state for forms, filters, and editing
- Filter data by selected city from context
- Delegate to specialized components for forms and lists

**Common Page Pattern:**
```
Page Component (e.g., Events.tsx)
├── Load data (Event.list, Speaker.list, etc.)
├── Filter by selectedCity from AppContext
├── Form component for create/edit
├── Filter component for data views
└── List component for data display
```

### Component Organization

Components are organized by feature in subdirectories:
- `src/components/events/` - EventForm, EventsList, EventFilters
- `src/components/speakers/` - SpeakerForm, SpeakersForm
- `src/components/venues/` - VenueForm, VenueList
- `src/components/cities/` - CityForm, CityList
- `src/components/users/` - UserForm (edit), UserCreateForm (create), UsersList
- `src/components/profile/` - ProfileForm (edit own profile), PasswordChangeForm (change password)
- `src/components/ui/` - Base shadcn/ui components (Button, Card, Input, Select, Alert, etc.)

### Entity API Pattern

Entities are implemented via the Base44 API client (`src/api/base44Client.js`). Each entity file in `src/entities/` exports:
- A schema object (e.g., `CitySchema`) with validation rules
- An Entity class instance (e.g., `City`) with CRUD methods

**Available Entity Methods:**
- `Entity.list(sortOrder?, limit?)` - Fetch all records, optionally sorted (e.g., "-date") with limit
- `Entity.get(id)` - Fetch single record by ID
- `Entity.create(data)` - Create new record (only creates in entity table)
- `Entity.update(id, data)` - Update existing record
- `Entity.delete(id)` - Delete record
- `User.me()` - Special method to fetch current authenticated user
- `User.createComplete(userData)` - Creates complete user (auth + profile) via Edge Function

**API Configuration:**
- Set `VITE_API_BASE_URL` in `.env` file (see `.env.example`)
- Default: `http://localhost:8000/api`
- All API calls use `fetch` with credentials: 'include' for authentication

### Automatic Event Title Generation

Events do not have user-editable titles. Instead, titles are automatically generated in the format:
```
"Thinkglao en {City} con {Speaker} el {Date}"
```
When creating/editing events, the title is generated from selected city, speaker, and date.

### Preparations Workflow

Events include a `preparations` object tracking 5 preparation tasks, each with status:
- `pendiente` (Pending)
- `procesando` (Processing)
- `resuelto` (Resolved)

Preparation types: presentation_video, poster_image, theme, transport, accommodation

### Volunteer Management

Events track confirmed volunteers with arrival times via `confirmed_volunteers` array containing:
- `user_id` - Reference to volunteer user
- `arrival_time` - When the volunteer will arrive

### User Creation System

User creation is handled through a Supabase Edge Function to ensure secure authentication setup:

**Components:**
- `UserCreateForm.tsx` - Form component for creating new users with role and city assignment
- `supabase/functions/create-user/` - Edge Function that creates user in auth.users and user_profiles

**Creation Flow:**
1. Admin or Supplier fills out UserCreateForm with: email, name, last name, role, cities, phone
2. Frontend calls `User.createComplete(userData)` which invokes the Edge Function
3. Edge Function validates permissions:
   - Admin can create users in any city
   - Supplier can only create users in their assigned cities
4. Edge Function creates user in Supabase Auth with auto-generated secure password
5. Edge Function creates user profile in `user_profiles` table
6. Temporary password is returned to creator (should be communicated securely to new user)

**Permissions:**
- Only Admin and Supplier roles can create users
- Supplier can only assign cities they are assigned to
- User role cannot create other users

**Security:**
- User creation requires valid JWT token
- Edge Function validates creator permissions before proceeding
- Automatic rollback if profile creation fails
- Secure password generation (16 characters, mixed case, numbers, symbols)

### User Deletion System

User deletion is handled through a Supabase Edge Function to ensure complete removal from both authentication and profile tables:

**Components:**
- Edge Function: `supabase/functions/delete-user/` - Deletes user from both auth.users and user_profiles
- `User.deleteComplete(userId)` - Client method that invokes the Edge Function

**Deletion Flow:**
1. Admin or Supplier initiates user deletion
2. Frontend calls `User.deleteComplete(userId)` in [Users.tsx:141](src/Pages/Users.tsx#L141)
3. Edge Function validates permissions:
   - Admin can delete any user (except themselves)
   - Supplier can delete users (except themselves)
   - User role cannot delete users
4. Edge Function deletes from `user_profiles` first
5. Edge Function deletes from `auth.users`
6. Returns success or error with details

**Permissions:**
- Only Admin and Supplier roles can delete users
- Users cannot delete their own account (safety measure)
- Deletion is permanent and cannot be undone

**Important:**
- The old `User.delete(id)` method only deletes from `user_profiles` (kept for compatibility)
- Always use `User.deleteComplete(id)` for complete user removal
- Deletion removes user from both authentication and profile tables

## Email Notifications (EmailJS Integration)

### User Creation Email Flow
When a new user is created, the system automatically sends an email with login credentials using EmailJS.

**Configuration:**
1. Create EmailJS account at [emailjs.com](https://www.emailjs.com/)
2. Set up email service (Gmail, Outlook, SendGrid, etc.)
3. Create email template with required variables:
   - `{{to_email}}` - Recipient email address
   - `{{user_name}}` - Full name of new user
   - `{{temp_password}}` - Auto-generated temporary password
   - `{{login_url}}` - Application URL for login
   - `{{creator_name}}` - Admin/Supplier who created the account
4. Configure environment variables in `.env`:
   ```env
   VITE_EMAILJS_SERVICE_ID=your_service_id
   VITE_EMAILJS_TEMPLATE_ID=your_template_id
   VITE_EMAILJS_PUBLIC_KEY=your_public_key
   VITE_APP_URL=http://localhost:3000
   ```

**Components:**
- `emailService` (`src/services/email.service.js`) - EmailJS integration service
- `emailService.sendUserCredentials()` - Sends credentials email to new user
- `emailService.init()` - Initializes EmailJS (called in `main.jsx`)

**Flow:**
1. Admin/Supplier creates user via UserCreateForm in [Users.tsx:44-99](src/Pages/Users.tsx#L44-L99)
2. Edge Function creates user and generates temporary password
3. Frontend receives temp password in response
4. Frontend calls `emailService.sendUserCredentials()` to send email
5. On success: User receives email with credentials and login link
6. On failure: Alert displays password for manual communication (fallback)

**Security:**
- Temp password only transmitted via HTTPS
- Email sent directly from browser using EmailJS client SDK
- Fallback to manual communication if email fails
- No password stored in logs or databases (except encrypted in Supabase Auth)
- EmailJS Public Key is safe to expose (designed for client-side use)

**Error Handling:**
- If EmailJS is not configured, error thrown with clear message
- If email send fails, user creation still succeeds (rollback not performed)
- Admin receives alert with password for manual delivery as fallback
- All email errors logged to console for debugging

**Template Example:**
See `docs/email-template.html` for reference HTML template with proper styling and structure.

## Key Conventions

1. **City Filtering**: Most data views should respect the `selectedCity` from AppContext
2. **Active Status**: Entities with `active` field should be filtered (`.filter(item => item.active)`)
3. **Role-Based Access**: Navigation and features filter by `currentUser.role`:
   - `admin`: Full access to all features and all cities
   - `supplier`: Access to Users and Cities management, limited to assigned cities
   - `user`: Operational access only (Events, Speakers, Venues, Orders, Calendar)
4. **Date Handling**: Events use ISO date-time strings; dates are formatted in Spanish locale
5. **Component Naming**: Use domain-specific terms (Thinkglao, Ponente, Local) in UI labels
6. **Form State**:
   - Edit forms receive entity for edit mode, null for create mode
   - User creation uses separate UserCreateForm component (not UserForm)
7. **Styling**: Uses Tailwind CSS with gradient themes (blue-to-emerald), shadcn/ui components

## Import Path Aliases

The project uses `@/` alias for imports (configured in vite.config.js and tsconfig.json):
- `@/entities/` - Entity definitions
- `@/components/` - Components (including subdirectories)
- `@/components/ui/` - shadcn/ui base components
- `@/utils` - Utility functions (e.g., `createPageUrl`, `cn`)

All `@/` paths resolve to the `src/` directory.

## User Profile Feature

### Profile Page (`/profile`)
Users can access their profile page by clicking on their email in the sidebar footer. The profile page allows users to:
- View and edit personal information (first name, last name, phone)
- View read-only information (email, role, assigned cities)
- Change their password securely

### Components

**ProfileForm** (`src/components/profile/ProfileForm.tsx`):
- Editable fields: first_name, last_name, phone
- Read-only displays: email, role (with color-coded badge), cities (with badges)
- Real-time validation with error messages
- Cancel and Save buttons (enabled only when form is edited)
- Integrates with `User.update()` to persist changes

**PasswordChangeForm** (`src/components/profile/PasswordChangeForm.tsx`):
- Three password fields: current password, new password, confirm password
- Show/hide toggle for all password fields (eye icon)
- Real-time password requirements validation:
  - Minimum 8 characters
  - At least one uppercase letter
  - At least one lowercase letter
  - At least one number
- Visual feedback of requirement compliance (checkmarks/x marks)
- Verifies current password via Supabase re-authentication before allowing change
- Uses `supabase.auth.updateUser()` for secure password updates
- Comprehensive error handling for incorrect passwords and validation failures

### Security Features
- Current password verification required before changing password
- Password complexity requirements enforced
- Supabase Auth integration for secure password management
- Users can only edit their own profile (no cross-user editing)
- Role and city assignments remain read-only (admin-only modifications)

### Navigation
- Accessible via clickable email in sidebar footer (works for all authenticated users)
- Protected route requiring authentication
- Updates reflected immediately in sidebar after profile save
- Uses `AuthContext.refreshProfile()` to sync changes across the app

## Configuration Files

- `vite.config.js` - Vite bundler configuration with path aliases
- `tsconfig.json` - TypeScript configuration (supports .tsx files)
- `tailwind.config.js` - Tailwind CSS configuration with shadcn/ui presets
- `postcss.config.js` - PostCSS configuration for Tailwind
- `.eslintrc.cjs` - ESLint rules for React
- `package.json` - Dependencies and scripts
