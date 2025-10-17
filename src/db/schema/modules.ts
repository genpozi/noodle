import {
  boolean,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uuid,
} from 'drizzle-orm/pg-core';
import { createInsertSchema, createSelectSchema } from 'drizzle-zod';
import { z } from 'zod';

export const modulesTable = pgTable(
  'modules',
  {
    id: uuid('id').primaryKey().unique().defaultRandom().notNull(),
    user_id: text('user_id').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    code: text('code').notNull(),
    icon: text('icon').default('default').notNull(),
    color: text('color').default('default').notNull(),
    archived: boolean('archived').default(false).notNull(),
    credits: integer('credits').default(0).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    modifiedAt: timestamp('modified_at').notNull().defaultNow(),
    lastVisited: timestamp('last_visited').notNull().defaultNow(),
  },
  (table) => ({
    userIdIdx: index('modules_user_id_idx').on(table.user_id),
    lastVisitedIdx: index('modules_last_visited_idx').on(table.lastVisited),
    userLastVisitedIdx: index('modules_user_last_visited_idx').on(
      table.user_id,
      table.lastVisited,
    ),
    archivedIdx: index('modules_archived_idx').on(table.archived),
  }),
);

export const insertModuleSchema = createInsertSchema(modulesTable).extend({
  id: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().default('default'),
  color: z.string().default('default'),
  archived: z.boolean().default(false),
  credits: z.number().default(0),
  createdAt: z.date().default(new Date()),
  modifiedAt: z.date().default(new Date()),
  lastVisited: z.date().default(new Date()),
});

export type InsertModuleInput = z.infer<typeof insertModuleSchema>;

export const selectModuleSchema = createSelectSchema(modulesTable);
