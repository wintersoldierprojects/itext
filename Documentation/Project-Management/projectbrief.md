# 🚀 Project Vision

**Objective**: To define the complete feature set and implementation phases for a production-ready Instagram DM replica, serving as a master reference. This plan synthesizes all previous documentation into a single, coherent roadmap, aiming for the most complete and robust version of the application.

**Guiding Principle**: This document outlines the target state. All features are to be implemented or verified to be working flawlessly, addressing any past critical issues or regressions.

---

## 🎯 Core Project Vision

-   **Application**: Instagram DM-style messaging platform for CherryGifts, facilitating communication between customers (Users) and support staff (Admin).
-   **Interaction Model**:
    -   **Admin**: Manages and views all direct messages from various users in a unified dashboard. Can initiate conversations if needed (though primary flow is user-initiated).
    -   **User**: Engages in a direct message conversation exclusively with "CherryGifts Support" (representing the admin side). The admin/support contact is always visible and accessible in the user's DM list, even if no conversation has started or if the chat history was previously deleted by the user.
-   **User Experience**: A pixel-perfect Instagram DM replica characterized by its intuitive interface, native-feeling mobile animations, smooth touch interactions, and overall high polish.
-   **Technology Stack**:
    -   **Frontend**: Next.js (latest stable version, App Router) with TypeScript.
    -   **Build System**: Turbopack (configured for optimal performance and compatibility).
    -   **Styling**: Tailwind CSS, adhering to a custom Instagram Design System.
    -   **Backend**: Supabase (PostgreSQL for database, Realtime for messaging, Auth for authentication).
    -   **PWA**: Removed; offline capabilities not currently supported.
