import { db, sql } from "../database/db.ts"
import {
	Project,
	project,
	ProjectScreenshot,
	projectScreenshot,
} from "../database/schema.ts"
import { HonoAPI } from "../hono.ts"

export const projects = new HonoAPI()

projects.get("/", async (c) => {
	let user = c.get("currentUser")
	let projects = await db
		.select()
		.from(project)
		.where(sql`user_id = ${user.id}`)
		.leftJoin(
			projectScreenshot,
			sql`project.id = project_screenshot.project_id`,
		)
		.all()
	return c.json({
		projects: projects.map((p) => ({
			...p.project,
			data: JSON.parse(p.project.data),
			screenshot: p.project_screenshot,
		})),
	})
})

projects.get("/:id", async (c) => {
	let user = c.get("currentUser")
	let isScreenshot = c.get("isScreenshot")
	let id = c.req.param("id")
	let proj:
		| { project: Project | null; project_screenshot: ProjectScreenshot | null }
		| undefined
	if (user) {
		proj = await db
			.select()
			.from(project)
			.where(sql`project.id = ${id} AND user_id = ${user.id}`)
			.leftJoin(
				projectScreenshot,
				sql`${project.id} = ${projectScreenshot.projectID}`,
			)
			.get()
	} else if (isScreenshot) {
		proj = (await db
			.select()
			.from(project)
			.where(sql`id = ${id}`)
			.get()) as never
	}
	if (!proj || !proj.project) {
		return c.text("Project not found", 404)
	}
	return c.json({
		project: {
			...proj.project,
			data: JSON.parse(proj.project.data),
			screenshot: proj.project_screenshot,
		},
	})
})

projects.patch("/:id", async (c) => {
	let user = c.get("currentUser")
	let id = c.req.param("id")
	let req = await c.req.json()
	if (!req.data) {
		return c.json({
			error: "Missing data",
		})
	}
	let result = await db
		.update(project)
		.set({
			data: JSON.stringify(req.data),
		})
		.where(sql`${project.id} = ${id} and ${project.userId} = ${user.id}`)
		.returning({
			id: project.id,
			data: project.data,
		})
		.get()

	return c.json({ project: result })
})

projects.delete("/:id", async (c) => {
	let user = c.get("currentUser")
	let id = c.req.param("id")
	let data = await db
		.select({
			count: sql`COUNT(${project.id})`,
		})
		.from(project)
		.where(sql`project.id = ${id} AND user_id = ${user.id}`)
		.get()
	if (!data || data.count === 0) {
		return c.text("Project not found", 404)
	}
	await db
		.delete(project)
		.where(sql`id = ${id}`)
		.run()
	return c.json({})
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
