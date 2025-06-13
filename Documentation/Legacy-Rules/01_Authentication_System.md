# 🔒 Authentication System

Handles secure login and session management for both Admins and Users, ensuring role-based access and data protection.

-   **Admin Authentication Flow**:
    -   **Feature**: Secure Email/Password Login (`/admin` route).
        *Description: Admins log in using dedicated credentials (`admin@cherrygifts.com`).*
    -   **Feature**: Database Role Verification.
        *Description: System queries Supabase to confirm 'admin' role post-authentication before granting dashboard access.*
    -   **Feature**: Persistent Sessions.
        *Description: Admin login is maintained across browser restarts using Supabase Auth session management.*
    -   **Feature**: Auto-Redirect to Dashboard.
        *Description: Authenticated admins attempting to access the login page are automatically redirected to `/admin/dashboard`.*
    -   **Feature**: Real-time Auth State Listening.
        *Description: UI dynamically reflects authentication status changes.*
    -   **Feature**: Transparent Access Denied Errors.
        *Description: If role verification fails, a clear error message is displayed, indicating the issue (e.g., "Access denied. Your role: user").*
-   **User Authentication Flow**:
    -   **Feature**: Instagram Username + PIN Login (`/users` route).
        *Description: Users log in with their Instagram username and a secure PIN.*
    -   **Feature**: Real-time Profile Preview.
        *Description: During username entry, a preview of the user's Instagram profile picture (if available via a mock or real service) is shown for verification.*
    -   **Feature**: Auto-Registration for New Users.
        *Description: A new user profile is automatically created in Supabase upon the first successful login if one doesn't already exist.*
    -   **Feature**: Secure PIN Handling.
        *Description: PINs are handled securely (e.g., not stored in plain text if custom auth is built on top of Supabase basic auth).*
    -   **Feature**: Persian Language Support & RTL for Login Page.
        *Description: The user login page (`/users`) is presented in Persian with appropriate Right-to-Left text direction.*
-   **General Auth Features**:
    -   **Feature**: JWT Session Management.
        *Description: Utilizes Supabase's default JWT-based session handling with automatic token refresh.*
    -   **Feature**: Middleware Route Protection.
        *Description: Next.js middleware enforces authentication and role checks for protected routes (e.g., `/admin/dashboard`, `/users/chat`).*
    -   **Feature**: Secure Logout.
        *Description: Provides a secure way for users and admins to end their sessions.*
    -   **Feature**: Enhanced Security Measures.
        *Description: Consider implementing Multi-Factor Authentication (MFA) for admins. Enforce strong password policies (min length, complexity, rotation) for admin accounts. Implement account lockout after multiple failed login attempts.*
    -   **Feature**: Detailed Error Handling & Recovery.
        *Description: Provide specific error messages for different authentication failures (e.g., invalid credentials, account locked, network issues). Implement clear recovery paths for forgotten passwords/PINs. Log authentication attempts for auditing.*
    -   **Feature**: Rate Limiting.
        *Description: Implement API rate limiting on authentication endpoints to prevent brute-force attacks and abuse.*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase A1: Supabase Auth Setup & Configuration**
    *   Task A1.1: Configure Supabase Auth settings (email/password for admin, potentially custom provider or logic for user PIN).
    *   Task A1.2: Define RLS policies for `users` table related to authentication and role checks.
    *   Task A1.3: Implement server-side helper functions for role verification if needed.
    *   Task A1.4: Configure Supabase Auth for strong password policies and account lockout settings.
2.  **Phase A2: Admin Login Implementation**
    *   Task A2.1: Create Admin login UI at `/admin`.
    *   Task A2.2: Implement login logic using Supabase Auth client.
    *   Task A2.3: Implement database role check post-login.
    *   Task A2.4: Implement auto-redirect for authenticated admins.
    *   Task A2.5: Implement persistent session handling.
    *   Task A2.6: Implement MFA setup flow for admin accounts (optional, if decided).
3.  **Phase A3: User Login & Registration Implementation**
    *   Task A3.1: Create User login UI at `/users` (Persian, RTL).
    *   Task A3.2: Implement Instagram username + PIN input.
    *   Task A3.3: Implement profile preview logic (mock or service-based).
    *   Task A3.4: Implement auto-registration logic in Supabase for new users.
    *   Task A3.5: Implement PIN verification mechanism.
    *   Task A3.6: Implement clear error messages and recovery paths for user login/registration.
4.  **Phase A4: Route Protection & Session Management**
    *   Task A4.1: Develop Next.js middleware for `/admin/dashboard` and `/users/chat` protection.
    *   Task A4.2: Implement real-time auth state listeners in the UI.
    *   Task A4.3: Implement secure logout functionality for both roles.
    *   Task A4.4: Thoroughly test all authentication flows, error handling, and edge cases.
    *   Task A4.5: Implement API rate limiting for authentication endpoints.
