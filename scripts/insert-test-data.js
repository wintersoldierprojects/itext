const { createClient } = require('@supabase/supabase-js');

// Ensure these environment variables are set in your .env file or similar
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://tlgiqnqdtnowmciilnba.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRsZ2lxbnFkdG5vd21jaWlsbmJhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk0MTg5ODIsImV4cCI6MjA2NDk5NDk4Mn0.qF2w9StacVZZj7U578N_HrhGbsZvEPASBThaJkWjzYI';

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function main() {
  console.log('🚀 Starting test data insertion script...');

  try {
    // 1. Get existing admin and user
    console.log('\n🔍 Fetching user data...');
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .in('email', ['admin@cherrygifts.com', 'mehradworld@example.com']);

    if (usersError) {
      console.error('❌ Error fetching users:', usersError.message);
      return;
    }

    const adminUser = users.find(u => u.email === 'admin@cherrygifts.com');
    const regularUser = users.find(u => u.email === 'mehradworld@example.com');

    if (!adminUser) {
      console.error('❌ Admin user (admin@cherrygifts.com) not found.');
      return;
    }
    if (!regularUser) {
      console.error('❌ Regular user (mehradworld@example.com) not found.');
      return;
    }

    console.log(`✅ Found Admin: ${adminUser.email} (ID: ${adminUser.id})`);
    console.log(`✅ Found User: ${regularUser.email} (ID: ${regularUser.id})`);

    // 2. Create a conversation
    console.log('\n🤝 Creating a new conversation...');
    const initialLastMessageContent = "Hi, I'm interested in your cherry gift boxes";
    const initialLastMessageAt = new Date(Date.now() - 10 * 60 * 1000).toISOString(); // 10 minutes ago

    const { data: newConversation, error: createConvError } = await supabase
      .from('conversations')
      .insert({
        user_id: regularUser.id,
        admin_id: adminUser.id,
        is_active: true,
        last_message_at: initialLastMessageAt,
        last_message_content: initialLastMessageContent, // Placeholder, will be updated
        unread_count: 1, // User sent the first message
      })
      .select()
      .single();

    if (createConvError) {
      console.error('❌ Error creating conversation:', createConvError.message);
      return;
    }
    console.log(`✅ Conversation created (ID: ${newConversation.id})`);

    // 3. Insert realistic messages
    console.log('\n💬 Inserting messages...');
    const messagesToInsert = [
      {
        sender_id: regularUser.id,
        content: initialLastMessageContent,
        is_admin: false,
        message_type: 'text',
        created_at: initialLastMessageAt,
      },
      {
        sender_id: adminUser.id,
        content: "Hello! I'd be happy to help you with our cherry gift boxes. What would you like to know?",
        is_admin: true,
        message_type: 'text',
        created_at: new Date(Date.now() - 8 * 60 * 1000).toISOString(), // 8 minutes ago
      },
      {
        sender_id: regularUser.id,
        content: "What sizes are available?",
        is_admin: false,
        message_type: 'text',
        created_at: new Date(Date.now() - 7 * 60 * 1000).toISOString(), // 7 minutes ago
      },
      {
        sender_id: adminUser.id,
        content: "We have three sizes: Small (500g), Medium (1kg), and Large (2kg).",
        is_admin: true,
        message_type: 'text',
        created_at: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
      },
      {
        sender_id: regularUser.id,
        content: "Perfect! How much is the medium box?",
        is_admin: false,
        message_type: 'text',
        created_at: new Date(Date.now() - 4 * 60 * 1000).toISOString(), // 4 minutes ago
      },
      {
        sender_id: adminUser.id,
        content: "The medium box is $25. You can find more details on our product page: https://cherrygifts.com/products/medium-box",
        is_admin: true,
        message_type: 'text', // Or 'link' if you have specific link handling
        created_at: new Date(Date.now() - 2 * 60 * 1000).toISOString(), // 2 minutes ago
      },
      {
        sender_id: regularUser.id,
        content: "Great, I'll take one!",
        is_admin: false,
        message_type: 'text',
        created_at: new Date(Date.now() - 1 * 60 * 1000).toISOString(), // 1 minute ago
      },
    ];

    for (const msg of messagesToInsert) {
      const { error: msgError } = await supabase
        .from('messages')
        .insert({
          ...msg,
          conversation_id: newConversation.id,
          // Assuming 'sent' is the default status. Add 'delivered_at' or 'read_at' if needed.
        });

      if (msgError) {
        console.error(`❌ Error inserting message "${msg.content.substring(0,20)}...":`, msgError.message);
      } else {
        console.log(`✅ Message inserted: "${msg.content.substring(0,30)}..."`);
      }
    }

    // 4. Update conversation's last_message_at and last_message_content
    console.log("\n🔄 Updating conversation's last message details...");
    const lastMessage = messagesToInsert[messagesToInsert.length - 1];
    const { error: updateConvError } = await supabase
      .from('conversations')
      .update({
        last_message_at: lastMessage.created_at,
        last_message_content: lastMessage.content,
        unread_count: lastMessage.is_admin ? 0 : 1, // If last message is from user, admin has 1 unread
      })
      .eq('id', newConversation.id);

    if (updateConvError) {
      console.error('❌ Error updating conversation last message details:', updateConvError.message);
    } else {
      console.log('✅ Conversation last message details updated.');
    }

    console.log('\n🎉 Test data insertion script completed successfully!');
    console.log(`🔗 You should now see this conversation in the admin dashboard for user ${regularUser.email}.`);
    console.log('👉 Run `node cherrygifts-chat/scripts/insert-test-data.js` to execute this script.');

  } catch (error) {
    console.error('❌ An unexpected error occurred:', error);
  }
}

main();
