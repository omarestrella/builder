import { hash, verify } from "@denorg/scrypt"
import { Hono } from "@hono/hono"

import { db, sql } from "../database/db.ts"
import { user } from "../database/schema.ts"

export const auth = new Hono()

auth.post("/signup", async (c) => {
	let req = await c.req.json()
	if (!req.username || !req.password) {
		return c.json({ error: "missing username/password" }, 400)
	}

	let dbUser = await db
		.select()
		.from(user)
		.where(sql`${user.username} = ${req.username}`)
		.get()

	if (dbUser) {
		return c.json({ error: "account exists" }, 400)
	}

	let res = await db
		.insert(user)
		.values({
			username: req.username,
			password: hash(req.password),
			createdAt: Date.now(),
		})
		.returning({
			id: user.id,
			username: user.username,
			createdAt: user.createdAt,
		})

	return c.json({ user: res[0] })
})

auth.post("/login", async (c) => {
	let req = await c.req.json()
	if (!req.username || !req.password) {
		return c.json({ error: "missing username/password" }, 400)
	}

	let dbUser = await db
		.select()
		.from(user)
		.where(sql`${user.username} = ${req.username}`)
		.get()

	if (!dbUser) {
		return c.json({ error: "account not found" }, 404)
	}

	let result = verify(req.password, dbUser.password)
	if (!result) {
		return c.json({ error: "account not found" }, 404)
	}

	return c.json({ token: "asdf" })
})
