// group.ts

import { index, pgTable, primaryKey, text, timestamp, varchar } from "drizzle-orm/pg-core";
import { course } from "./course";
import { user } from "./auth";
import { scheduledMeeting } from "./meeting";
import { createId } from "@/lib/ksuid";

/**
 * @table group
 * @description Sub-cohorts within a course for targeted sessions
 * @why Allows different sets of students to meet at different times.
 * @columns
 * - id: An auto-generated unique identifier for the group
 * - courseId: Foreign key → course.id
 * - name: Group name, e.g. 'Beginner A'
 */
export const group = pgTable(
  "group",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id),
    name: varchar({ length: 100 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3 }),
  },
  table => [
    index("idx_group_created_at").on(table.createdAt),
    index("idx_group_updated_at").on(table.updatedAt),
    index("idx_group_deleted_at").on(table.deletedAt),
    index("idx_group_name").on(table.name),
  ],
);

/**
 * @table group_member
 * @description Junction of users to groups
 * @why Controls which students may view/join a group's meetings.
 * @columns
 * - userId: Foreign key → user.id
 * - groupId: Foreign key → group.id
 * @primaryKey (userId, groupId)
 */
export const groupMember = pgTable(
  "group_member",
  {
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
  },
  table => [
    primaryKey({ columns: [table.userId, table.groupId] }),
    index("idx_group_member_created_at").on(table.createdAt),
  ],
);

/**
 * @table meeting_group
 * @description Associates meetings with zero, one, or many groups.
 * @why Decouples meeting definitions from group assignments.
 * @columns
 * - meetingId: FK → scheduled_meeting.id
 * - groupId:   FK → group.id
 * @primaryKey [meetingId, groupId]
 */
export const meetingGroup = pgTable(
  "meeting_group",
  {
    meetingId: text("meeting_id")
      .notNull()
      .references(() => scheduledMeeting.id),
    groupId: text("group_id")
      .notNull()
      .references(() => group.id),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
  },
  t => [
    primaryKey({ columns: [t.meetingId, t.groupId] }),
    index("idx_meeting_group_created_at").on(t.createdAt),
  ],
);
