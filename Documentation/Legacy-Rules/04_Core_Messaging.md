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
