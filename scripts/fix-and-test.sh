#!/bin/bash

echo "🔧 Fixing Supabase Database Issues"
echo "=================================="
echo ""

echo "1️⃣  Opening Supabase SQL Editor..."
if command -v xdg-open > /dev/null; then
    xdg-open "https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/sql/new" 2>/dev/null
elif command -v open > /dev/null; then
    open "https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/sql/new" 2>/dev/null
else
    echo "   Please manually open: https://supabase.com/dashboard/project/tlgiqnqdtnowmciilnba/sql/new"
fi

echo ""
echo "2️⃣  Copy this SQL and run it in Supabase:"
echo "----------------------------------------"
cat scripts/fix-database.sql
echo "----------------------------------------"
echo ""

echo "3️⃣  Press ENTER after running the SQL in Supabase..."
read -p ""

echo ""
echo "4️⃣  Testing the fix..."
node scripts/test-supabase.js

echo ""
echo "5️⃣  If tests pass, starting dev server..."
echo "   npm run dev"
echo "   Test login at: http://localhost:3000/admin"
echo "   Credentials: admin@cherrygifts.com / MySecurePassword123"