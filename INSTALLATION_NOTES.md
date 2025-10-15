# Noodle Installation Summary

## ✅ Installation Complete

The Noodle application has been successfully installed with recommended settings.

## What Was Done

### 1. Dependencies Installed

- **Bun Runtime**: Installed at `~/.bun/bin/bun` (v1.3.0)
- **Project Dependencies**: All 1129 packages installed successfully
- **Git Hooks**: Husky hooks prepared for commit linting

### 2. Environment Configuration

- Created `.env` file from `.env.example` template
- Added detailed comments for each required service
- Set `SKIP_ENV_VALIDATION=true` for development without external services

### 3. Development Server

- Server running on port 3000
- Access URL: [https://3000--0199e7db-14d5-7853-aa83-8653caf71127.us-east-1-01.gitpod.dev](https://3000--0199e7db-14d5-7853-aa83-8653caf71127.us-east-1-01.gitpod.dev)
- Running with Turbopack for faster development

## ⚠️ REQUIRED: Configure Clerk Authentication

**The application will not run without valid Clerk API keys.**

### Quick Setup (5 minutes)

1. **Create Clerk Account**: Visit [https://clerk.dev](https://clerk.dev) and sign up
2. **Create Application**: Follow the prompts to create a new application
3. **Get API Keys**: Copy your Publishable Key and Secret Key from the dashboard
4. **Update .env**: Replace `YOUR_SECRET_KEY` and `YOUR_PUBLISHABLE_KEY` with your actual keys
5. **Restart Server**: Stop and restart the development server

📖 **Detailed instructions**: See [CLERK_SETUP.md](./CLERK_SETUP.md)

## Optional External Services

### 1. **NeonDB** (PostgreSQL Database)

- Sign up: https://neon.tech
- Create a new database
- Copy connection string to `DATABASE_URL` in `.env`
- Run migrations: `~/.bun/bin/bun run db:push`
- **Note**: Required for database features (notes, flashcards)

### 2. **Upstash Redis** (Caching/Rate Limiting)

- Sign up: https://upstash.com
- Create a Redis database
- Copy credentials to `.env`:
  - `UPSTASH_REDIS_REST_URL`
  - `UPSTASH_REDIS_REST_TOKEN`

### 3. **Resend** (Email Service)

- Sign up: https://resend.com
- Get API key from dashboard
- Copy to `RESEND_API_KEY` in `.env`

## Available Commands

```bash
# Development
~/.bun/bin/bun run dev              # Start dev server with Turbopack
~/.bun/bin/bun run build            # Build for production
~/.bun/bin/bun run start            # Start production server

# Database
~/.bun/bin/bun run db:push          # Push schema changes to database
~/.bun/bin/bun run db:studio        # Open Drizzle Studio (database GUI)
~/.bun/bin/bun run db:generate      # Generate migrations
~/.bun/bin/bun run db:migrate       # Run migrations

# Code Quality
~/.bun/bin/bun run lint             # Run ESLint
~/.bun/bin/bun run format           # Format with Prettier
~/.bun/bin/bun run typecheck        # TypeScript type checking

# Email Development
~/.bun/bin/bun run email:dev        # Preview emails at localhost:3001
```

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Runtime**: Bun
- **Styling**: TailwindCSS + Radix UI
- **Database**: PostgreSQL (NeonDB) + Drizzle ORM
- **Auth**: Clerk
- **API**: tRPC
- **Caching**: Upstash Redis
- **Email**: Resend + React Email

## Next Steps

1. **Configure External Services**: Set up the required services listed above
2. **Update .env**: Replace placeholder values with real credentials
3. **Run Database Migrations**: `~/.bun/bin/bun run db:push`
4. **Remove SKIP_ENV_VALIDATION**: Once all services are configured, remove this from your environment
5. **Start Development**: Begin working on features!

## Recommended Development Workflow

1. Create an issue on GitHub before starting work
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Make changes and test locally
4. Run linting: `~/.bun/bin/bun run lint`
5. Format code: `~/.bun/bin/bun run format`
6. Commit with conventional commits (Husky will enforce this)
7. Push and create a pull request

## Additional Resources

- [Contributing Guide](./CONTRIBUTING.md)
- [Code of Conduct](./CODE_OF_CONDUCT.md)
- [Discord Community](https://discord.gg/ewKmQd8kYm)
- [Project Repository](https://github.com/noodle-run/noodle)

## Notes

- The application is currently in MVP development
- Main features being built: Note Taking & Flashcards
- Future features planned: Calendar, Task Management, Grade Tracking
- This is a work-in-progress, not a finished product

## Troubleshooting

### Bun Command Not Found

If `bun` command doesn't work, use the full path: `~/.bun/bin/bun`
Or add to PATH: `export PATH="$HOME/.bun/bin:$PATH"`

### Environment Validation Errors

Use `SKIP_ENV_VALIDATION=true` prefix for commands during initial setup

### Database Connection Issues

Ensure your NeonDB connection string is correct and the database is accessible

### Port Already in Use

Change the port: `PORT=3001 ~/.bun/bin/bun run dev`
