// auth-relations.ts

import { relations } from "drizzle-orm";
import { role, user } from "./auth";
import { groupMember } from "./group";
import { course } from "./course";
import { scheduledMeeting } from "./meeting";

/**
 * @relations user
 * @description Establishes relations for the user entity
 */
export const userRelations = relations(user, ({ many, one }) => ({
  role: one(role, {
    fields: [user.roleId],
    references: [role.id],
  }),
  groupsRegistered: many(groupMember),
  createdCourses: many(course),
  createdMeetings: many(scheduledMeeting),
}));
