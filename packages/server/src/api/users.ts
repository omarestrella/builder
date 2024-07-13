import { db, sql } from "../database/db.ts"
import { project } from "../database/schema.ts"
import { HonoAPI } from "../hono.ts"

export const users = new HonoAPI()

users.get("/session", async (c) => {
	let user = c.get("currentUser")
	let projects = await db
		.select()
		.from(project)
		.where(sql`user_id = ${user.id}`)
		.all()
	return c.json({
		user: {
			id: user.id,
			username: user.username,
			email: user.email,
			createdAt: user.createdAt,
		},
		projects: projects.map((p) => ({ ...p, data: JSON.parse(p.data) })),
	})
})
