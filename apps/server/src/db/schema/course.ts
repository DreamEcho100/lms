// course.ts

import { pgTable, varchar, text, index, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createId } from "@/lib/ksuid";

/**
 * @table course
 * @description Represents a course container owned by a teacher
 * @why Organizes groups, content, and meetings under one course.
 * @columns
 * - id: An auto-generated unique identifier for the group
 * - title: Course title
 * - description: Brief overview
 * - createdBy: Foreign key → user.id (teacher)
 */
export const course = pgTable(
  "course",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    title: varchar({ length: 120 }).notNull(),
    description: text("description"),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3 }),
  },
  table => [
    index("idx_course_created_at").on(table.createdAt),
    index("idx_course_updated_at").on(table.updatedAt),
    index("idx_course_deleted_at").on(table.deletedAt),
    index("idx_course_title").on(table.title),
  ],
);
