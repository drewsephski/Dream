# Clerk Authentication Integration

This document explains how Clerk authentication has been integrated into the Deepseekdrew application.

## Setup Instructions

1. **Install the Clerk React SDK**:

   ```bash
   npm install @clerk/clerk-react@latest
   ```

2. **Environment Configuration**:

   - Create a `.env.local` file in the project root
   - Add your Clerk publishable key:
     ```
     VITE_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
     ```

3. **Provider Setup**:
   - The application is wrapped with `<ClerkProvider>` in [src/renderer.tsx](file:///Users/drewsepeczi/dyad/src/renderer.tsx)
   - The `afterSignOutUrl` is set to redirect users to the home page after signing out

## Key Components

### Authentication Components

- `SignInButton` - Renders a sign in button
- `SignUpButton` - Renders a sign up button
- `UserButton` - Renders the user profile button
- `SignedIn` - Wrapper for content shown only to signed in users
- `SignedOut` - Wrapper for content shown only to signed out users

### Custom Components

- [ProtectedRoute](file:///Users/drewsepeczi/dyad/src/components/ProtectedRoute.tsx) - A wrapper component that protects routes from unauthorized access
- [AuthStatus](file:///Users/drewsepeczi/dyad/src/components/AuthStatus.tsx) - Displays user authentication status in the UI
- [SignOutButton](file:///Users/drewsepeczi/dyad/src/components/SignOutButton.tsx) - A customizable sign out button

### Hooks

- [useAuth](file:///Users/drewsepeczi/dyad/src/hooks/useAuth.ts) - A custom hook that provides authentication state

## Protected Routes

The following routes are protected and require authentication:

- `/settings`
- `/hub`
- `/library`
- `/chat`
- `/app/$appId`

Unauthenticated users will be redirected to the `/auth` page.

## Implementation Details

1. **Root Layout**: Authentication status is displayed in the top-right corner of the application
2. **Route Protection**: Uses the `ProtectedRoute` component to wrap sensitive routes
3. **Home Route**: Redirects unauthenticated users to the authentication page
4. **Authentication Page**: Provides sign in and sign up options at `/auth`

## Getting Started

1. Create a Clerk account at [https://clerk.com](https://clerk.com)
2. Create a new application in your Clerk dashboard
3. Copy your publishable key from the API Keys section
4. Add it to your `.env.local` file
5. Run the application with `npm run start`

## Customization

You can customize the authentication flow by modifying:

- [AuthPage](file:///Users/drewsepeczi/dyad/src/pages/auth.tsx) - The authentication page component
- [ProtectedRoute](file:///Users/drewsepeczi/dyad/src/components/ProtectedRoute.tsx) - The route protection logic
- [AuthStatus](file:///Users/drewsepeczi/dyad/src/components/AuthStatus.tsx) - The authentication status display
