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
