#!/bin/bash

echo "🚀 CherryGifts Chat - Quick Authentication Setup"
echo "==============================================="
echo ""

echo "📋 Setting up Supabase authentication..."
echo ""

echo "1️⃣  Opening Supabase dashboard..."
if command -v xdg-open > /dev/null; then
    xdg-open "https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/auth/users" 2>/dev/null
elif command -v open > /dev/null; then
    open "https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/auth/users" 2>/dev/null
else
    echo "   Please manually open: https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/auth/users"
fi

echo ""
echo "2️⃣  In the Supabase dashboard:"
echo "   - Click 'Add user' button"
echo "   - Email: admin@cherrygifts.com"
echo "   - Password: MySecurePassword123"
echo "   - Auto-confirm: YES ✅"
echo "   - Click 'Create user'"
echo ""

echo "3️⃣  Press ENTER when you've created the user..."
read -p ""

echo ""
echo "🚀 Starting development server..."
npm run dev &
SERVER_PID=$!

echo ""
echo "🌐 Open your browser to:"
echo "   http://localhost:3000/admin"
echo ""
echo "🔑 Login with:"
echo "   Email: admin@cherrygifts.com"
echo "   Password: MySecurePassword123"
echo ""
echo "✅ The app will automatically create your admin profile!"
echo ""
echo "Press Ctrl+C to stop the server when done."

# Keep the script running until user stops it
wait $SERVER_PID