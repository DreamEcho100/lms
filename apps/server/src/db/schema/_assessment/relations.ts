import { relations } from "drizzle-orm";
import {
  assessment,
  assessmentQuestion,
  assessmentQuestionOption,
  assessmentSubmission,
  assessmentSubmissionAnswer,
  assessmentAnswerSelectedOption,
  assessmentRubric,
  assessmentRubricLevel,
  assessmentFeedback,
} from "./schema";
import { user } from "../auth";
import { course } from "../course";

export const assessmentRelations = relations(assessment, ({ many, one }) => ({
  creator: one(user, {
    fields: [assessment.createdBy],
    references: [user.id],
  }),
  course: one(course, {
    fields: [assessment.courseId],
    references: [course.id],
  }),
  questions: many(assessmentQuestion),
  submissions: many(assessmentSubmission),
  feedback: many(assessmentFeedback),
}));

export const assessmentQuestionRelations = relations(assessmentQuestion, ({ one, many }) => ({
  assessment: one(assessment, {
    fields: [assessmentQuestion.assessmentId],
    references: [assessment.id],
  }),
  options: many(assessmentQuestionOption),
  answers: many(assessmentSubmissionAnswer),
  rubrics: many(assessmentRubric),
  parentQuestion: one(assessmentQuestion, {
    fields: [assessmentQuestion.parentQuestionId],
    references: [assessmentQuestion.id],
  }),
  childQuestions: many(assessmentQuestion, {
    relationName: "childQuestions",
  }),
}));

export const assessmentQuestionOptionRelations = relations(
  assessmentQuestionOption,
  ({ one, many }) => ({
    question: one(assessmentQuestion, {
      fields: [assessmentQuestionOption.questionId],
      references: [assessmentQuestion.id],
    }),
    selectedInAnswers: many(assessmentAnswerSelectedOption),
  }),
);

export const assessmentSubmissionRelations = relations(assessmentSubmission, ({ one, many }) => ({
  assessment: one(assessment, {
    fields: [assessmentSubmission.assessmentId],
    references: [assessment.id],
  }),
  user: one(user, {
    fields: [assessmentSubmission.userId],
    references: [user.id],
  }),
  grader: one(user, {
    fields: [assessmentSubmission.gradedBy],
    references: [user.id],
  }),
  answers: many(assessmentSubmissionAnswer),
}));

export const assessmentSubmissionAnswerRelations = relations(
  assessmentSubmissionAnswer,
  ({ one, many }) => ({
    submission: one(assessmentSubmission, {
      fields: [assessmentSubmissionAnswer.submissionId],
      references: [assessmentSubmission.id],
    }),
    question: one(assessmentQuestion, {
      fields: [assessmentSubmissionAnswer.questionId],
      references: [assessmentQuestion.id],
    }),
    grader: one(user, {
      fields: [assessmentSubmissionAnswer.gradedBy],
      references: [user.id],
    }),
    selectedOptions: many(assessmentAnswerSelectedOption),
  }),
);

export const assessmentAnswerSelectedOptionRelations = relations(
  assessmentAnswerSelectedOption,
  ({ one }) => ({
    answer: one(assessmentSubmissionAnswer, {
      fields: [assessmentAnswerSelectedOption.answerId],
      references: [assessmentSubmissionAnswer.id],
    }),
    option: one(assessmentQuestionOption, {
      fields: [assessmentAnswerSelectedOption.optionId],
      references: [assessmentQuestionOption.id],
    }),
  }),
);

export const assessmentRubricRelations = relations(assessmentRubric, ({ one, many }) => ({
  question: one(assessmentQuestion, {
    fields: [assessmentRubric.questionId],
    references: [assessmentQuestion.id],
  }),
  levels: many(assessmentRubricLevel),
}));

export const assessmentRubricLevelRelations = relations(assessmentRubricLevel, ({ one }) => ({
  rubric: one(assessmentRubric, {
    fields: [assessmentRubricLevel.rubricId],
    references: [assessmentRubric.id],
  }),
}));

export const assessmentFeedbackRelations = relations(assessmentFeedback, ({ one }) => ({
  assessment: one(assessment, {
    fields: [assessmentFeedback.assessmentId],
    references: [assessment.id],
  }),
  user: one(user, {
    fields: [assessmentFeedback.userId],
    references: [user.id],
  }),
}));
