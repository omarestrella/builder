import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core"

export const users = sqliteTable("users", {
	id: integer("id").primaryKey(),
	email: text("email").notNull(),
	createdAt: integer("created_at"),
	deletedAt: integer("deleted_at"),
})

export const authToken = sqliteTable("auth_token", {
	token: text("token"),
	userId: integer("user_id").primaryKey(),
	expiresAt: integer("expires_at"),
})

export const loginToken = sqliteTable("login_token", {
	token: text("token"),
	userId: integer("user_id").primaryKey(),
	expiresAt: integer("expires_at"), // unix timestamp
})

export const project = sqliteTable("project", {
	id: integer("id").primaryKey(),
	userId: integer("user_id"),
	name: text("name"),
	data: text("data"), // json
	createdAt: integer("created_at"),
	deletedAt: integer("deleted_at"),
})
