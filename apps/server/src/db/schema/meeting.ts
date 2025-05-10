// meeting.ts

import {
  pgTable,
  varchar,
  primaryKey,
  timestamp,
  boolean,
  date,
  jsonb,
  text,
  index,
  smallint,
} from "drizzle-orm/pg-core";
import { user } from "./auth";
import { createId } from "@/lib/ksuid";

/**
 * @table scheduled_meeting
 * @description Core meeting definitions: recurrence, buffers, metadata
 * @why Drives generation of all occurrences and integration with external APIs.
 * @columns
 * - id: An auto-generated unique identifier for the group
 * - groupId: Foreign key → group.id
 * - title: Meeting subject
 * - location: Physical or default virtual location
 * - timeZone: IANA timezone string
 * - startTime: UTC timestamp of first occurrence
 * - durationMinutes: Meeting length
 * - isRecurring: Flag for recurring series
 * - recurrenceRule: JSONB storing RRULE string or options
 * - endDate: Optional final date for recurring series
 * - prepBuffer: Minutes before start to block
 * - followUpBuffer: Minutes after end to block
 * - minNotice: Minimum lead time in minutes to book
 * - metadata: JSONB for join links, agenda, files, custom data
 * - createdBy: Foreign key → user.id
 */
export const scheduledMeeting = pgTable(
  "scheduled_meeting",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    title: varchar("title", { length: 120 }).notNull(),
    location: varchar("location", { length: 256 }),
    timeZone: varchar("time_zone", { length: 40 }).notNull().default("UTC"),
    startTime: timestamp("start_time", { precision: 3 }).notNull(),
    durationMinutes: smallint("duration_minutes").notNull(),
    isRecurring: boolean("is_recurring").notNull().default(false),
    recurrenceRule: jsonb("recurrence_rule"),
    endDate: date("end_date"),
    prepBuffer: smallint("prep_buffer").notNull().default(0),
    followUpBuffer: smallint("follow_up_buffer").notNull().default(0),
    minNotice: smallint("min_notice").notNull().default(0),
    metadata: jsonb(),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3 }),
  },
  table => [
    index("idx_scheduled_meeting_created_at").on(table.createdAt),
    index("idx_scheduled_meeting_updated_at").on(table.updatedAt),
    index("idx_scheduled_meeting_deleted_at").on(table.deletedAt),
    index("idx_scheduled_meeting_start_time").on(table.startTime),
    index("idx_scheduled_meeting_title").on(table.title),
    index("idx_scheduled_meeting_location").on(table.location),
  ],
);

/**
 * @table meeting_occurrence
 * @description Individual occurrences of scheduled meetings
 * @why Tracks actual start, delays, cancellations, soft-deletes, attendance flag.
 * @columns
 * - id: An auto-generated unique identifier for the group
 * - meetingId: Foreign key → scheduled_meeting.id
 * - scheduledDate: Date of occurrence (YYYY-MM-DD)
 * - actualStartTime: Real UTC start timestamp if delayed
 * - delayMinutes: Computed delay in minutes
 * - isCancelled: Flag for cancellations
 * - deletedAt: Nullable UTC timestamp for soft-delete
 * - attendanceTaken: Flag marking if attendance was recorded
 */
export const meetingOccurrence = pgTable(
  "meeting_occurrence",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => scheduledMeeting.id),
    scheduledDate: date("scheduled_date").notNull(),
    actualStartTime: timestamp("actualStart_time", { precision: 3 }),
    delayMinutes: smallint("delay_minutes"),
    isCancelled: boolean("is_cancelled").notNull().default(false),
    attendanceTaken: boolean("attendance_taken").notNull().default(false),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3 }),
  },
  table => [
    index("idx_meeting_occurrence_created_at").on(table.createdAt),
    index("idx_meeting_occurrence_updated_at").on(table.updatedAt),
    index("idx_meeting_occurrence_deleted_at").on(table.deletedAt),
    index("idx_meeting_occurrence_scheduled_date").on(table.scheduledDate),
    index("idx_meeting_occurrence_meeting_id").on(table.meetingId),
    index("idx_meeting_occurrence_actual_start_time").on(table.actualStartTime),
    index("idx_meeting_occurrence_delay_minutes").on(table.delayMinutes),
  ],
);

/**
 * @table attendance_record
 * @description Per-student attendance for each occurrence
 * @why Enables reporting and analytics on participation.
 * @columns
 * - occurrenceId: Foreign key → meeting_occurrence.id
 * - userId: Foreign key → user.id
 * - present: Boolean flag
 * - recordedAt: UTC timestamp when marked
 */
export const attendanceRecord = pgTable(
  "attendance_record",
  {
    occurrenceId: text("occurrence_id")
      .notNull()
      .references(() => meetingOccurrence.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    present: boolean().notNull(),
    recordedAt: timestamp("recorded_at", { precision: 3 }).notNull().defaultNow(),
  },
  table => [primaryKey({ columns: [table.occurrenceId, table.userId] })],
);

/**
 * @table external_integration
 * @description Links local meetings to external providers
 * @why Supports two-way sync: store externalEventId, joinLink, provider settings.
 * @columns
 * - id: An auto-generated unique identifier for the group
 * - meetingId: Foreign key → scheduled_meeting.id
 * - provider: 'google_calendar' | 'zoom'
 * - externalEventId: ID in external system
 * - joinLink: URL for participants
 * - metadata: JSONB for provider-specific options
 */
export const externalIntegration = pgTable(
  "external_integration",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    meetingId: text("meeting_id")
      .notNull()
      .references(() => scheduledMeeting.id),
    provider: varchar({ length: 256 }).notNull(),
    externalEventId: varchar("external_event_id", { length: 256 }),
    joinLink: varchar("join_link", { length: 2096 }),
    metadata: jsonb(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    deletedAt: timestamp("deleted_at", { precision: 3 }),
  },
  table => [
    index("idx_external_integration_created_at").on(table.createdAt),
    index("idx_external_integration_updated_at").on(table.updatedAt),
    index("idx_external_integration_deleted_at").on(table.deletedAt),
  ],
);
