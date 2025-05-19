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
  uuid,
  uniqueIndex,
} from "drizzle-orm/pg-core";
import { createId } from "@/lib/ksuid";
import { course } from "../course";
import { user } from "../auth";

// Assessment type enum - already well-designed
export const assessmentTypeEnum = pgEnum("assessment_type", [
  "quiz", // Short, simple, low-stakes
  "test", // Medium length, moderate stakes
  "exam", // Formal, high-stakes, possibly proctored
  "survey", // For feedback, no right/wrong answers
  "assignment", // File upload/submission focused
  "self_check", // Practice, no grade impact
  "discussion", // New: Discussion-based assessment
  "portfolio", // New: Portfolio/project showcase
]);

// Question type enum - adding a few more specialized types
export const questionTypeEnum = pgEnum("question_type", [
  "multiple_choice",
  "checkbox",
  "short_text",
  "long_text",
  "number",
  "date",
  "time",
  "scale",
  "file_upload",
  "dropdown",
  "matching", // Match items between two columns
  "ordering", // Put items in correct sequence
  "hotspot", // Click correct area on image
  "code", // Code writing/execution questions
  "math_formula", // Mathematical equation input
  "drawing", // New: Drawing/sketching answer
  "audio_recording", // New: Record audio response
  "video_recording", // New: Record video response
  "annotated_image", // New: Annotate provided image
  "peer_review", // New: Peer assessment component
]);

// Enhanced Assessment Settings Type
export interface AssessmentSettingsType {
  // Basic settings
  allowMultipleSubmissions?: boolean;
  shuffleQuestions?: boolean;
  shuffleOptions?: boolean;
  showCorrectAnswers?: boolean;
  passingScore?: number;
  maxAttempts?: number;

  // Exam/test specific settings
  proctored?: boolean;
  securityLevel?: "low" | "medium" | "high";
  identityVerification?: boolean;
  browserLockdown?: boolean;
  webcamRequired?: boolean; // New: For remote proctoring

  // Survey specific settings
  anonymous?: boolean;
  responseVisibility?: "private" | "after_submission" | "public";

  // Assignment specific settings
  lateSubmissionPolicy?: "no_late" | "grade_deduction" | "needs_approval";
  lateDeductionPerDay?: number;

  // Grading settings
  gradingSchema?: "points" | "percentage" | "letter" | "pass_fail" | "custom";
  curveType?: "none" | "linear" | "bell";

  // Display settings
  questionsPerPage?: number;
  allowNavigation?: boolean;
  showProgress?: boolean;
  showTimer?: boolean;
  timerVisible?: boolean;
  hideResults?: boolean;

  // Feedback settings
  feedbackTiming?: "immediate" | "after_submission" | "after_due_date" | "manual";
  autoReleaseFeedback?: boolean;

  // Adaptive settings
  adaptive?: boolean;
  adaptiveRules?: Array<{
    condition: string;
    action: string;
  }>;

  // Peer review settings
  peerReviewEnabled?: boolean;
  peerReviewCount?: number;
  peerReviewAnonymous?: boolean;
  peerReviewDeadline?: string;
}

// The assessment type can be used to categorize the assessment
// e.g., quiz, test, exam, survey, assignment, self-check
// assessmentType: pgEnum("assessment_type", [
//   "quiz", // Short, simple, low-stakes
//   "test", // Medium length, moderate stakes
//   "exam", // Formal, high-stakes, possibly proctored
//   "survey", // For feedback, no right/wrong answers
//   "assignment", // File upload/submission focused
//   "self_check", // Practice, no grade impact
// ]),
// The assessment status can be used to determine if the assessment is active or inactive
// assessmentStatus: pgEnum("assessment_status", [
//   "active", // The assessment is active and visible to users
//   "inactive", // The assessment is inactive and not visible to users
// ]),
// The assessment visibility can be used to determine if the assessment is public or private
// assessmentVisibility: pgEnum("assessment_visibility", [
//   "public", // The assessment is visible to all users
//   "private", // The assessment is only visible to specific users or groups
// ]),
// The assessment grading type can be used to determine how the assessment is graded
// e.g., manual, automatic, peer review
// assessmentGradingType: pgEnum("assessment_grading_type", [
//   "manual", // Graded by an instructor or TA
//   "automatic", // Graded by the system based on predefined criteria
//   "peer_review", // Graded by peers or other students
// ]),
// The assessment grading status can be used to determine if the assessment is graded or ungraded
// assessmentGradingStatus: pgEnum("assessment_grading_status", [
//   "graded", // The assessment has been graded
//   "ungraded", // The assessment has not been graded
// ]),
// The assessment grading scale can be used to define different ranges of scores and their corresponding labels
// assessmentGradingScale: pgEnum("assessment_grading_scale", [
//   "A", // 90-100%
//   "B", // 80-89%
//   "C", // 70-79%
//   "D", // 60-69%
//   "F", // 0-59%
// ]),
// The assessment grading feedback can be used to provide specific feedback for each range
// assessmentGradingFeedback: pgEnum("assessment_grading_feedback", [
//   "Excellent", // 90-100%
//   "Good", // 80-89%
//   "Average", // 70-79%
//   "Below Average", // 60-69%
//   "Poor", // 0-59%
// ]),
// The assessment grading rubric can be used to define the criteria for grading
// assessmentGradingRubric: pgEnum("assessment_grading_rubric", [
//   "Excellent", // 90-100%
//   "Good", // 80-89%
//   "Average", // 70-79%
//   "Below Average", // 60-69%
//   "Poor", // 0-59%
// ]),

/**
 * @table assessment
 * @description Represents any type of assessment (quiz, test, exam, survey, etc.)
 */
export const assessment = pgTable(
  "assessment",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    title: varchar("title", { length: 120 }).notNull(),
    description: text("description"),
    assessmentType: assessmentTypeEnum("assessment_type").notNull().default("quiz"),
    courseId: text("course_id").references(() => course.id),
    createdBy: text("created_by")
      .notNull()
      .references(() => user.id),
    timeLimit: smallint("time_limit"), // in minutes, null means no limit
    dueDate: timestamp("due_date", { precision: 3 }),
    availableFrom: timestamp("available_from", { precision: 3 }),
    availableTo: timestamp("available_to", { precision: 3 }),
    isPublished: boolean("is_published").notNull().default(false),
    settings: jsonb("settings").$type<AssessmentSettingsType>(),
    totalPoints: smallint("total_points"),
    weight: smallint("weight").default(1), // For weighted grading in course
    category: varchar("category", { length: 50 }), // For grouping assessments
    instructions: text("instructions"),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
    deletedAt: timestamp("deleted_at", { precision: 3 }),
    completionTime: smallint("completion_time"), // New: Average completion time in minutes
    difficultyRating: smallint("difficulty_rating"), // New: Calculated difficulty (1-5)
    tags: jsonb("tags").$type<string[]>(), // New: For searchability and categorization
  },
  table => [
    index("idx_assessment_created_at").on(table.createdAt),
    index("idx_assessment_course_id").on(table.courseId),
    index("idx_assessment_type").on(table.assessmentType),
    index("idx_assessment_available_dates").on(table.availableFrom, table.availableTo),
    index("idx_assessment_tags").on(table.tags), // New: GIN index for JSON array searching
    index("idx_assessment_category").on(table.category),
  ],
);

/**
 * @table assessmentQuestion
 * @description Represents a question within an assessment
 */
export const assessmentQuestion = pgTable(
  "assessment_question",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessment.id, { onDelete: "cascade" }),
    questionType: questionTypeEnum("question_type").notNull(),
    content: text("content").notNull(),
    // mediaUrl: varchar("media_url", { length: 1024 }), // For images, videos, audio
    explanation: text("explanation"), // Explanation of the answer
    required: boolean("required").notNull().default(false),
    orderIndex: smallint("order_index").notNull(),
    points: smallint("points").notNull().default(1),
    difficultyLevel: smallint("difficulty_level"), // 1-5 scale of difficulty
    bloomsTaxonomyLevel: varchar("blooms_taxonomy_level", { length: 30 }), // For educational assessment design
    settings: jsonb("settings"), // Additional settings specific to question type
    hints: jsonb("hints").$type<string[]>(), // New: Array of hints for struggling students
    // tags: jsonb("tags").$type<string[]>(), // New: For organizing questions by topic
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
    timeEstimate: smallint("time_estimate"), // New: Estimated time to answer (seconds)
    parentQuestionId: text("parent_question_id"), // New: For nested/follow-up questions
  },
  table => [
    index("idx_assessment_question_assessment_id").on(table.assessmentId),
    index("idx_assessment_question_order").on(table.assessmentId, table.orderIndex),
    index("idx_assessment_question_difficulty").on(table.difficultyLevel), // New: For filtering by difficulty
    index("idx_assessment_question_parent").on(table.parentQuestionId), // New: For nested questions
  ],
);

/**
 * @table assessmentQuestionOption
 * @description Represents an answer option for multiple choice/checkbox/dropdown questions
 */
export const assessmentQuestionOption = pgTable(
  "assessment_question_option",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    questionId: text("question_id")
      .notNull()
      .references(() => assessmentQuestion.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    isCorrect: boolean("is_correct").default(false), // marks correct answer(s)
    orderIndex: smallint("order_index").notNull(), // for ordering options
    explanation: text("explanation"), // New: Explanation specific to this option
    feedbackIfSelected: text("feedback_if_selected"), // New: Custom feedback when selected
    // mediaUrl: varchar("media_url", { length: 1024 }), // New: Media for this option
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
  },
  table => [index("idx_assessment_question_option_question_id").on(table.questionId)],
);

/**
 * @table assessmentSubmission
 * @description Represents a user's submission to a assessment
 */
export const assessmentSubmission = pgTable(
  "assessment_submission",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessment.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    startedAt: timestamp("started_at", { precision: 3 }).notNull().defaultNow(),
    submittedAt: timestamp("submitted_at", { precision: 3 }),
    score: smallint("score"), // calculated score
    maxScore: smallint("max_score"), // maximum possible score
    attempt: smallint("attempt").notNull().default(1), // attempt number for this user
    ipAddress: varchar("ip_address", { length: 45 }), // New: For security tracking
    userAgent: varchar("user_agent", { length: 255 }), // New: For device tracking
    completionTimeSeconds: integer("completion_time_seconds"), // New: Actual completion time
    status: varchar("status", { length: 20 }).default("in_progress"), // New: in_progress, submitted, graded, etc.
    feedback: text("feedback"), // New: Overall submission feedback
    gradedBy: text("graded_by").references(() => user.id), // New: Who graded this submission
    gradedAt: timestamp("graded_at", { precision: 3 }), // New: When it was graded
  },
  table => [
    index("idx_assessment_submission_assessment_user").on(table.assessmentId, table.userId),
    index("idx_assessment_submission_submitted_at").on(table.submittedAt),
    index("idx_assessment_submission_status").on(table.status), // New: For filtering by status
    index("idx_assessment_submission_graded_by").on(table.gradedBy), // New: For filtering by grader
  ],
);

/**
 * @table assessmentSubmissionAnswer
 * @description Represents a user's answer to a specific question
 */
export const assessmentSubmissionAnswer = pgTable(
  "assessment_submission_answer",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    submissionId: text("submission_id")
      .notNull()
      .references(() => assessmentSubmission.id, { onDelete: "cascade" }),
    questionId: text("question_id")
      .notNull()
      .references(() => assessmentQuestion.id),
    textValue: text("text_value"), // for text/long text responses
    numberValue: integer("number_value"), // for number responses
    dateValue: timestamp("date_value"), // for date/time responses
    fileUrl: varchar("file_url", { length: 1024 }), // for file upload responses
    isCorrect: boolean("is_correct"), // automatically evaluated correctness
    manualScore: smallint("manual_score"), // for manually graded questions
    maxScore: smallint("max_score"), // New: Maximum possible score for this answer
    feedback: text("feedback"), // New: Specific feedback for this answer
    gradedBy: text("graded_by").references(() => user.id), // New: Who graded this answer
    timeSpentSeconds: integer("time_spent_seconds"), // New: Time spent on this question
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(), // New: For tracking edits
  },
  table => [
    index("idx_assessment_submission_answer_submission_id").on(table.submissionId),
    index("idx_assessment_submission_answer_question_id").on(table.questionId),
    index("idx_assessment_submission_answer_graded_by").on(table.gradedBy), // New
  ],
);

/**
 * @table assessmentAnswerSelectedOption
 * @description Junction table for answers with multiple selected options (checkboxes)
 */
export const assessmentAnswerSelectedOption = pgTable(
  "assessment_answer_selected_option",
  {
    answerId: text("answer_id")
      .notNull()
      .references(() => assessmentSubmissionAnswer.id, { onDelete: "cascade" }),
    optionId: text("option_id")
      .notNull()
      .references(() => assessmentQuestionOption.id),
    orderIndex: smallint("order_index"), // New: For ordering responses (e.g., ranking questions)
  },
  table => [primaryKey({ columns: [table.answerId, table.optionId] })],
);

/**
 * @table assessmentRubric
 * @description Represents grading criteria for subjective questions
 */
export const assessmentRubric = pgTable(
  "assessment_rubric",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    questionId: text("question_id")
      .notNull()
      .references(() => assessmentQuestion.id, { onDelete: "cascade" }),
    criteria: varchar("criteria", { length: 255 }).notNull(),
    description: text("description"),
    maxPoints: smallint("max_points").notNull(),
    orderIndex: smallint("order_index").notNull(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull().defaultNow(),
  },
  table => [
    index("idx_assessment_rubric_question_id").on(table.questionId),
    index("idx_assessment_rubric_order_index").on(table.questionId, table.orderIndex),
    index("idx_assessment_rubric_created_at").on(table.createdAt),
    index("idx_assessment_rubric_updated_at").on(table.updatedAt),
  ],
);

/**
 * @table assessmentRubricLevel
 * @description Represents different achievement levels for each rubric criterion
 */
export const assessmentRubricLevel = pgTable(
  "assessment_rubric_level",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    rubricId: text("rubric_id")
      .notNull()
      .references(() => assessmentRubric.id, { onDelete: "cascade" }),
    level: varchar("level", { length: 50 }).notNull(), // e.g., "Excellent", "Good", "Needs Improvement"
    description: text("description"),
    points: smallint("points").notNull(),
    orderIndex: smallint("order_index").notNull(),
  },
  table => [index("idx_assessment_rubric_level_rubric_id").on(table.rubricId)],
);

/**
 * @table assessmentFeedback
 * @description Represents feedback on the assessment itself (for improvement)
 */
export const assessmentFeedback = pgTable(
  "assessment_feedback",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    assessmentId: text("assessment_id")
      .notNull()
      .references(() => assessment.id),
    userId: text("user_id")
      .notNull()
      .references(() => user.id),
    rating: smallint("rating"), // e.g., 1-5 stars
    feedback: text("feedback"),
    createdAt: timestamp("created_at", { precision: 3 }).notNull().defaultNow(),
  },
  table => [
    index("idx_assessment_feedback_assessment_id").on(table.assessmentId),
    uniqueIndex("uniq_assessment_feedback_user").on(table.assessmentId, table.userId),
  ],
);
