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
    *   Task A3.7: Implement API rate limiting for authentication endpoints.
4.  **Phase A4: Route Protection & Session Management**
    *   Task A4.1: Develop Next.js middleware for `/admin/dashboard` and `/users/chat` protection.
    *   Task A4.2: Implement real-time auth state listeners in the UI.
    *   Task A4.3: Implement secure logout functionality for both roles.
    *   Task A4.4: Thoroughly test all authentication flows, error handling, and edge cases.
    *   Task A4.5: Implement API rate limiting for authentication endpoints.

### II. 🖥️ Admin Dashboard (`/admin/dashboard`)

The central hub for admins to manage customer conversations, designed as a pixel-perfect Instagram DM replica.

-   **UI & Layout**:
    -   **Feature**: Pure Instagram DM Interface.
        *Description: Full-width layout, no traditional sidebars, mimicking the Instagram mobile DM experience.*
    -   **Feature**: Conversation List.
        *Description: Displays all user conversations in Instagram-style sidebar, sorted by the most recent message. Each item shows user avatar, username, last message snippet, and timestamp.*
    -   **Feature**: Full-Screen Chat View.
        *Description: Selecting a conversation transitions to a full-screen chat interface for that specific user.*
    -   **Feature**: Responsive Design.
        *Description: While mobile-first, the layout adapts gracefully to desktop and tablet screen sizes, potentially showing list and chat side-by-side on larger screens if desired (though primary spec is mobile replica).*
-   **Conversation Management**:
    -   **Feature**: Real-time Conversation Search.
        *Description: Admin can search existing conversations by username, full name, or message content, with results filtering in real-time.*
    -   **Feature**: Unread Message Indicators.
        *Description: Conversations with unread messages are visually distinct (e.g., bolded text, Instagram-blue dot, unread count badge).*
    -   **Feature**: Admin-Specific Message Bubble Styling.
        *Description: Messages sent by the admin appear with a light gray background (`#EFEFEF`) and black text.*
-   **User Monitoring**:
    -   **Feature**: User Online Status Display.
        *Description: Visual cues (e.g., green dot for online, "last seen" for offline) indicate a user's current presence. Offline users show a "last seen" timestamp.*
-   **Performance & Scalability**:
    -   **Feature**: Optimized for Large Volumes.
        *Description: Conversation list and chat view are optimized to handle thousands of messages and hundreds of conversations without performance degradation.*
    -   **Feature**: Batch Operations (Admin).
        *Description: Ability for admins to perform bulk actions on conversations (e.g., mark all as read, archive multiple, delete multiple).*
    -   **Feature**: Conversation Archival/Deletion.
        *Description: Admins can archive old conversations to de-clutter the active list or permanently delete conversations (with confirmation).*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase AD1: Basic Layout & Navigation**
    *   Task AD1.1: Implement the main Admin Dashboard page at `/admin/dashboard`.
    *   Task AD1.2: Create the full-width conversation list view component.
    *   Task AD1.3: Create the full-screen chat view component (placeholder content initially).
    *   Task AD1.4: Implement navigation between the conversation list and the full-screen chat view (e.g., slide transitions).
2.  **Phase AD2: Conversation List Features**
    *   Task AD2.1: Fetch and display all user conversations from Supabase, sorted by `last_message_at`.
    *   Task AD2.2: Implement real-time updates for the conversation list (new messages, status changes).
    *   Task AD2.3: Implement unread message indicators (bolding, dot, count).
    *   Task AD2.4: Implement real-time conversation search functionality.
    *   Task AD2.5: Style conversation list items to match Instagram (avatar, username, snippet, timestamp).
3.  **Phase AD3: Full-Screen Chat View Integration**
    *   Task AD3.1: When a conversation is selected, populate the full-screen chat view with its messages.
    *   Task AD3.2: Integrate core messaging features (see Section IV) into this view for the admin.
    *   Task AD3.3: Implement admin-specific message bubble styling.
4.  **Phase AD4: User Monitoring Features**
    *   Task AD4.1: Integrate user online status display into the conversation list and chat header.
    *   Task AD4.2: Ensure "last seen" timestamps are accurate and update in real-time.

### III. 📱 User Interface (`/users/chat`)

The customer-facing chat interface, providing a direct line to CherryGifts Support.

-   **UI & Layout**:
    -   **Feature**: Simplified Instagram DM Interface.
        *Description: Users experience a focused interface, visually consistent with the Instagram DM style.*
    -   **Feature**: Single Conversation with "CherryGifts Support".
        *Description: The user's chat list always displays one primary conversation thread with "CherryGifts Support". This contact is persistently visible, even if no messages have been exchanged or if the user previously cleared their chat.*
    -   **Feature**: Identical Full-Screen Chat UI as Admin.
        *Description: The actual chat messaging view (bubbles, input, header) is visually and functionally consistent with what the admin sees, ensuring a familiar experience.*
    -   **Feature**: Persian Language & RTL Support.
        *Description: The chat interface at `/users/chat` is presented in Persian with full Right-to-Left text direction and UI mirroring.*
-   **Messaging**:
    -   **Feature**: User-Specific Message Bubble Styling.
        *Description: Messages sent by the user appear with an Instagram-blue background (`#0095F6`) and white text.*
    -   **Feature**: Search Within Support Conversation.
        *Description: Users can search for specific text within their ongoing conversation with support.*
-   **Accessibility & Localization**:
    -   **Feature**: Accessibility Compliance (WCAG).
        *Description: Ensure the UI is accessible to users with disabilities, including screen reader support, keyboard navigation, and proper ARIA attributes.*
    -   **Feature**: Extended Localization Support.
        *Description: While Persian is primary, design components to easily adapt to other RTL/LTR languages and cultural nuances.*
    -   **Feature**: Error State Designs.
        *Description: Implement clear and user-friendly visual feedback for various error states (e.g., network issues, message send failures, invalid input).*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase UI1: Basic Layout & Navigation**
    *   Task UI1.1: Implement the main User chat page at `/users/chat`.
    *   Task UI1.2: Design the UI to always show the "CherryGifts Support" conversation item.
    *   Task UI1.3: Ensure clicking this item opens the full-screen chat view.
    *   Task UI1.4: Implement Persian language and RTL layout for this entire section.
2.  **Phase UI2: Chat View Integration**
    *   Task UI2.1: Populate the chat view with the message history between the user and admin.
    *   Task UI2.2: Integrate core messaging features (see Section IV) into this view for the user.
    *   Task UI2.3: Implement user-specific message bubble styling.
3.  **Phase UI3: User-Specific Features**
    *   Task UI3.1: Implement the "Search Within Support Conversation" functionality.
    *   Task UI3.2: Ensure the "CherryGifts Support" contact is always present and accessible.

### IV. 💬 Core Messaging & Chat Features (Applies to Admin & User)

The fundamental real-time communication capabilities.

-   **Real-time Communication**:
    -   **Feature**: Sub-100ms Real-Time Message Delivery.
        *Description: Messages are sent and received with very low latency using Supabase Realtime.*
    -   **Feature**: Real-time Typing Indicators.
        *Description: Users and admins can see when the other party is typing (e.g., animated dots, "User/Support is typing..." text). Supports multi-user indicators if admin is viewing a list where multiple users might be typing in different chats.*
    -   **Feature**: Real-time Message Status Updates.
        *Description: Changes to message status (delivered, read) are reflected instantly for the sender.*
-   **Message Functionality**:
    -   **Feature**: Message Status System.
        *Description: Clear visual indicators for message status: Sent (single gray tick ✓), Delivered (double gray ticks ✓✓), Read (double Instagram-blue ticks ✓✓).*
    -   **Feature**: Message Reactions.
        *Description: Users and admins can react to messages with 6 standard emojis (❤️👍😂😮😢😡). Reactions are typically triggered by a long-press on a message or a double-tap for a default 'heart' reaction.*
    -   **Feature**: Link Detection & Clickable Previews.
        *Description: URLs in messages are automatically detected, styled as clickable links, and may show a basic preview if implemented.*
    -   **Feature**: Message Timestamps.
        *Description: Messages display relative timestamps (e.g., "2m ago", "Yesterday"). Hovering (on desktop) or tapping (on mobile) might show the exact date and time. Date separators group messages by day.*
    -   **Feature**: Message Pagination / Virtual Scrolling.
        *Description: Efficiently handles and displays long conversation histories (1000+ messages) without performance degradation, loading older messages as the user scrolls up.*
-   **Notifications (Primarily Admin-focused, User PWA notifications in Sec VI)**:
    -   **Feature**: New Message Audio Alerts (Admin).
        *Description: Admin receives an optional audio notification when a new message arrives.*
    -   **Feature**: Desktop Push Notifications for New Messages (Admin - Infrastructure).
        *Description: System is capable of sending browser push notifications to the admin for new messages (requires user permission).*
-   **Reliability & Edge Cases**:
    -   **Feature**: Message Delivery Guarantees.
        *Description: Implement mechanisms (e.g., acknowledgments, retry logic) to ensure messages are delivered even with transient network issues.*
    -   **Feature**: Message Validation & Limits.
        *Description: Enforce message size limits and content validation (e.g., character count, allowed formats) to prevent abuse and ensure data integrity.*
    -   **Feature**: Network Failure Handling.
        *Description: Gracefully handle network disconnections, queueing outgoing messages and displaying appropriate UI feedback.*
    -   **Feature**: Race Condition Prevention.
        *Description: Implement strategies (e.g., optimistic locking, unique message IDs) to prevent data inconsistencies during concurrent operations.*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase CM1: Basic Message Sending/Receiving**
    *   Task CM1.1: Implement function to send a message (updates Supabase, triggers real-time event).
    *   Task CM1.2: Implement `useMessages` hook to subscribe to Supabase real-time updates for new/updated messages in a conversation.
    *   Task CM1.3: Display sent and received messages in the chat UI with correct styling for user and admin.
2.  **Phase CM2: Typing Indicators**
    *   Task CM2.1: Implement logic to detect when a user/admin starts and stops typing in the message input.
    *   Task CM2.2: Broadcast typing status via Supabase Realtime.
    *   Task CM2.3: Display typing indicators in the chat UI.
3.  **Phase CM3: Message Status System**
    *   Task CM3.1: Update message records in Supabase with `delivered_at` and `read_at` timestamps.
    *   Task CM3.2: Implement logic for marking messages as delivered (when received by client) and read (when visible in chat UI or explicitly marked).
    *   Task CM3.3: Display sent, delivered, and read tick indicators on messages.
    *   Task CM3.4: Ensure status updates are propagated in real-time.
4.  **Phase CM4: Advanced Message Features**
    *   Task CM4.1: Implement message reactions UI (picker, display) and backend logic (store reactions in Supabase).
    *   Task CM4.2: Implement link detection in message content and render them as clickable links (with basic preview if feasible).
    *   Task CM4.3: Implement message timestamps with relative formatting and date separators.
5.  **Phase CM5: Performance & Notifications**
    *   Task CM5.1: Implement message pagination/virtual scrolling in the `MessageList` component.
    *   Task CM5.2: Implement audio alerts for new messages for the admin.
    *   Task CM5.3: Set up infrastructure for desktop push notifications (admin).

### V. 🎨 UI/UX, Animations & Mobile Experience

Ensuring the application not only functions like Instagram DMs but also feels like it.

-   **Visual Design**:
    -   **Feature**: Pixel-Perfect Instagram Styling.
        *Description: Adherence to Instagram's color palette (blues, grays, black, white, accents), spacing, and typography as defined in `INSTAGRAM-DESIGN-GUIDE.md`.*
    -   **Feature**: Instagram Iconography.
        *Description: Use of icons that match or are stylistically similar to those used in Instagram DMs.*
    -   **Feature**: Loading Skeletons & Shimmer Effects.
        *Description: Instagram-style loading placeholders for conversations and messages to improve perceived performance.*
-   **Animations**:
    -   **Feature**: Smooth Page Transitions.
        *Description: Native-feeling slide transitions (e.g., conversation list to full chat) using appropriate easing curves (e.g., `cubic-bezier(0.25, 0.46, 0.45, 0.94)` for iOS feel), typically 300ms.*
    -   **Feature**: Message Send/Receive Animations.
        *Description: Messages slide up and fade in when sent or received (approx. 250ms duration).*
    -   **Feature**: Micro-interactions.
        *Description: Subtle animations for button presses (e.g., scale down to 0.95), hover states, and other small interactions to provide feedback.*
    -   **Feature**: 60fps Performance Target.
        *Description: All animations and transitions are optimized to run smoothly at 60 frames per second, utilizing GPU acceleration where possible.*
-   **Mobile & Touch Interactions**:
    -   **Feature**: Touch-Optimized Interface.
        *Description: All interactive elements have minimum touch targets of 44x44px.*
    -   **Feature**: Gesture Support.
        *Description: Includes swipe gestures (e.g., on conversation items for actions), double-tap (e.g., for heart reaction), long-press (e.g., for reaction picker), and pull-to-refresh in chat views.*
    -   **Feature**: Haptic Feedback.
        *Description: Use of device vibration to provide tactile feedback for key interactions, simulating a native app feel (e.g., light for taps, medium for message send).*
    -   **Feature**: Safe Area Handling for Notched Devices.
        *Description: UI correctly adapts to screen notches and home indicators on modern mobile devices using `env(safe-area-inset-*)` CSS variables.*
    -   **Feature**: Responsive Layouts for Mobile/Tablet/Desktop.
        *Description: While primarily a mobile DM replica, the layout should be usable on tablet and desktop, potentially offering different views (e.g., split view on desktop).*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase UX1: Design System Implementation**
    *   Task UX1.1: Implement the Instagram color palette from `INSTAGRAM-DESIGN-GUIDE.md` in Tailwind CSS configuration and global CSS.
    *   Task UX1.2: Define and apply consistent typography and spacing throughout the app.
    *   Task UX1.3: Create or source Instagram-style icons.
2.  **Phase UX2: Core Animations**
    *   Task UX2.1: Implement page transition animations (slide left/right).
    *   Task UX2.2: Implement message send/receive animations (slide up/fade in).
    *   Task UX2.3: Implement micro-interactions for buttons and interactive elements.
    *   Task UX2.4: Implement loading skeletons and shimmer effects for lists and message areas.
3.  **Phase UX3: Mobile & Touch Interactions**
    *   Task UX3.1: Develop `useTouchInteractions` hook for swipe, double-tap, long-press.
    *   Task UX3.2: Integrate gestures into conversation items and message bubbles.
    *   Task UX3.3: Implement haptic feedback for key interactions.
    *   Task UX3.4: Implement pull-to-refresh functionality for chat views.
4.  **Phase UX4: Responsiveness & Polish**
    *   Task UX4.1: Ensure all UI elements have adequate touch targets.
    *   Task UX4.2: Implement CSS for safe area insets.
    *   Task UX4.3: Test and refine layouts across mobile, tablet, and desktop breakpoints.
    *   Task UX4.4: Conduct thorough animation performance testing to ensure 60fps.
    *   Task UX4.5: Implement A/B testing for key UI elements and interactions.
    *   Task UX4.6: Add dark mode support and ensure all components adapt correctly.

### VI. ⚙️ PWA (Progressive Web App) & Offline Capabilities

Making the application installable, fast, and reliable, even with poor network conditions.

-   **Core PWA**:
    -   **Feature**: App Installability (Add to Home Screen).
        *Description: Users can install the CherryGifts Chat app to their device's home screen.*
    -   **Feature**: Service Worker for Caching & Offline.
        *Description: Utilizes Serwist to manage caching strategies (NetworkFirst for API calls, CacheFirst for static assets) and enable offline functionality.*
    -   **Feature**: Web App Manifest.
        *Description: `manifest.json` configured with app name, icons, theme colors, display mode, etc.*
    -   **Feature**: Custom App Icons & Splash Screen.
        *Description: Branded icons for various resolutions and a custom splash screen for a native-like launch experience (as per `public/icons/generate-icons.md`).*
-   **Offline Functionality**:
    -   **Feature**: Offline Message Queuing.
        *Description: Messages composed by the user while offline are queued locally and automatically sent when network connectivity is restored.*
    -   **Feature**: Local Caching of Messages & User Profiles.
        *Description: Recently viewed conversations and user profile data are cached using IndexedDB (via Serwist or custom logic) for faster loads and offline access.*
    -   **Feature**: Offline Fallback Page.
        *Description: A custom page (`/offline`) is displayed when the user is offline and tries to access a non-cached resource.*
    -   **Feature**: Cache Invalidation Strategy.
        *Description: Mechanisms to ensure cached data is updated appropriately without being stale.*
    -   **Feature**: Cache Warming on Startup.
        *Description: Potentially pre-cache essential data or assets when the app starts or service worker activates.*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase PWA1: Serwist Setup & Basic PWA Configuration**
    *   Task PWA1.1: Install and configure `@serwist/next`.
    *   Task PWA1.2: Create `app/sw.ts` service worker file.
    *   Task PWA1.3: Configure `next.config.ts` for Serwist.
    *   Task PWA1.4: Create and configure `public/manifest.json` with app details and icons.
    *   Task PWA1.5: Generate and add all required PWA icon sizes.
2.  **Phase PWA2: Caching Strategies**
    *   Task PWA2.1: Implement `defaultCache` strategies in `app/sw.ts`.
    *   Task PWA2.2: Add custom runtime caching for Supabase API calls (NetworkFirst).
    *   Task PWA2.3: Add caching for static assets (images, fonts - CacheFirst).
    *   Task PWA2.4: Implement caching for chat messages (e.g., NetworkFirst or custom IndexedDB solution).
3.  **Phase PWA3: Offline Functionality**
    *   Task PWA3.1: Create the `/offline` fallback page.
    *   Task PWA3.2: Configure Serwist fallbacks in `app/sw.ts`.
    *   Task PWA3.3: Implement offline message queuing system (e.g., using IndexedDB or `localStorage`).
    *   Task PWA3.4: Implement logic to sync queued messages when online.
    *   Task PWA3.5: Implement cache size limits and eviction policies for IndexedDB.
    *   Task PWA3.6: Add background sync for reliable offline data submission.
4.  **Phase PWA4: Advanced PWA Features & Testing**
    *   Task PWA4.1: Implement cache invalidation and cache warming strategies.
    *   Task PWA4.2: Set up infrastructure for Push Notifications (actual sending might be a separate feature).
    *   Task PWA4.3: Test PWA installability, offline access, and background sync thoroughly.
    *   Task PWA4.4: Optimize PWA for Lighthouse scores (Performance, PWA, Accessibility).

### VII. 🛠️ Technical Infrastructure & Performance

The underlying systems ensuring the app is robust, scalable, and maintainable.

-   **Backend & Database (Supabase)**:
    -   **Feature**: Robust Database Schema.
        *Description: Well-structured tables for `users`, `conversations`, `messages`, `typing_indicators`, `reactions` with appropriate relationships, constraints, and indexes (as per `mcp-setup-guide.md` and `TECHNICAL-SETUP.md`).*
    -   **Feature**: Row Level Security (RLS) Policies.
        *Description: Secure data access enforced at the database level, ensuring users can only access their own data and admins have appropriate privileges.*
    -   **Feature**: Real-time Subscriptions for Data Sync.
        *Description: Supabase Realtime used for live updates to messages, conversation lists, typing status, online presence, and reactions.*
    -   **Feature**: Optimized Database Queries.
        *Description: All database queries are designed for performance, aiming for <100ms response times, utilizing indexes effectively.*
    -   **Feature**: Connection Pooling & Singleton Client.
        *Description: Efficient management of Supabase client instances to optimize connections and prevent resource exhaustion.*
-   **Frontend Architecture**:
    -   **Feature**: Next.js with App Router.
        *Description: Utilizing the latest Next.js features for routing, server components, and client components.*
    -   **Feature**: TypeScript for Type Safety.
        *Description: Full TypeScript coverage across the codebase for improved maintainability and fewer runtime errors.*
    -   **Feature**: Tailwind CSS for Styling.
        *Description: Utility-first CSS framework for rapid UI development, configured with the Instagram design system.*
    -   **Feature**: Turbopack for Build System.
        *Description: Mandated use of Turbopack for fast development builds and optimized production bundles.*
    -   **Feature**: Modular Component Structure.
        *Description: UI broken down into small, reusable, and composable components, organized logically (e.g., `components/instagram`, `components/chat`).*
-   **Performance & Reliability**:
    -   **Feature**: Comprehensive Error Handling & Boundaries.
        *Description: React Error Boundaries and try-catch blocks used throughout to gracefully handle errors and prevent app crashes.*
    -   **Feature**: Optimistic UI Updates.
        *Description: UI updates immediately upon user action (e.g., sending a message), with server confirmation happening in the background, providing a responsive feel.*
    -   **Feature**: Connection Health Monitoring & Auto-Recovery.
        *Description: System actively monitors WebSocket connection status and attempts automatic reconnection with exponential backoff upon failure.*
    -   **Feature**: Performance Monitoring Dashboard (Admin).
        *Description: A dedicated section (`/admin/metrics`) for admins to view real-time performance metrics like message latency, FPS, memory usage, and error rates.*
    -   **Feature**: Code Splitting & Lazy Loading.
        *Description: Next.js default code splitting and strategic lazy loading of components/images to improve initial page load times.*

ALL Features:
###
Step by Step, well documented Phases and Tasks.

1.  **Phase TI1: Backend Setup & Schema**
    *   Task TI1.1: Execute `supabase-setup.sql` (via MCP or manually) to create all tables, RLS policies, and database functions.
    *   Task TI1.2: Verify entire schema, RLS, and real-time publications are correctly set up in Supabase.
    *   Task TI1.3: Implement singleton pattern for Supabase client (`lib/supabase.ts`).
2.  **Phase TI2: Frontend Core Architecture**
    *   Task TI2.1: Ensure Next.js project is correctly configured with App Router, TypeScript, and Tailwind CSS.
    *   Task TI2.2: Configure Turbopack as the default build system and optimize its settings.
    *   Task TI2.3: Establish a clear and modular component structure.
3.  **Phase TI3: Real-time Integration & Error Handling**
    *   Task TI3.1: Implement the `SupabaseRealtimeManager` (from WebSocket solution plan) for robust connection handling.
    *   Task TI3.2: Integrate this manager into all hooks requiring real-time data (`useMessages`, `useUserStatus`, `useReactions`, `useTyping`).
    *   Task TI3.3: Implement React Error Boundaries at key points in the application.
    *   Task TI3.4: Ensure optimistic UI updates are correctly reconciled with server responses.
4.  **Phase TI4: Performance Systems**
    *   Task TI4.1: Develop the performance data collection mechanisms (`lib/performance.ts`).
    *   Task TI4.2: Create the Admin Performance Monitoring Dashboard (`/admin/metrics`).
    *   Task TI4.3: Implement connection health UI indicators (using `ConnectionStatus` component).
    *   Task TI4.4: Review and optimize critical database queries for performance.
    *   Task TI4.5: Implement comprehensive logging and centralized log management.
    *   Task TI4.6: Define and implement disaster recovery and backup strategies for the database.
