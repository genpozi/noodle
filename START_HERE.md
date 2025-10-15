# 🚨 START HERE - Fix "Publishable Key Not Valid" Error

## You're seeing this error because Clerk authentication needs to be configured.

### Quick Fix (5 minutes):

1. **Get Clerk API Keys**:

   - Go to https://clerk.dev
   - Sign up (free)
   - Create an application
   - Copy your API keys

2. **Update .env file**:

   - Open `.env` in this project
   - Replace `YOUR_SECRET_KEY` with your actual Clerk secret key
   - Replace `YOUR_PUBLISHABLE_KEY` with your actual Clerk publishable key
   - Save the file

3. **Restart the server**:

   ```bash
   # Stop current server (Ctrl+C)
   # Then restart:
   ~/.bun/bin/bun run dev
   ```

4. **Done!** Refresh your browser.

---

## 📖 Detailed Instructions

**Having trouble?** See the complete step-by-step guide:

👉 **[FIX_CLERK_ERROR.md](./FIX_CLERK_ERROR.md)** - Detailed walkthrough with screenshots

---

## 📚 Other Documentation

- **[QUICK_START.md](./QUICK_START.md)** - Complete setup guide
- **[CLERK_SETUP.md](./CLERK_SETUP.md)** - Detailed Clerk configuration
- **[INSTALLATION_NOTES.md](./INSTALLATION_NOTES.md)** - Full installation details
- **[CONTRIBUTING.md](./CONTRIBUTING.md)** - How to contribute

---

## ✅ What's Already Done

- ✅ Bun runtime installed
- ✅ All dependencies installed (1129 packages)
- ✅ Environment file created
- ✅ Git hooks configured
- ⚠️ **Clerk API keys needed** ← You are here

---

## 🆘 Still Need Help?

- Join Discord: https://discord.gg/ewKmQd8kYm
- Check Clerk docs: https://clerk.com/docs/quickstarts/nextjs
- Open an issue: https://github.com/noodle-run/noodle/issues
