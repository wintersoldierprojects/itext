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
