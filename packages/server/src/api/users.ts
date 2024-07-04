import { Hono } from "@hono/hono"

import { db, sql } from "../database/db.ts"

export const users = new Hono()

users.get("/", async (c) => {
	await db.get(sql`SELECT * FROM users`)
	return c.json({ users: [] })
})
