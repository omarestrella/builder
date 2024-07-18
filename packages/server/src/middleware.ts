import { getCookie } from "hono/cookie"
import { createMiddleware } from "hono/factory"

import { db, sql } from "./database/db.ts"
import { accessToken, user } from "./database/schema.ts"

export const currentUser = createMiddleware(async (c, next) => {
	let accessTokenCookie = getCookie(c, "accessToken")
	if (accessTokenCookie) {
		let data = await db
			.select()
			.from(user)
			.innerJoin(accessToken, sql`${accessToken.userId} = ${user.id}`)
			.where(sql`${accessToken.token} = ${accessTokenCookie}`)
			.get()
		c.set("currentUser", data?.user)
	}
	await next()
})

export const requireAuth = createMiddleware(async (c, next) => {
	let screenshotCookie = getCookie(c, "accessToken")
	if (screenshotCookie === Deno.env.get("SCREENSHOTS_ACCESS_TOKEN")) {
		c.set("isScreenshot", true)
		await next()
	} else {
		if (!c.get("currentUser") && !c.req.path.startsWith("/api/auth")) {
			return c.text("Unauthorized", 401)
		}
		await next()
	}
})
