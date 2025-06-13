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
