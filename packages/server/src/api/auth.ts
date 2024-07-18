import { hash, verify } from "@denorg/scrypt"
import { setCookie } from "hono/cookie"

import { db, sql } from "../database/db.ts"
import { accessToken, user } from "../database/schema.ts"
import { Hono } from "../hono.ts"

export const auth = new Hono()

auth.post("/register", async (c) => {
	let req = await c.req.json()
	if (!req.username || !req.password) {
		return c.json({ error: "Missing username/password" }, 400)
	}

	let dbUser = await db
		.select()
		.from(user)
		.where(sql`${user.username} = ${req.username}`)
		.get()

	if (dbUser) {
		return c.json({ error: "Username already taken" }, 400)
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

// most of this is bad, but oh well, can be replaced later
auth.post("/login", async (c) => {
	if (c.get("currentUser")) {
		return c.json({ error: "Already logged in" }, 400)
	}

	let req = await c.req.json()
	if (!req.username || !req.password) {
		return c.json({ error: "Missing username/password" }, 400)
	}

	let dbUser = await db
		.select()
		.from(user)
		.where(sql`${user.username} = ${req.username}`)
		.get()

	if (!dbUser) {
		return c.json({ error: "Account not found" }, 404)
	}

	let result = verify(req.password, dbUser.password)
	if (!result) {
		return c.json({ error: "Account not found" }, 404)
	}

	let currentToken = await db
		.select()
		.from(accessToken)
		.where(sql`${accessToken.userId} = ${dbUser.id}`)
		.get()
	if (currentToken?.token) {
		setCookie(c, "accessToken", currentToken.token)
		return c.json({})
	}

	let token = await db
		.insert(accessToken)
		.values({
			expiresAt: Date.now() + 1000 * 60 * 60 * 24, // will use this eventually
			token: "zxcvbnm",
			userId: dbUser.id,
		})
		.returning({
			token: accessToken.token,
		})
		.get()

	if (!token?.token) {
		return c.json({ error: "Failed to create token" }, 500)
	}

	setCookie(c, "accessToken", token.token)

	return c.json({
		user: {
			id: dbUser.id,
			username: dbUser.username,
			email: dbUser.email,
			createdAt: dbUser.createdAt,
		},
	})
})

auth.post("/logout", async (c) => {
	let user = c.get("currentUser")

	if (!user) {
		return c.json({ error: "Not logged in" }, 400)
	}

	await db.delete(accessToken).where(sql`${accessToken.userId} = ${user.id}`)

	setCookie(c, "accessToken", "", { maxAge: 0 })
	return c.json({})
})
