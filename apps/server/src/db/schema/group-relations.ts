// group-relations.ts

import { relations } from "drizzle-orm";
import { course } from "./course";
import { group, groupMember, meetingGroup } from "./group";
import { user } from "./auth";

/**
 * @relations group
 * @description Establishes relations for the group entity
 */
export const groupRelations = relations(group, ({ many, one }) => ({
  course: one(course, {
    fields: [group.courseId],
    references: [course.id],
  }),
  members: many(groupMember),
  meetings: many(meetingGroup),
}));

/**
 * @relations groupMember
 * @description Establishes relations for the group member entity
 */
export const groupMemberRelations = relations(groupMember, ({ one }) => ({
  user: one(user, {
    fields: [groupMember.userId],
    references: [user.id],
  }),
  group: one(group, {
    fields: [groupMember.groupId],
    references: [group.id],
    relationName: "groupsRegistered",
  }),
}));
