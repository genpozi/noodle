import { createRouter, protectedProcedure } from '../trpc';
import {
  insertModuleSchema,
  modulesTable,
  selectModuleSchema,
} from '@/db/schema';
import { TRPCError } from '@trpc/server';
import { DrizzleError, and, eq } from 'drizzle-orm';
import { z } from 'zod';

export const modulesRouter = createRouter({
  getById: protectedProcedure
    .input(selectModuleSchema.pick({ id: true }))
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      try {
        const userModule = await ctx.db.query.modulesTable.findFirst({
          where: (t, { and, eq }) =>
            and(eq(t.id, input.id), eq(t.user_id, userId)),
        });

        if (!userModule) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: 'Module not found',
          });
        }

        return userModule;
      } catch (error) {
        if (error instanceof DrizzleError) {
          throw new TRPCError({
            code: 'BAD_REQUEST',
            message: error.message,
          });
        }

        throw new TRPCError({
          code: 'INTERNAL_SERVER_ERROR',
          message: 'An error occurred while fetching the module',
        });
      }
    }),

  getUserModules: protectedProcedure
    .input(
      z
        .object({
          limit: z.number().min(1).max(100).default(20),
          cursor: z.string().uuid().optional(),
        })
        .optional()
        .default({ limit: 20 }),
    )
    .query(async ({ ctx, input }) => {
      const userId = ctx.user.id;
      const { limit, cursor } = input;

      // Get cursor module's lastVisited timestamp if cursor is provided
      let cursorDate: Date | undefined;
      if (cursor) {
        const cursorModule = await ctx.db.query.modulesTable.findFirst({
          where: (t, { eq }) => eq(t.id, cursor),
        });
        cursorDate = cursorModule?.lastVisited;
      }

      const modules = await ctx.db.query.modulesTable.findMany({
        where: (t, { eq, and, lt }) => {
          if (cursorDate) {
            return and(eq(t.user_id, userId), lt(t.lastVisited, cursorDate));
          }
          return eq(t.user_id, userId);
        },
        orderBy: (t, { desc }) => desc(t.lastVisited),
        limit: limit + 1,
      });

      const hasMore = modules.length > limit;
      const items = hasMore ? modules.slice(0, -1) : modules;

      return {
        items,
        nextCursor: hasMore ? items[items.length - 1]?.id : undefined,
      };
    }),

  create: protectedProcedure
    .input(
      insertModuleSchema.pick({
        name: true,
        description: true,
        code: true,
        icon: true,
        color: true,
        credits: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return ctx.db
        .insert(modulesTable)
        .values({
          ...input,
          description: input.description ?? '',
          user_id: userId,
        })
        .returning();
    }),

  archive: protectedProcedure
    .input(selectModuleSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return ctx.db
        .update(modulesTable)
        .set({ archived: true })
        .where(
          and(eq(modulesTable.id, input.id), eq(modulesTable.user_id, userId)),
        );
    }),

  recover: protectedProcedure
    .input(selectModuleSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return ctx.db
        .update(modulesTable)
        .set({ archived: false })
        .where(
          and(eq(modulesTable.id, input.id), eq(modulesTable.user_id, userId)),
        );
    }),

  update: protectedProcedure
    .input(
      insertModuleSchema.pick({
        color: true,
        icon: true,
        name: true,
        description: true,
        code: true,
        credits: true,
        id: true,
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      const { id: moduleId, ...updateData } = input;

      const existingModule = await ctx.db.query.modulesTable.findFirst({
        where: (t, { and, eq }) =>
          and(eq(t.id, moduleId), eq(t.user_id, userId)),
      });

      if (!existingModule) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Module not found',
        });
      }

      return ctx.db
        .update(modulesTable)
        .set({
          ...updateData,
          description: updateData.description ?? '',
          modifiedAt: new Date(),
        })
        .where(
          and(eq(modulesTable.id, moduleId), eq(modulesTable.user_id, userId)),
        );
    }),

  updateLastVisited: protectedProcedure
    .input(insertModuleSchema.pick({ id: true }))
    .mutation(async ({ ctx, input }) => {
      const userId = ctx.user.id;

      return ctx.db
        .update(modulesTable)
        .set({ lastVisited: new Date() })
        .where(
          and(eq(modulesTable.id, input.id), eq(modulesTable.user_id, userId)),
        );
    }),
});
