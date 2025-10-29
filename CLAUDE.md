# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is **centerThink**, an event management application for organizing "Thinkglaos" (events) across multiple cities. The app manages speakers, venues, cities, users, and event orders with a role-based access system.

**Tech Stack:**
- React 18 + Vite
- React Router for routing
- Supabase (authentication, database, Edge Functions)
- Tailwind CSS + shadcn/ui for styling
- Lucide React for icons
- Framer Motion for animations
- EmailJS (for user credential emails)
- date-fns (date formatting)

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
├── api/             # API client layer (legacy wrapper)
│   └── base44Client.js  # Supabase client wrapper with Entity classes
├── components/       # React components organized by feature
│   ├── ui/          # shadcn/ui base components (button, card, input, select, alert, etc.)
│   ├── events/      # Event-related components
│   ├── speakers/    # Speaker components
│   ├── venues/      # Venue components
│   ├── cities/      # City components
│   ├── users/       # User components
│   └── profile/     # Profile page components (ProfileForm, PasswordChangeForm)
├── contexts/        # React Context providers
│   └── AuthContext.jsx  # Authentication context with Supabase integration
├── entities/        # Data schema definitions + Entity service exports
├── lib/             # Core libraries
│   └── supabase.js  # Supabase client configuration
├── services/        # Business logic layer (primary data access)
│   ├── auth.service.js    # Authentication operations
│   ├── user.service.js    # User CRUD + Edge Function calls
│   ├── event.service.js   # Event operations
│   ├── speaker.service.js # Speaker operations
│   ├── venue.service.js   # Venue operations
│   ├── city.service.js    # City operations
│   └── email.service.js   # EmailJS integration
├── Pages/           # Page components
├── Layout.jsx       # Main layout with sidebar
├── App.jsx          # Route configuration
├── main.jsx         # Application entry point
├── utils.js         # Shared utilities (cn, createPageUrl)
└── index.css        # Global styles with Tailwind

supabase/functions/  # Supabase Edge Functions (Deno runtime)
├── create-user/              # Create user in auth + profiles
├── delete-user/              # Delete user from auth + profiles
├── reset-user-password/      # Manual password reset + recovery email
├── register-user/            # Public user registration
├── verify-user-email/        # Manual email verification
└── get-user-verification-status/  # Check email verification
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

### Data Access Layer Architecture

The application uses a **two-layer architecture** for data access:

1. **Services Layer** (`src/services/*.service.js`) - **Primary layer**: Direct Supabase client operations
   - All new code should use services directly
   - Located in `src/services/`
   - Each service exports an object with methods (list, get, create, update, delete, etc.)
   - Example: `import { userService } from '@/services/user.service'`

2. **Entity Layer** (`src/entities/*.js`) - **Legacy wrapper**: Exports service instances
   - Maintained for backward compatibility
   - Entity files export the corresponding service instance
   - Example: `Event.js` exports `eventService` as `Event`
   - Schema definitions remain in entity files

**Recommended Pattern:**
```javascript
// ✅ Preferred: Use services directly
import { userService } from '@/services/user.service'
const users = await userService.list()

// ✅ Also valid: Use via entity exports (legacy)
import { User } from '@/entities/User'
const users = await User.list()
```

### Authentication Architecture

The app uses **dual context pattern** for authentication and app state:

**1. AuthContext** (`src/contexts/AuthContext.jsx`):
- Manages Supabase authentication state
- Provides: `user` (Supabase auth user), `profile` (user_profiles data), `session`, `loading`
- Methods: `signIn()`, `signOut()`, `refreshProfile()`
- Listens to Supabase `onAuthStateChange` events
- Auto-loads user profile on authentication

**2. AppContext** (`src/components/AppContextProvider.tsx`):
- Depends on AuthContext
- Manages application-level state:
  - `currentUser` / `profile`: Current user with full profile data
  - `userCities`: Cities assigned to current user (filtered by active status)
  - `selectedCity`: Currently selected city (persisted to localStorage)
  - `appIsLoading`: Loading state for app initialization
- Provides city management for multi-tenant filtering

**Context Flow:**
1. App loads → AuthContext checks Supabase session
2. If authenticated → loads user profile from `user_profiles` table
3. AppContext loads user's assigned cities
4. Restores previously selected city from localStorage or defaults to first city
5. All pages respect `selectedCity` from AppContext for data filtering

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

### Service Layer API Pattern

Services provide direct Supabase database access. All services follow a consistent CRUD pattern:

**Standard Service Methods:**
- `service.list(sortOrder?, limit?)` - Fetch all records, optionally sorted (e.g., "-date") with limit
- `service.get(id)` - Fetch single record by ID
- `service.create(data)` - Create new record
- `service.update(id, data)` - Update existing record
- `service.delete(id)` - Delete record

**User Service Special Methods:**
- `userService.me()` - Fetch current authenticated user profile
- `userService.createComplete(userData)` - Creates user in auth + profiles via Edge Function
- `userService.deleteComplete(userId)` - Deletes user from auth + profiles via Edge Function
- `userService.resetPassword(userId, newPassword)` - Set new password via Edge Function
- `userService.sendPasswordResetEmail(userId)` - Send recovery email via Edge Function
- `userService.verifyUserEmail(userId)` - Manually verify user email via Edge Function
- `userService.register(userData)` - Public user registration (no auth required)
- `userService.getPublicCities()` - Get cities available for public registration

**Supabase Configuration:**
Environment variables required in `.env`:
```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
```

All database operations use the Supabase client from `src/lib/supabase.js` with automatic session management.

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

### Public User Registration

The application supports public user registration where users can create their own accounts:

**Components:**
- `Register.tsx` - Public registration page
- `supabase/functions/register-user/` - Edge Function handling registration
- `userService.register(userData)` - Client method for registration
- `userService.getPublicCities()` - Fetch available cities for registration

**Registration Flow:**
1. User visits `/register` (no authentication required)
2. User fills out form: email, password, first_name, last_name, city_id, phone (optional)
3. Frontend validates password requirements:
   - Minimum 8 characters
   - At least one uppercase letter
   - At least one lowercase letter
   - At least one number
4. Frontend calls `userService.register()` which:
   - Creates user in `auth.users` via `supabase.auth.signUp()`
   - Supabase automatically sends confirmation email
   - Calls Edge Function to create profile in `user_profiles`
5. User receives confirmation email from Supabase
6. User must verify email before logging in

**Key Features:**
- No admin intervention required
- All registered users default to `user` role
- Users are assigned to the city they selected during registration
- Email verification required (enforced by Supabase)
- Uses Supabase native email templates (configured in Supabase Dashboard)

**Email Configuration:**
Registration confirmation emails use Supabase's built-in system:
1. Go to Supabase Dashboard → Authentication → Email Templates
2. Configure "Confirm signup" template
3. Set Site URL and Redirect URLs in URL Configuration
4. See `docs/SETUP-EMAILS.md` for detailed setup guide

### User Creation System (Admin/Supplier)

Admin and Supplier users can create accounts for other users through a Supabase Edge Function:

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

### Email Verification System

The application tracks email verification status for all users and allows manual verification:

**Components:**
- Edge Function: `supabase/functions/verify-user-email/` - Manually verify user email
- Edge Function: `supabase/functions/get-user-verification-status/` - Check verification status
- `userService.verifyUserEmail(userId)` - Client method to manually verify email
- `UsersList.tsx` - Displays verification status with badge indicators

**Verification Flow:**
1. Users register → Supabase sends confirmation email automatically
2. User clicks link in email → email verified in `auth.users`
3. User list displays verification status:
   - ✅ Green badge: Email verified
   - ❌ Red badge: Email not verified
4. Admin/Supplier can manually verify if needed:
   - Click "Verificar Email" button in user list
   - Calls Edge Function to update `email_confirmed_at` in auth.users
   - Updates verification status immediately

**Verification Status:**
- Stored in `auth.users.email_confirmed_at` (Supabase managed)
- Fetched via `get-user-verification-status` Edge Function
- Displayed in user list with color-coded badges
- Manual verification available for admin/supplier roles

**Use Cases for Manual Verification:**
- User didn't receive confirmation email
- Email service temporarily unavailable
- Testing/development purposes
- Admin creating accounts on behalf of users

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

### User Password Reset System

Admin and Supplier users can reset passwords for users they manage through two methods:

**Components:**
- Edge Function: `supabase/functions/reset-user-password/` - Handles password reset operations
- `User.resetPassword(userId, newPassword)` - Sets a specific password for a user
- `User.sendPasswordResetEmail(userId)` - Sends password recovery email to user
- `UserCreateForm.tsx` - Includes password reset UI in edit mode

**Reset Methods:**

1. **Manual Password Reset** - Admin/Supplier sets a specific password:
   - Minimum 6 characters required
   - Password is set immediately
   - User can use the new password to log in right away
   - Accessible via "Establecer Nueva Contraseña" button in user edit form

2. **Email Recovery Link** - Sends Supabase password reset email:
   - Uses Supabase's built-in password recovery system
   - User receives email with secure recovery link
   - User clicks link and sets their own password
   - Accessible via "Enviar Email de Recuperación" button in user edit form

**Reset Flow:**
1. Admin or Supplier opens user edit form in [Users.tsx](src/Pages/Users.tsx)
2. In edit mode, password reset section appears with two options
3. For manual reset:
   - Click "Establecer Nueva Contraseña"
   - Enter new password (min 6 characters) in modal
   - Password is validated and set via Edge Function
4. For email reset:
   - Click "Enviar Email de Recuperación"
   - Confirm sending email to user
   - Supabase sends password recovery email with secure link
   - User follows link to set new password

**Permissions:**
- Only Admin and Supplier roles can reset passwords
- Supplier can only reset passwords for users in their assigned cities
- Admin can reset passwords for any user
- Edge Function validates permissions and city assignments

**Security:**
- Password reset requires valid JWT token
- Edge Function validates requester has permission to manage the target user
- Supplier permissions verified against shared cities
- Recovery emails use Supabase's secure token system
- Manual passwords must meet minimum length requirement

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

## Supabase Edge Functions

The application uses Supabase Edge Functions (Deno runtime) for server-side operations that require elevated privileges:

**Available Edge Functions:**

1. **create-user** - Create complete user (auth + profile)
   - Requires authentication (admin/supplier)
   - Validates permissions based on role and cities
   - Generates secure random password
   - Returns temp password for email delivery

2. **delete-user** - Delete user from auth and profiles
   - Requires authentication (admin/supplier)
   - Prevents self-deletion
   - Deletes from user_profiles first, then auth.users
   - Validates permissions

3. **reset-user-password** - Reset user password
   - Two modes: manual password set OR send recovery email
   - Requires authentication (admin/supplier)
   - Validates requester has permission to manage target user
   - Supports city-based permissions for suppliers

4. **register-user** - Public user registration
   - GET: Returns list of available cities
   - POST: Creates user profile after Supabase auth signup
   - No authentication required
   - Assigns user to selected city with 'user' role

5. **verify-user-email** - Manually verify user email
   - Requires authentication (admin/supplier)
   - Updates email_confirmed_at in auth.users
   - Used when automatic verification fails

6. **get-user-verification-status** - Check email verification
   - Requires authentication
   - Returns email verification status from auth.users
   - Used by user list to display badges

**Deployment:**
```bash
# Deploy all functions
supabase functions deploy

# Deploy specific function
supabase functions deploy create-user
```

**Testing Locally:**
```bash
# Start Supabase locally
supabase start

# Serve functions locally
supabase functions serve

# Test function
curl -i --location --request POST 'http://localhost:54321/functions/v1/your-function' \
  --header 'Authorization: Bearer YOUR_JWT_TOKEN' \
  --header 'Content-Type: application/json' \
  --data '{"key":"value"}'
```

**Important Notes:**
- Edge Functions run in Deno runtime (not Node.js)
- Use Deno imports: `import { serve } from "https://deno.land/std@0.168.0/http/server.ts"`
- Functions require service role key for admin operations (stored in Supabase secrets)
- All functions validate JWT tokens for authenticated endpoints

## Configuration Files

- `vite.config.js` - Vite bundler configuration with path aliases
- `tsconfig.json` - TypeScript configuration (supports .tsx files)
- `tailwind.config.js` - Tailwind CSS configuration with shadcn/ui presets
- `postcss.config.js` - PostCSS configuration for Tailwind
- `.eslintrc.cjs` - ESLint rules for React
- `package.json` - Dependencies and scripts
- `.env` - Environment variables (see `.env.example` for required variables)
