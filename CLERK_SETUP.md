# Clerk Authentication Setup Guide

## Current Status

⚠️ **The application requires valid Clerk API keys to run.**

The error you're seeing (`Publishable key not valid`) means the placeholder values in `.env` need to be replaced with real Clerk credentials.

## Quick Setup (5 minutes)

### Step 1: Create a Clerk Account

1. Go to [https://clerk.dev](https://clerk.dev)
2. Click "Start building for free"
3. Sign up with your preferred method (GitHub, Google, or email)

### Step 2: Create an Application

1. After signing in, you'll be prompted to create your first application
2. Enter an application name (e.g., "Noodle Development")
3. Choose your preferred sign-in methods:
   - **Recommended for development**: Email + Password
   - **Optional**: Add Google, GitHub, etc.
4. Click "Create application"

### Step 3: Get Your API Keys

1. You'll be redirected to the dashboard
2. Navigate to **API Keys** page or visit: [https://dashboard.clerk.com/last-active?path=api-keys](https://dashboard.clerk.com/last-active?path=api-keys)
3. You'll see two keys:
   - **Publishable Key** (starts with `pk_test_` or `pk_live_`)
   - **Secret Key** (starts with `sk_test_` or `sk_live_`)

### Step 4: Update Your .env File

1. Open `.env` in your project root
2. Replace the placeholder values:

```bash
# Replace these lines:
CLERK_SECRET_KEY=YOUR_SECRET_KEY
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY

# With your actual keys from Clerk dashboard:
CLERK_SECRET_KEY=sk_test_xxxxxxxxxxxxxxxxxxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxxxxxxxxxxxxxxxxxx
```

3. Save the file

### Step 5: Restart the Development Server

```bash
# Stop the current server (Ctrl+C if running)
# Then restart:
~/.bun/bin/bun run dev
```

## Verification

Once configured correctly, you should be able to:

1. Visit the application URL
2. See the home page without errors
3. Navigate to `/app` routes and be redirected to sign-in
4. Create a test account and sign in

## Current Clerk Configuration

The Noodle application is already properly configured with:

✅ **Middleware** (`src/middleware.ts`):

- Uses `clerkMiddleware()` from `@clerk/nextjs/server`
- Protects `/app/*` routes
- Allows public access to other routes

✅ **ClerkProvider** (`src/app/(dashboard)/layout.tsx`):

- Wraps dashboard routes with authentication
- Custom theme configuration (dark mode with pink accent)

✅ **Environment Variables**:

- Proper variable names following Clerk's conventions
- Sign-in/sign-up URLs configured
- Redirect URLs set to `/app`

## Troubleshooting

### "Publishable key not valid" Error

**Cause**: The `.env` file contains placeholder values instead of real Clerk keys.

**Solution**: Follow Steps 1-5 above to get and configure real keys.

### "CLERK_SECRET_KEY is not defined" Error

**Cause**: Environment variables aren't being loaded.

**Solution**:

1. Ensure `.env` file is in the project root (not `.env.example`)
2. Restart your development server
3. Check that `.env` is not in `.gitignore` (it should be!)

### Keys Not Working After Update

**Solution**:

1. Verify you copied the complete key (no spaces or line breaks)
2. Ensure you're using test keys (`sk_test_` and `pk_test_`) for development
3. Restart the development server completely
4. Clear browser cache and try again

### Still Having Issues?

1. Check Clerk's status page: [https://status.clerk.com](https://status.clerk.com)
2. Review Clerk's Next.js docs: [https://clerk.com/docs/quickstarts/nextjs](https://clerk.com/docs/quickstarts/nextjs)
3. Join Noodle's Discord: [https://discord.gg/ewKmQd8kYm](https://discord.gg/ewKmQd8kYm)

## Security Notes

⚠️ **IMPORTANT**:

- Never commit `.env` to version control
- Never share your `CLERK_SECRET_KEY` publicly
- Use test keys (`sk_test_*`) for development
- Use live keys (`sk_live_*`) only for production
- Rotate keys immediately if accidentally exposed

## Additional Clerk Features

Once set up, you can configure:

- **User Profile**: Customize user profile fields
- **Email Templates**: Customize verification and notification emails
- **Social Connections**: Add OAuth providers (Google, GitHub, etc.)
- **Multi-Factor Auth**: Enable 2FA for enhanced security
- **Webhooks**: Sync user data with your database
- **Organizations**: Enable team/workspace features

Access these in your Clerk Dashboard after initial setup.
