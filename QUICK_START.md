# Quick Start Guide

## Current Status ✅

- ✅ Bun runtime installed
- ✅ Dependencies installed (1129 packages)
- ✅ Environment file created (`.env`)
- ✅ Git hooks configured
- ⚠️ **Clerk API keys needed** (see below)

## Get Started in 3 Steps

### 1. Configure Clerk Authentication (Required)

The app needs Clerk API keys to run. This takes ~5 minutes:

```bash
# 1. Visit https://clerk.dev and create a free account
# 2. Create a new application
# 3. Copy your API keys from the dashboard
# 4. Edit .env and replace these lines:

CLERK_SECRET_KEY=YOUR_SECRET_KEY                    # Replace with sk_test_xxxxx
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=YOUR_PUBLISHABLE_KEY  # Replace with pk_test_xxxxx
```

📖 **Detailed guide**: [CLERK_SETUP.md](./CLERK_SETUP.md)

### 2. Start the Development Server

```bash
~/.bun/bin/bun run dev
```

The app will be available at the URL shown in the terminal.

### 3. Test the Application

1. Visit the application URL
2. Navigate to `/app` - you'll be redirected to sign in
3. Create a test account
4. Start exploring!

## What Works Now

With just Clerk configured, you can:

- ✅ View the landing page
- ✅ Sign up and sign in
- ✅ Access authenticated routes
- ✅ View user profile

## What Needs Additional Setup

These features require additional service configuration:

- 📝 **Notes & Flashcards**: Requires NeonDB (PostgreSQL)
- 📧 **Email Notifications**: Requires Resend
- ⚡ **Rate Limiting**: Requires Upstash Redis

## Configure Additional Services (Optional)

### NeonDB (Database)

Required for: Notes, Flashcards, User data persistence

```bash
# 1. Sign up at https://neon.tech
# 2. Create a new database
# 3. Copy the connection string
# 4. Update .env:
DATABASE_URL=postgresql://user:password@host/database

# 5. Push the database schema:
~/.bun/bin/bun run db:push
```

### Upstash Redis (Caching)

Required for: Rate limiting, session management

```bash
# 1. Sign up at https://upstash.com
# 2. Create a Redis database
# 3. Copy REST URL and token
# 4. Update .env:
UPSTASH_REDIS_REST_URL=https://your-db.upstash.io
UPSTASH_REDIS_REST_TOKEN=your_token
```

### Resend (Email)

Required for: Email notifications, password resets

```bash
# 1. Sign up at https://resend.com
# 2. Get your API key
# 3. Update .env:
RESEND_API_KEY=re_your_api_key
```

## Remove Environment Validation Skip

Once all services are configured, remove this line from `.env`:

```bash
# Remove this line:
SKIP_ENV_VALIDATION=true
```

This ensures all required environment variables are properly validated.

## Useful Commands

```bash
# Development
~/.bun/bin/bun run dev              # Start dev server
~/.bun/bin/bun run build            # Build for production
~/.bun/bin/bun run start            # Start production server

# Database
~/.bun/bin/bun run db:push          # Push schema to database
~/.bun/bin/bun run db:studio        # Open database GUI
~/.bun/bin/bun run db:generate      # Generate migrations

# Code Quality
~/.bun/bin/bun run lint             # Run linter
~/.bun/bin/bun run format           # Format code
~/.bun/bin/bun run typecheck        # Type check

# Email Development
~/.bun/bin/bun run email:dev        # Preview emails (port 3001)
```

## Troubleshooting

### "Publishable key not valid"

You need to configure Clerk API keys. See [CLERK_SETUP.md](./CLERK_SETUP.md)

### "bun: command not found"

Use the full path: `~/.bun/bin/bun` or add to PATH:

```bash
export PATH="$HOME/.bun/bin:$PATH"
```

### Port already in use

Change the port:

```bash
PORT=3001 ~/.bun/bin/bun run dev
```

### Database connection errors

Ensure your DATABASE_URL is correct and the database is accessible.

## Next Steps

1. ✅ Configure Clerk (required)
2. 🚀 Start the dev server
3. 📝 Configure NeonDB for full functionality
4. 🎨 Start building features!

## Resources

- [Full Installation Notes](./INSTALLATION_NOTES.md)
- [Clerk Setup Guide](./CLERK_SETUP.md)
- [Contributing Guide](./CONTRIBUTING.md)
- [Discord Community](https://discord.gg/ewKmQd8kYm)
- [GitHub Repository](https://github.com/noodle-run/noodle)

## Need Help?

- Check [INSTALLATION_NOTES.md](./INSTALLATION_NOTES.md) for detailed setup
- Review [CLERK_SETUP.md](./CLERK_SETUP.md) for authentication issues
- Join the [Discord community](https://discord.gg/ewKmQd8kYm)
- Open an issue on [GitHub](https://github.com/noodle-run/noodle/issues)
