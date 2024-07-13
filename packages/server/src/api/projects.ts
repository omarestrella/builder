import { db, sql } from "../database/db.ts"
import { project } from "../database/schema.ts"
import { HonoAPI } from "../hono.ts"

export const projects = new HonoAPI()

projects.get("/", async (c) => {
	let user = c.get("currentUser")
	let projects = await db
		.select()
		.from(project)
		.where(sql`user_id = ${user.id}`)
		.all()
	return c.json({
		projects: projects.map((p) => ({ ...p, data: JSON.parse(p.data) })),
	})
})

projects.get("/:id", async (c) => {
	let user = c.get("currentUser")
	let id = c.req.param("id")
	let proj = await db
		.select()
		.from(project)
		.where(sql`id = ${id} AND user_id = ${user.id}`)
		.get()
	if (!proj) {
		return c.text("Project not found", 404)
	}
	return c.json({ project: { ...proj, data: JSON.parse(proj.data) } })
})

projects.post("/", async (c) => {
	let user = c.get("currentUser")
	let req = await c.req.json()

	let newProject = await db
		.insert(project)
		.values({
			data: "{}",
			name: req.name,
			userId: user.id,
			createdAt: Date.now(),
		})
		.returning({
			id: project.id,
			name: project.name,
			createdAt: project.createdAt,
		})
		.get()

	return c.json({ project: newProject })
})
