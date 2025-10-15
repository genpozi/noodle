# Fix "Publishable Key Not Valid" Error

## The Problem

You're seeing this error:

```
Error: Publishable key not valid.
```

This happens because the application requires **real Clerk API keys** to run, but the `.env` file currently has placeholder values.

## The Solution (5 Minutes)

Follow these exact steps to fix the error:

### Step 1: Create a Free Clerk Account

1. Open your browser and go to: **https://clerk.dev**
2. Click **"Start building for free"**
3. Sign up using:
   - GitHub (recommended - fastest)
   - Google
   - Or email

### Step 2: Create Your Application

After signing in, you'll see a setup wizard:

1. **Application Name**: Enter `Noodle Dev` (or any name you prefer)
2. **Sign-in Options**: Select at least one:
   - ✅ **Email** (recommended for testing)
   - Optional: Google, GitHub, etc.
3. Click **"Create application"**

### Step 3: Copy Your API Keys

You'll be redirected to your dashboard. You should see your API keys immediately.

If not, click **"API Keys"** in the left sidebar or visit:
**https://dashboard.clerk.com/last-active?path=api-keys**

You'll see two keys:

```
Publishable Key:  pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
Secret Key:       sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

**Copy both keys** - you'll need them in the next step.

### Step 4: Update Your .env File

1. Open the `.env` file in your project root
2. Find these two lines:

```bash
CLERK_SECRET_KEY=YOUR_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY
```

3. Replace them with your actual keys from Clerk:

```bash
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxx
```

4. **Save the file**

### Step 5: Restart the Development Server

Stop the current server (if running) and restart it:

```bash
# Stop the server (Ctrl+C in the terminal where it's running)

# Then restart:
~/.bun/bin/bun run dev
```

### Step 6: Test It Works

1. Open the application URL in your browser
2. You should now see the home page without errors
3. Try navigating to `/app` - you'll be redirected to sign in
4. Create a test account to verify everything works

## Visual Guide

Here's what you're looking for in the Clerk dashboard:

```
┌─────────────────────────────────────────────────┐
│ Clerk Dashboard - API Keys                      │
├─────────────────────────────────────────────────┤
│                                                  │
│ Publishable Key (Frontend)                      │
│ pk_test_Y2xlcmsuaW5jbHVkZWQua2l3aS05Mi5sY2... │
│ [Copy] [Show]                                   │
│                                                  │
│ Secret Key (Backend)                            │
│ sk_test_••••••••••••••••••••••••••••••••••••   │
│ [Copy] [Show]                                   │
│                                                  │
└─────────────────────────────────────────────────┘
```

## Common Mistakes

❌ **Don't do this:**

- Don't use the placeholder values (`YOUR_SECRET_KEY`)
- Don't add quotes around the keys
- Don't add spaces before or after the keys
- Don't use production keys (`pk_live_*` or `sk_live_*`) for development

✅ **Do this:**

```bash
# Correct format:
CLERK_SECRET_KEY=sk_test_abc123xyz789
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_def456uvw012
```

## Still Getting Errors?

### Error: "CLERK_SECRET_KEY is not defined"

**Solution**: Make sure you saved the `.env` file and restarted the server.

### Error: "Invalid publishable key format"

**Solution**:

- Check you copied the complete key (no truncation)
- Ensure there are no spaces or quotes
- Verify you're using the test key (starts with `pk_test_`)

### Error: "Failed to fetch"

**Solution**:

- Check your internet connection
- Verify Clerk's status at https://status.clerk.com
- Try refreshing your browser

### Server won't start

**Solution**:

```bash
# Kill any existing processes
pkill -f "next dev"

# Wait a moment
sleep 2

# Start fresh
~/.bun/bin/bun run dev
```

## What Happens After Setup?

Once Clerk is configured:

✅ You can access the application
✅ Users can sign up and sign in
✅ Authentication is fully functional
✅ Protected routes work correctly

## Next Steps

After Clerk is working:

1. **Test the app**: Create a test account and explore
2. **Configure database**: Set up NeonDB for notes/flashcards (optional)
3. **Add other services**: Upstash Redis and Resend (optional)

See [QUICK_START.md](./QUICK_START.md) for the complete setup guide.

## Security Reminder

⚠️ **Important**:

- Never commit your `.env` file to Git
- Never share your `CLERK_SECRET_KEY` publicly
- Use test keys (`sk_test_*`) for development only
- If you accidentally expose a key, regenerate it immediately in the Clerk dashboard

## Need More Help?

- 📖 Detailed Clerk guide: [CLERK_SETUP.md](./CLERK_SETUP.md)
- 🚀 Full setup guide: [QUICK_START.md](./QUICK_START.md)
- 💬 Join Discord: https://discord.gg/ewKmQd8kYm
- 📚 Clerk docs: https://clerk.com/docs/quickstarts/nextjs
