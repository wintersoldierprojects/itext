// Centralized, optimized mock data for demo mode
export const mockConversations = [
  {
    id: '1',
    user_id: 'mock-user-1',
    admin_id: 'admin-id',
    last_message_at: new Date().toISOString(),
    last_message_content: 'Hello, I need help with my order',
    unread_count: 2,
    is_active: true,
    created_at: new Date(Date.now() - 86400000).toISOString(),
    updated_at: new Date().toISOString(),
    admin: null,
    user: {
      id: 'mock-user-1',
      full_name: 'Sarah Johnson',
      instagram_username: 'sarahjohnson',
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=sarah',
      is_online: true,
      last_seen: new Date().toISOString(),
      email: 'sarah.j@example.com',
      role: 'user' as const,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '2',
    user_id: 'mock-user-2',
    admin_id: 'admin-id',
    last_message_at: new Date(Date.now() - 3600000).toISOString(),
    last_message_content: 'Thank you for your response!',
    unread_count: 0,
    is_active: true,
    created_at: new Date(Date.now() - 172800000).toISOString(),
    updated_at: new Date(Date.now() - 3600000).toISOString(),
    admin: null,
    user: {
      id: 'mock-user-2',
      full_name: 'Michael Chen',
      instagram_username: 'mikechen',
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=michael',
      is_online: false,
      last_seen: new Date(Date.now() - 3600000).toISOString(),
      email: 'michael.c@example.com',
      role: 'user' as const,
      created_at: new Date(Date.now() - 172800000).toISOString(),
      updated_at: new Date(Date.now() - 3600000).toISOString()
    }
  },
  {
    id: '3',
    user_id: 'mock-user-3',
    admin_id: 'admin-id',
    last_message_at: new Date(Date.now() - 7200000).toISOString(),
    last_message_content: 'Is this product available?',
    unread_count: 1,
    is_active: true,
    created_at: new Date(Date.now() - 259200000).toISOString(),
    updated_at: new Date(Date.now() - 7200000).toISOString(),
    admin: null,
    user: {
      id: 'mock-user-3',
      full_name: 'Emma Wilson',
      instagram_username: 'emmawilson',
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=emma',
      is_online: true,
      last_seen: new Date().toISOString(),
      email: 'emma.w@example.com',
      role: 'user' as const,
      created_at: new Date(Date.now() - 259200000).toISOString(),
      updated_at: new Date().toISOString()
    }
  },
  {
    id: '4',
    user_id: 'mock-user-4',
    admin_id: 'admin-id',
    last_message_at: new Date(Date.now() - 14400000).toISOString(),
    last_message_content: 'Great service, thanks!',
    unread_count: 0,
    is_active: false,
    created_at: new Date(Date.now() - 604800000).toISOString(),
    updated_at: new Date(Date.now() - 14400000).toISOString(),
    admin: null,
    user: {
      id: 'mock-user-4',
      full_name: 'David Martinez',
      instagram_username: 'davidm',
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=david',
      is_online: false,
      last_seen: new Date(Date.now() - 14400000).toISOString(),
      email: 'david.m@example.com',
      role: 'user' as const,
      created_at: new Date(Date.now() - 604800000).toISOString(),
      updated_at: new Date(Date.now() - 14400000).toISOString()
    }
  },
  {
    id: '5',
    user_id: 'mock-user-5',
    admin_id: 'admin-id',
    last_message_at: new Date(Date.now() - 28800000).toISOString(),
    last_message_content: 'When will my order ship?',
    unread_count: 3,
    is_active: true,
    created_at: new Date(Date.now() - 1209600000).toISOString(),
    updated_at: new Date(Date.now() - 28800000).toISOString(),
    admin: null,
    user: {
      id: 'mock-user-5',
      full_name: 'Lisa Anderson',
      instagram_username: 'lisaanderson',
      profile_picture_url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=lisa',
      is_online: false,
      last_seen: new Date(Date.now() - 28800000).toISOString(),
      email: 'lisa.a@example.com',
      role: 'user' as const,
      created_at: new Date(Date.now() - 1209600000).toISOString(),
      updated_at: new Date(Date.now() - 28800000).toISOString()
    }
  }
];

// Mock messages for demo conversations
export const mockMessages = {
  '1': [
    {
      id: 'msg-1-1',
      conversation_id: '1',
      sender_id: 'mock-user-1',
      content: 'Hi, I placed an order yesterday but haven\'t received a confirmation email',
      message_type: 'text' as const,
      sent_at: new Date(Date.now() - 86400000).toISOString(),
      delivered_at: new Date(Date.now() - 86400000).toISOString(),
      read_at: null,
      is_admin: false,
      created_at: new Date(Date.now() - 86400000).toISOString(),
      status: 'delivered' as const, // Added status
      sender: { id: 'mock-user-1', instagram_username: 'sarahjohnson', role: 'user' as const, email: 'sarah.j@example.com', full_name: 'Sarah Johnson', is_online: true, last_seen: new Date().toISOString(), profile_picture_url: '', created_at: '', updated_at: '' } // Added sender
    },
    {
      id: 'msg-1-2',
      conversation_id: '1',
      sender_id: 'admin-id',
      content: 'Hello Sarah! Let me check your order status for you.',
      message_type: 'text' as const,
      sent_at: new Date(Date.now() - 85000000).toISOString(),
      delivered_at: new Date(Date.now() - 85000000).toISOString(),
      read_at: new Date(Date.now() - 84000000).toISOString(),
      is_admin: true,
      created_at: new Date(Date.now() - 85000000).toISOString(),
      status: 'read' as const, // Added status
      sender: { id: 'admin-id', instagram_username: 'Admin', role: 'admin' as const, email: 'admin@cherrygifts.com', full_name: 'Admin User', is_online: true, last_seen: new Date().toISOString(), profile_picture_url: '', created_at: '', updated_at: '' } // Added sender
    },
    {
      id: 'msg-1-3',
      conversation_id: '1',
      sender_id: 'mock-user-1',
      content: 'Hello, I need help with my order',
      message_type: 'text' as const,
      sent_at: new Date().toISOString(),
      delivered_at: new Date().toISOString(),
      read_at: null,
      is_admin: false,
      created_at: new Date().toISOString(),
      status: 'delivered' as const, // Added status
      sender: { id: 'mock-user-1', instagram_username: 'sarahjohnson', role: 'user' as const, email: 'sarah.j@example.com', full_name: 'Sarah Johnson', is_online: true, last_seen: new Date().toISOString(), profile_picture_url: '', created_at: '', updated_at: '' } // Added sender
    }
  ],
  '2': [
    {
      id: 'msg-2-1',
      conversation_id: '2',
      sender_id: 'mock-user-2',
      content: 'I received my order today. Everything looks perfect!',
      message_type: 'text' as const,
      sent_at: new Date(Date.now() - 7200000).toISOString(),
      delivered_at: new Date(Date.now() - 7200000).toISOString(),
      read_at: new Date(Date.now() - 7000000).toISOString(),
      is_admin: false,
      created_at: new Date(Date.now() - 7200000).toISOString(),
      status: 'read' as const, // Added status
      sender: { id: 'mock-user-2', instagram_username: 'mikechen', role: 'user' as const, email: 'michael.c@example.com', full_name: 'Michael Chen', is_online: false, last_seen: new Date(Date.now() - 3600000).toISOString(), profile_picture_url: '', created_at: '', updated_at: '' } // Added sender
    },
    {
      id: 'msg-2-2',
      conversation_id: '2',
      sender_id: 'admin-id',
      content: 'That\'s wonderful to hear! Thank you for your purchase.',
      message_type: 'text' as const,
      sent_at: new Date(Date.now() - 6000000).toISOString(),
      delivered_at: new Date(Date.now() - 6000000).toISOString(),
      read_at: new Date(Date.now() - 5000000).toISOString(),
      is_admin: true,
      created_at: new Date(Date.now() - 6000000).toISOString(),
      status: 'read' as const, // Added status
      sender: { id: 'admin-id', instagram_username: 'Admin', role: 'admin' as const, email: 'admin@cherrygifts.com', full_name: 'Admin User', is_online: true, last_seen: new Date().toISOString(), profile_picture_url: '', created_at: '', updated_at: '' } // Added sender
    },
    {
      id: 'msg-2-3',
      conversation_id: '2',
      sender_id: 'mock-user-2',
      content: 'Thank you for your response!',
      message_type: 'text' as const,
      sent_at: new Date(Date.now() - 3600000).toISOString(),
      delivered_at: new Date(Date.now() - 3600000).toISOString(),
      read_at: new Date(Date.now() - 3500000).toISOString(),
      is_admin: false,
      created_at: new Date(Date.now() - 3600000).toISOString(),
      status: 'read' as const, // Added status
      sender: { id: 'mock-user-2', instagram_username: 'mikechen', role: 'user' as const, email: 'michael.c@example.com', full_name: 'Michael Chen', is_online: false, last_seen: new Date(Date.now() - 3600000).toISOString(), profile_picture_url: '', created_at: '', updated_at: '' } // Added sender
    }
  ]
};
