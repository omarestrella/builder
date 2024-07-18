import type { InferSelectModel } from "drizzle-orm"
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const user = sqliteTable("user", {
	id: integer("id").primaryKey(),
	email: text("email"),
	username: text("username").notNull(),
	password: text("password").notNull(),
	createdAt: integer("created_at"),
	deletedAt: integer("deleted_at"),
})

export type User = InferSelectModel<typeof user>

export const accessToken = sqliteTable("access_token", {
	token: text("token"),
	userId: integer("user_id").primaryKey(),
	expiresAt: integer("expires_at"),
})

export const refreshToken = sqliteTable("refresh_token", {
	token: text("token"),
	userId: integer("user_id").primaryKey(),
	expiresAt: integer("expires_at"),
})

export const project = sqliteTable("project", {
	id: integer("id").primaryKey(),
	userId: integer("user_id").notNull(),
	name: text("name").notNull(),
	data: text("data").notNull(), // json
	createdAt: integer("created_at"),
	deletedAt: integer("deleted_at"),
})
export type Project = InferSelectModel<typeof project>

export const projectScreenshot = sqliteTable("project_screenshot", {
	id: integer("id").primaryKey(),
	projectID: integer("project_id").notNull(),
	location: text("location").notNull(),
})
export type ProjectScreenshot = InferSelectModel<typeof projectScreenshot>
