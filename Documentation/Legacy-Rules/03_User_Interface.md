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
