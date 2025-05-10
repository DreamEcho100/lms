// meeting-relations.ts

import { user } from "./auth";
import { relations } from "drizzle-orm";
import {
  attendanceRecord,
  externalIntegration,
  meetingOccurrence,
  scheduledMeeting,
} from "./meeting";
import { meetingGroup } from "./group";

/**
 * @relations scheduledMeeting
 * @description Establishes relations for scheduled meetings
 */
export const scheduledMeetingRelations = relations(scheduledMeeting, ({ one, many }) => ({
  groups: many(meetingGroup),
  creator: one(user, {
    // scheduledMeeting.createdBy → user.id
    fields: [scheduledMeeting.createdBy],
    references: [user.id],
  }),
  occurrences: many(meetingOccurrence),
  externalIntegrations: many(externalIntegration),
}));

/**
 * @relations meetingOccurrence
 * @description Establishes relations for meeting occurrences
 */
export const meetingOccurrenceRelations = relations(meetingOccurrence, ({ one, many }) => ({
  meeting: one(scheduledMeeting, {
    fields: [meetingOccurrence.meetingId],
    references: [scheduledMeeting.id],
  }),
  attendanceRecords: many(attendanceRecord),
}));

/**
 * @relations attendanceRecord
 * @description Establishes relations for attendance tracking
 */
export const attendanceRecordRelations = relations(attendanceRecord, ({ one }) => ({
  occurrence: one(meetingOccurrence, {
    fields: [attendanceRecord.occurrenceId],
    references: [meetingOccurrence.id],
  }),
  attendee: one(user, {
    fields: [attendanceRecord.userId],
    references: [user.id],
  }),
}));

/**
 * @relations externalIntegration
 * @description Establishes relations for external meeting integrations (e.g., Zoom, Google Calendar)
 */
export const externalIntegrationRelations = relations(externalIntegration, ({ one }) => ({
  meeting: one(scheduledMeeting, {
    fields: [externalIntegration.meetingId],
    references: [scheduledMeeting.id],
  }),
}));
