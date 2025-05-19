import {
  pgTable,
  text,
  varchar,
  timestamp,
  boolean,
  integer,
  smallint,
  jsonb,
  pgEnum,
  index,
  primaryKey,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@/lib/ksuid";
import { course } from "../course";
import { user } from "../auth";

// // Assessment type enum - for categorizing assessments
// export const assessmentTypeEnum = pgEnum("assessment_type", [
//   "quiz", // Short, simple, low-stakes
//   "test", // Medium length, moderate stakes
//   "exam", // Formal, high-stakes, possibly proctored
//   "survey", // For feedback, no right/wrong answers
//   "assignment", // File upload/submission focused
//   "self_check", // Practice, no grade impact
// ]);

// Enhanced Assessment Settings Type
export interface AssessmentSettingsType {
  // Basic settings
  shuffleSections?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  maxAttempts?: number;
  // passingScorePercent?: number;

  // Exam/test specific settings
  browserLockdown?: boolean;
  webcamRequired?: boolean; // New: For remote proctoring

  // // Survey specific settings
  // anonymous?: boolean;
  // responseVisibility?: "private" | "after_submission" | "public";

  // Maybe be a table instead of a jsonb???
  // Grading
  gradingSystem: {
    maximumScore: number;
    passingScorePercent?: number;
    // `gradingScale` can be used to define different ranges of scores and their corresponding labels
    gradingScale: {
      // `label` can be used for displaying the grade as a letter or other representation
      label?: string;
      min: number;
      max: number;
      rangeType?: "percentage" | "points"; // New: To specify if the range is in percentage or points
      // `feedback` can be used to provide specific feedback for each range
      feedback?: string;
    }[];
  };

  // General Display settings
  displaySettings?: {
    showCorrectAnswers?: boolean;
    showExplanations?: boolean;
    showScoreImmediately?: boolean;
    showSectionScores?: boolean;
    showQuestionScores?: boolean;
  };

  // Feedback settings
  feedbackSettings?: {
    timing?: "immediate" | "after_submission" | "after_due_date" | "manual";
    autoRelease?: boolean;
  };

  // Miscellaneous
  customCSS?: string; // For custom styling
}

export const assessmentStatusEnum = pgEnum("assessment_status", [
  "draft", // Assessment is being created or edited
  "published", // Assessment is published and available to students
  "archived", // Assessment is archived and not available to students
]);

/**
 * @table assessment
 */
export const assessment = pgTable(
  "assessment",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { precision: 3, withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3, withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { precision: 3, withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    courseId: text("course_id")
      .notNull()
      .references(() => course.id),

    timeLimit: smallint("time_limit"), // in minutes, null means no limit
    dueDate: timestamp("due_date", { precision: 3 }),
    availableFrom: timestamp("available_from", { precision: 3 }),
    availableTo: timestamp("available_to", { precision: 3 }),

    status: assessmentStatusEnum("status").notNull().default("draft"),
    settings: jsonb("settings").$type<AssessmentSettingsType>(),

    // category: varchar("category", { length: 50 }), // For grouping assessments
    // instructions: text("instructions"),
  },
  table => [
    index("idx_assessment_created_at").on(table.createdAt),
    index("idx_assessment_updated_at").on(table.updatedAt),
    index("idx_assessment_deleted_at").on(table.deletedAt),
    index("idx_assessment_title").on(table.title),
  ],
);

// Assessment section
export const assessmentSection = pgTable(
  "assessment_section",
  {
    id: text("id").primaryKey().$defaultFn(createId),
    title: varchar("title", { length: 255 }).notNull(),
    description: text("description"),
    createdAt: timestamp("created_at", { precision: 3, withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3, withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { precision: 3, withTimezone: true }),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    updatedBy: text("updated_by")
      .notNull()
      .references(() => user.id),
    order: smallint("section_order").notNull(),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessment.id),
  },
  table => [
    index("idx_assessment_created_at").on(table.createdAt),
    index("idx_assessment_updated_at").on(table.updatedAt),
    index("idx_assessment_deleted_at").on(table.deletedAt),
    index("idx_assessment_title").on(table.title),
  ],
);
