// auth.ts

import { createId } from "@/lib/ksuid";
import { boolean, index, pgTable, text, timestamp, varchar } from "drizzle-orm/pg-core";

/**
 * @table role
 * @description Defines user roles for permission enforcement
 * @why Only teachers can create/manage meetings; students join and view.
 * @columns
 * - id: a unique identifier for the role
 * - name: Role name, e.g. 'teacher' | 'student'
 */
export const role = pgTable("roles", {
  id: text("id").primaryKey().notNull().$default(createId),
  name: varchar("name", { length: 100 }).notNull(),
});

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    name: varchar("name", { length: 100 }).notNull(),
    email: varchar("email", { length: 256 }).notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: varchar("image", { length: 2096 }),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    roleId: text("role_id")
      .notNull()
      .references(() => role.id),
  },

  table => [
    index("idx_user_created_at").on(table.createdAt),
    index("idx_user_updated_at").on(table.updatedAt),
  ],
);
export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    expiresAt: timestamp("expires_at", { precision: 3 }).notNull(),
    token: varchar("token", { length: 256 }).notNull().unique(),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
    ipAddress: varchar("ip_address", { length: 45 }),
    userAgent: varchar("user_agent", { length: 512 }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
  },
  table => [
    index("idx_session_created_at").on(table.createdAt),
    index("idx_session_updated_at").on(table.updatedAt),
  ],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    accessToken: varchar("access_token", { length: 2048 }),
    refreshToken: varchar("refresh_token", { length: 2048 }),
    idToken: varchar("id_token", { length: 2048 }),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { precision: 3 }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { precision: 3 }),
    scope: varchar("scope", { length: 512 }),
    password: varchar("password", { length: 512 }),
    createdAt: timestamp("created_at", { precision: 3 }).notNull(),
    updatedAt: timestamp("updated_at", { precision: 3 }).notNull(),
  },
  table => [
    index("idx_account_created_at").on(table.createdAt),
    index("idx_account_updated_at").on(table.updatedAt),
  ],
);

export const verification = pgTable(
  "verification",
  {
    id: text("id").primaryKey().notNull().$default(createId),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: timestamp("expires_at", { precision: 3 }).notNull(),
    createdAt: timestamp("created_at", { precision: 3 }),
    updatedAt: timestamp("updated_at", { precision: 3 }),
  },
  table => [
    index("idx_verification_created_at").on(table.createdAt),
    index("idx_verification_updated_at").on(table.updatedAt),
  ],
);
