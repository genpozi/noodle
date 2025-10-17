# Noodle Codebase Review & Recommendations

**Review Date**: October 17, 2025  
**Reviewer**: Ona (AI Code Analysis)  
**Codebase Version**: Main branch (commit fba6bc6)  
**Overall Assessment**: 6/10 - Solid MVP foundation, needs production hardening

---

## Executive Summary

Noodle is a well-structured Next.js 14 application with excellent TypeScript usage and modern patterns. The codebase demonstrates good understanding of React Server Components, tRPC, and type-safe development. However, it requires significant improvements in scalability, testing, and production-readiness before handling real user traffic.

### Key Strengths

✅ Clean Next.js 14 App Router architecture  
✅ Excellent type safety with TypeScript and Zod  
✅ Proper authentication with Clerk  
✅ Modern tech stack (tRPC, Drizzle ORM, React Query)  
✅ Consistent code style and formatting

### Critical Issues

❌ No pagination (will fail at scale)  
❌ Missing database indexes  
❌ No rate limiting on public endpoints  
❌ No testing infrastructure  
❌ Missing service layer architecture  
❌ No error boundaries or loading states

---

## 1. CRITICAL ISSUES (Fix Immediately)

### 1.1 Pagination Missing

**Problem**: `getUserModules()` fetches ALL modules without limit

```typescript
// Current code (src/server/routers/modules.ts:45-52)
getUserModules: protectedProcedure.query(async ({ ctx }) => {
  return ctx.db.query.modulesTable.findMany({
    where: (t, { eq }) => eq(t.user_id, userId),
    orderBy: (t, { desc }) => desc(t.lastVisited),
  });
});
```

**Impact**: Will crash or timeout when users have 100+ modules

**Solution**:

```typescript
getUserModules: protectedProcedure
  .input(
    z.object({
      limit: z.number().min(1).max(100).default(20),
      cursor: z.string().uuid().optional(),
    }),
  )
  .query(async ({ ctx, input }) => {
    const { limit, cursor } = input;

    const modules = await ctx.db.query.modulesTable.findMany({
      where: (t, { eq, and, lt }) =>
        cursor
          ? and(eq(t.user_id, userId), lt(t.lastVisited, cursorDate))
          : eq(t.user_id, userId),
      orderBy: (t, { desc }) => desc(t.lastVisited),
      limit: limit + 1,
    });

    const hasMore = modules.length > limit;
    const items = hasMore ? modules.slice(0, -1) : modules;

    return {
      items,
      nextCursor: hasMore ? items[items.length - 1].id : undefined,
    };
  });
```

**Priority**: 🔴 CRITICAL - Implement before adding more features

---

### 1.2 Missing Database Indexes

**Problem**: Queries on `user_id` and `lastVisited` have no indexes

**Impact**: Slow queries as data grows, potential database performance issues

**Solution**:

```typescript
// src/db/schema/modules.ts
export const modulesTable = pgTable(
  'modules',
  {
    // ... existing fields
  },
  (table) => ({
    userIdIdx: index('modules_user_id_idx').on(table.user_id),
    lastVisitedIdx: index('modules_last_visited_idx').on(table.lastVisited),
    userLastVisitedIdx: index('modules_user_last_visited_idx').on(
      table.user_id,
      table.lastVisited,
    ),
  }),
);
```

Then generate and run migration:

```bash
bun run db:generate
bun run db:push
```

**Priority**: 🔴 CRITICAL - Add before production

---

### 1.3 No Rate Limiting

**Problem**: Public endpoints (early access) have no rate limiting

**Current code** (src/server/routers/early-access.ts:161-227):

```typescript
joinEarlyAccess: publicProcedure
  .input(/* ... */)
  .mutation(async ({ ctx, input }) => {
    // No rate limiting!
    await db.insert(earlyAccessTable).values(/* ... */);
    await resend.emails.send(/* ... */);
  });
```

**Impact**: Vulnerable to spam, abuse, and DoS attacks

**Solution**:

```typescript
// src/lib/rate-limit.ts
import { redis } from './redis';

export async function rateLimit(
  identifier: string,
  limit: number = 5,
  window: number = 60,
): Promise<{ success: boolean; remaining: number }> {
  const key = `rate_limit:${identifier}`;
  const count = await redis.incr(key);

  if (count === 1) {
    await redis.expire(key, window);
  }

  return {
    success: count <= limit,
    remaining: Math.max(0, limit - count),
  };
}

// In router:
joinEarlyAccess: publicProcedure
  .input(/* ... */)
  .mutation(async ({ ctx, input }) => {
    const { success } = await rateLimit(`early_access:${input.email}`, 3, 3600);

    if (!success) {
      throw new TRPCError({
        code: 'TOO_MANY_REQUESTS',
        message: 'Too many requests. Please try again later.',
      });
    }

    // ... rest of logic
  });
```

**Priority**: 🔴 CRITICAL - Implement before public launch

---

### 1.4 No Error Boundaries

**Problem**: No `error.tsx` files in any routes

**Impact**: Unhandled errors crash the entire app instead of showing error UI

**Solution**:

```typescript
// src/app/error.tsx
'use client';

import { useEffect } from 'react';
import { Button } from '@/primitives/button';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4">
      <h2 className="text-2xl font-bold">Something went wrong!</h2>
      <p className="text-foreground-muted">{error.message}</p>
      <Button onClick={reset}>Try again</Button>
    </div>
  );
}

// src/app/(dashboard)/app/error.tsx
// Similar error boundary for dashboard routes

// src/app/loading.tsx
export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
    </div>
  );
}
```

**Priority**: 🔴 CRITICAL - Add before production

---

## 2. HIGH PRIORITY ISSUES

### 2.1 Missing Service Layer

**Problem**: Business logic embedded in tRPC routers

**Example** (src/server/routers/early-access.ts:81-158):

- 150+ lines of email validation logic in router
- No reusability
- Hard to test
- Violates single responsibility principle

**Solution**:

```typescript
// src/services/email/email-validator.service.ts
export class EmailValidatorService {
  private readonly nonHumanDomains = [
    /* ... */
  ];
  private readonly automatedKeywords = [
    /* ... */
  ];

  isLikelyHuman(email: string, threshold = 30): boolean {
    return this.scoreEmail(email) < threshold;
  }

  private scoreEmail(email: string): number {
    // Extract validation logic here
  }
}

// src/services/early-access/early-access.service.ts
export class EarlyAccessService {
  constructor(
    private db: Database,
    private emailValidator: EmailValidatorService,
    private emailService: EmailService,
  ) {}

  async joinEarlyAccess(data: JoinEarlyAccessInput): Promise<void> {
    if (!this.emailValidator.isLikelyHuman(data.email)) {
      throw new ValidationError('Invalid email address');
    }

    await this.db.insert(earlyAccessTable).values(data);
    await this.emailService.sendEarlyAccessConfirmation(data);
  }
}

// In router:
joinEarlyAccess: publicProcedure
  .input(/* ... */)
  .mutation(async ({ ctx, input }) => {
    const service = new EarlyAccessService(
      ctx.db,
      emailValidator,
      emailService,
    );
    await service.joinEarlyAccess(input);
  });
```

**Priority**: 🟠 HIGH - Implement before adding more features

---

### 2.2 No Optimistic Updates

**Problem**: All mutations use `router.refresh()` causing full page reloads

**Example** (src/app/(dashboard)/app/\_components/create-module-popover.tsx:111):

```typescript
onSuccess: () => {
  router.refresh(); // ❌ Forces full page refresh
  setOpen(false);
};
```

**Impact**: Poor UX, slow interactions, unnecessary server load

**Solution**:

```typescript
const utils = api.useUtils();

const createModule = api.modules.create.useMutation({
  onMutate: async (newModule) => {
    // Cancel outgoing refetches
    await utils.modules.getUserModules.cancel();

    // Snapshot previous value
    const previous = utils.modules.getUserModules.getData();

    // Optimistically update
    utils.modules.getUserModules.setData(undefined, (old) => [
      {
        ...newModule,
        id: crypto.randomUUID(), // Temporary ID
        createdAt: new Date(),
        modifiedAt: new Date(),
        lastVisited: new Date(),
        archived: false,
      },
      ...(old ?? []),
    ]);

    return { previous };
  },
  onError: (err, newModule, context) => {
    // Rollback on error
    utils.modules.getUserModules.setData(undefined, context?.previous);
  },
  onSettled: () => {
    // Refetch to ensure consistency
    utils.modules.getUserModules.invalidate();
  },
});
```

**Priority**: 🟠 HIGH - Significantly improves UX

---

### 2.3 Inconsistent Error Handling

**Problem**: Mix of `TRPCError` and `Error`, inconsistent patterns

**Examples**:

```typescript
// modules.ts:127 - ❌ Wrong
throw new Error('Module not found');

// modules.ts:23-26 - ✅ Correct
throw new TRPCError({
  code: 'BAD_REQUEST',
  message: 'Module not found',
});
```

**Solution**: Create error handling utilities

```typescript
// src/lib/errors.ts
export class AppError extends Error {
  constructor(
    public code: string,
    message: string,
    public statusCode: number = 500,
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export class NotFoundError extends AppError {
  constructor(resource: string) {
    super('NOT_FOUND', `${resource} not found`, 404);
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = 'Unauthorized') {
    super('UNAUTHORIZED', message, 401);
  }
}

// Usage:
if (!existingModule) {
  throw new NotFoundError('Module');
}
```

**Priority**: 🟠 HIGH - Improves debugging and error tracking

---

### 2.4 No Caching Strategy

**Problem**: Every request hits the database, no caching layer

**Solution**:

```typescript
// src/lib/cache.ts
import { redis } from './redis';

export async function getCached<T>(
  key: string,
  fetcher: () => Promise<T>,
  ttl: number = 300,
): Promise<T> {
  const cached = await redis.get(key);

  if (cached) {
    return JSON.parse(cached as string);
  }

  const data = await fetcher();
  await redis.setex(key, ttl, JSON.stringify(data));

  return data;
}

// Usage in router:
getUserModules: protectedProcedure.query(async ({ ctx }) => {
  const userId = ctx.user.id;
  const cacheKey = `modules:${userId}`;

  return getCached(
    cacheKey,
    async () => {
      return ctx.db.query.modulesTable.findMany({
        where: (t, { eq }) => eq(t.user_id, userId),
        orderBy: (t, { desc }) => desc(t.lastVisited),
      });
    },
    60,
  ); // Cache for 60 seconds
});
```

**Priority**: 🟠 HIGH - Reduces database load

---

## 3. MEDIUM PRIORITY ISSUES

### 3.1 No Testing Infrastructure

**Problem**: Zero tests found in codebase

**Impact**: No confidence in refactoring, high risk of regressions

**Solution**:

```typescript
// vitest.config.ts
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'happy-dom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});

// src/test/setup.ts
import '@testing-library/jest-dom';

// Example test: src/services/email/__tests__/email-validator.test.ts
import { describe, it, expect } from 'vitest';
import { EmailValidatorService } from '../email-validator.service';

describe('EmailValidatorService', () => {
  const validator = new EmailValidatorService();

  it('should identify human emails', () => {
    expect(validator.isLikelyHuman('john.doe@gmail.com')).toBe(true);
  });

  it('should reject bot emails', () => {
    expect(validator.isLikelyHuman('noreply@example.com')).toBe(false);
  });
});

// Example integration test: src/server/routers/__tests__/modules.test.ts
import { describe, it, expect, beforeEach } from 'vitest';
import { createCaller } from '@/server';
import { createTestContext } from '@/test/helpers';

describe('modules router', () => {
  let caller: ReturnType<typeof createCaller>;

  beforeEach(() => {
    const ctx = createTestContext();
    caller = createCaller(ctx);
  });

  it('should create a module', async () => {
    const module = await caller.modules.create({
      name: 'Test Module',
      code: 'TEST101',
      credits: 10,
    });

    expect(module).toHaveProperty('id');
    expect(module.name).toBe('Test Module');
  });
});
```

**Priority**: 🟡 MEDIUM - Essential for long-term maintainability

---

### 3.2 Large Component Files

**Problem**: `create-module-popover.tsx` is 369 lines

**Solution**: Split into smaller components

```typescript
// src/app/(dashboard)/app/_components/create-module/
//   index.tsx (main component)
//   ModuleForm.tsx (form logic)
//   ColorPicker.tsx (color selection)
//   IconPicker.tsx (icon selection)
//   useModuleForm.ts (form hook)
```

**Priority**: 🟡 MEDIUM - Improves maintainability

---

### 3.3 No Monitoring/Observability

**Problem**: No error tracking, logging, or performance monitoring

**Solution**:

```typescript
// src/lib/monitoring.ts
import * as Sentry from '@sentry/nextjs';

export function initMonitoring() {
  if (process.env.NODE_ENV === 'production') {
    Sentry.init({
      dsn: process.env.SENTRY_DSN,
      tracesSampleRate: 0.1,
      environment: process.env.NODE_ENV,
    });
  }
}

// src/lib/logger.ts
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: {
    target: 'pino-pretty',
    options: {
      colorize: true,
    },
  },
});

// Usage:
logger.info({ userId, moduleId }, 'Module created');
logger.error({ error, userId }, 'Failed to create module');
```

**Priority**: 🟡 MEDIUM - Critical for production debugging

---

### 3.4 Synchronous Email Sending

**Problem**: Email sending blocks request completion

**Current** (src/server/routers/early-access.ts:212-226):

```typescript
await resend.emails.send({
  from: 'Noodle <contact@noodle.run>',
  to: email,
  subject: "You are on Noodle's early access list!",
  react: EarlyAccessJoinedEmail({ name, email }),
});
```

**Impact**: Slow API responses, poor UX

**Solution**: Use background jobs

```typescript
// src/lib/queue.ts
import { Queue } from 'bullmq';
import { redis } from './redis';

export const emailQueue = new Queue('emails', {
  connection: {
    host: redis.options.url,
  },
});

// src/workers/email.worker.ts
import { Worker } from 'bullmq';
import { resend } from '@/lib/resend';

new Worker(
  'emails',
  async (job) => {
    const { to, subject, react } = job.data;
    await resend.emails.send({ to, subject, react });
  },
  {
    connection: { host: redis.options.url },
  },
);

// In router:
await emailQueue.add('early-access', {
  to: email,
  subject: "You are on Noodle's early access list!",
  react: EarlyAccessJoinedEmail({ name, email }),
});
```

**Priority**: 🟡 MEDIUM - Improves API performance

---

## 4. LOW PRIORITY / NICE TO HAVE

### 4.1 Feature Flags

```typescript
// src/lib/feature-flags.ts
export const features = {
  flashcards: false,
  notebooks: false,
  aiGeneration: false,
} as const;

export function isFeatureEnabled(feature: keyof typeof features): boolean {
  return features[feature];
}
```

### 4.2 Analytics

```typescript
// src/lib/analytics.ts
export function trackEvent(event: string, properties?: Record<string, any>) {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', event, properties);
  }
}
```

### 4.3 Better TypeScript Types

```typescript
// src/types/branded.ts
export type ModuleId = string & { readonly __brand: 'ModuleId' };
export type UserId = string & { readonly __brand: 'UserId' };

// Usage:
function getModule(id: ModuleId) {
  // Type-safe module ID
}
```

---

## 5. ARCHITECTURE RECOMMENDATIONS

### 5.1 Proposed Folder Structure

```
src/
├── app/                    # Next.js App Router
├── components/             # Shared components
│   ├── ui/                # Primitives (current primitives/)
│   └── features/          # Feature-specific components
├── features/              # Feature modules
│   ├── modules/
│   │   ├── components/
│   │   ├── hooks/
│   │   ├── services/
│   │   └── types/
│   ├── notes/
│   └── flashcards/
├── lib/                   # Utilities
│   ├── api/              # API clients
│   ├── cache/            # Caching utilities
│   ├── errors/           # Error classes
│   └── validators/       # Validation utilities
├── server/               # tRPC server
│   ├── routers/
│   ├── services/         # Business logic
│   └── repositories/     # Data access
└── types/                # Shared types
```

### 5.2 Data Flow Pattern

```
User Action
    ↓
Component (UI)
    ↓
tRPC Client
    ↓
tRPC Router (thin layer)
    ↓
Service Layer (business logic)
    ↓
Repository Layer (data access)
    ↓
Database
```

---

## 6. SECURITY AUDIT

### Current Security Posture: 7/10

✅ **Good**:

- Clerk authentication properly integrated
- Protected routes via middleware
- Input validation with Zod
- No dangerous patterns (eval, dangerouslySetInnerHTML)
- Security ESLint plugin enabled
- Environment variables properly validated

⚠️ **Needs Improvement**:

- No CSRF protection
- No rate limiting
- No request size limits
- No SQL injection tests (Drizzle should handle this)
- No security headers configured

**Recommendations**:

```typescript
// next.config.js
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN',
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff',
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin',
  },
];

module.exports = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: securityHeaders,
      },
    ];
  },
};
```

---

## 7. PERFORMANCE OPTIMIZATION

### Current Issues:

1. **No Image Optimization**: Some images not using Next.js Image
2. **Large Bundle**: 369-line component loaded on every page
3. **No Code Splitting**: No dynamic imports
4. **Side Menu Re-fetching**: Fetches modules on every navigation

### Recommendations:

```typescript
// 1. Use Next.js Image everywhere
import Image from 'next/image';

<Image
  src="/logo.svg"
  alt="Noodle"
  width={75}
  height={75}
  priority
/>

// 2. Dynamic imports for heavy components
const CreateModulePopover = dynamic(
  () => import('./_components/create-module-popover'),
  { loading: () => <Skeleton /> }
);

// 3. React Query configuration
export const trpc = createTRPCReact<AppRouter>({
  overrides: {
    useMutation: {
      async onSuccess(opts) {
        await opts.originalFn();
        await opts.queryClient.invalidateQueries();
      },
    },
  },
});

// 4. Add stale time to reduce refetches
const modules = api.modules.getUserModules.useQuery(undefined, {
  staleTime: 5 * 60 * 1000, // 5 minutes
  cacheTime: 10 * 60 * 1000, // 10 minutes
});
```

---

## 8. MISSING MVP FEATURES

According to README.md, these features are planned but not implemented:

### 8.1 Notes/Notebooks

**Status**: Placeholder UI exists, no backend

**Required**:

- Database schema for notebooks and notes
- tRPC routers for CRUD operations
- Rich text editor integration (TipTap or similar)
- File attachments support
- Search functionality

### 8.2 Flashcards

**Status**: Placeholder UI exists, no backend

**Required**:

- Database schema for flashcards
- AI generation from notes (as mentioned in README)
- Spaced repetition algorithm
- Quiz interface
- Progress tracking

### 8.3 Future Features (Not Started)

- Calendar integration
- Task management
- Grade tracking

---

## 9. DEPLOYMENT CHECKLIST

Before deploying to production:

### Infrastructure

- [ ] Set up production database (NeonDB)
- [ ] Configure Redis (Upstash)
- [ ] Set up email service (Resend)
- [ ] Configure Clerk for production
- [ ] Set up CDN for static assets
- [ ] Configure backup strategy

### Code

- [ ] Implement pagination
- [ ] Add database indexes
- [ ] Add rate limiting
- [ ] Implement error boundaries
- [ ] Add loading states
- [ ] Set up monitoring (Sentry)
- [ ] Add logging infrastructure
- [ ] Implement caching strategy

### Security

- [ ] Add security headers
- [ ] Configure CORS properly
- [ ] Set up rate limiting
- [ ] Add request size limits
- [ ] Review and test authentication flows
- [ ] Set up secrets management

### Testing

- [ ] Write unit tests for services
- [ ] Write integration tests for API
- [ ] Write E2E tests for critical flows
- [ ] Load testing
- [ ] Security testing

### Documentation

- [ ] API documentation
- [ ] Deployment guide
- [ ] Runbook for common issues
- [ ] Architecture decision records

---

## 10. PRIORITIZED ACTION PLAN

### Phase 1: Critical Fixes (Week 1)

**Goal**: Make the app production-ready

1. ✅ Add pagination to all list queries
2. ✅ Create and apply database indexes
3. ✅ Implement rate limiting
4. ✅ Add error boundaries and loading states
5. ✅ Fix inconsistent error handling

**Estimated Effort**: 20-30 hours

### Phase 2: Architecture Improvements (Week 2-3)

**Goal**: Improve maintainability and scalability

1. ✅ Extract service layer
2. ✅ Implement optimistic updates
3. ✅ Add caching strategy
4. ✅ Set up monitoring and logging
5. ✅ Implement background jobs for emails

**Estimated Effort**: 30-40 hours

### Phase 3: Testing & Quality (Week 4)

**Goal**: Ensure code quality and reliability

1. ✅ Set up testing infrastructure
2. ✅ Write unit tests for services
3. ✅ Write integration tests for API
4. ✅ Add E2E tests for critical flows
5. ✅ Set up CI/CD pipeline

**Estimated Effort**: 25-35 hours

### Phase 4: Feature Development (Week 5+)

**Goal**: Implement MVP features

1. ✅ Implement notebooks/notes feature
2. ✅ Implement flashcards feature
3. ✅ Add AI generation for flashcards
4. ✅ Implement search functionality
5. ✅ Add file attachments

**Estimated Effort**: 60-80 hours

---

## 11. TECHNICAL DEBT SCORE

| Category      | Debt Level         | Impact                |
| ------------- | ------------------ | --------------------- |
| Architecture  | 🟡 Medium          | Service layer needed  |
| Testing       | 🔴 High            | No tests at all       |
| Performance   | 🟡 Medium          | No optimization       |
| Security      | 🟠 Medium-High     | Missing rate limiting |
| Scalability   | 🔴 High            | No pagination/caching |
| Documentation | 🟡 Medium          | Minimal docs          |
| **Overall**   | 🟠 **Medium-High** | **Needs attention**   |

---

## 12. CONCLUSION

### Summary

Noodle has a **solid foundation** with modern technologies and good TypeScript practices. However, it requires **significant work** before being production-ready. The codebase shows good understanding of Next.js patterns but lacks production-grade features like testing, monitoring, and scalability considerations.

### Recommended Approach

1. **Don't add new features yet** - Fix critical issues first
2. **Focus on Phase 1** - Make it production-ready
3. **Then Phase 2** - Improve architecture
4. **Then Phase 3** - Add testing
5. **Finally Phase 4** - Build MVP features

### Estimated Timeline

- **Minimum viable production**: 2-3 weeks (Phases 1-2)
- **Production-ready with tests**: 4-5 weeks (Phases 1-3)
- **Full MVP**: 8-10 weeks (All phases)

### Key Takeaway

> The codebase is well-structured for an MVP but needs production hardening before scaling. Focus on pagination, caching, testing, and monitoring before adding more features.

---

## Resources

- [Next.js Best Practices](https://nextjs.org/docs/app/building-your-application/routing/loading-ui-and-streaming)
- [tRPC Error Handling](https://trpc.io/docs/server/error-handling)
- [Drizzle ORM Indexes](https://orm.drizzle.team/docs/indexes-constraints)
- [React Query Optimistic Updates](https://tanstack.com/query/latest/docs/react/guides/optimistic-updates)
- [Rate Limiting with Redis](https://redis.io/docs/manual/patterns/rate-limiter/)

---

**Review completed by**: Ona (AI Code Analysis)  
**Date**: October 17, 2025  
**Next review recommended**: After Phase 1 completion
