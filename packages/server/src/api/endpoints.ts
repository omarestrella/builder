import { z } from "zod"

import { db, sql } from "../database/db.ts"
import { nodeEndpoint, project } from "../database/schema.ts"
import { HonoAPI } from "../hono.ts"

export const endpoints = new HonoAPI()

let provisionSchema = z.object({
	projectID: z.string(),
	nodeID: z.string(),
})

endpoints.post("/provision", async (c) => {
	let user = c.get("currentUser")
	let json = await c.req.json()
	let { projectID, nodeID } = provisionSchema.parse(json)
	let proj = await db
		.select()
		.from(project)
		.where(sql`${project.id} = ${projectID} and ${project.userId} = ${user.id}`)
		.get()
	if (!proj) {
		return c.json({ error: "Project not found" })
	}

	let endpoint = await db
		.insert(nodeEndpoint)
		.values({
			nodeID,
			projectID: proj.id,
			url: `/api/endpoints/${nodeID}`,
		})
		.returning({
			id: nodeEndpoint.id,
			url: nodeEndpoint.url,
		})
		.get()
	return c.json({
		endpoint,
	})
})

endpoints.get("/:nodeID", async (c) => {
	let user = c.get("currentUser")
	let nodeID = c.req.param("nodeID")
	let endpoint = await db
		.select()
		.from(nodeEndpoint)
		.where(sql`${nodeEndpoint.nodeID} = ${nodeID}`)
		.get()
	if (!endpoint) {
		return c.json({ error: "Endpoint not found" })
	}

	let proj = await db
		.select()
		.from(project)
		.where(
			sql`${project.id} = ${endpoint.projectID} and ${project.userId} = ${user.id}`,
		)
		.get()

	if (!proj) {
		return c.json({ error: "Project not found" })
	}

	let data = JSON.parse(proj.data)
	let node = data[nodeID]

	if (!node) {
		return c.json({ error: "Node not found" })
	}

	if (!node.inputData || !node.inputData.response) {
		return c.json({ error: "No input data" })
	}

	let sourceNode = data[node.inputData.response.fromNodeID]

	if (sourceNode.type === "HTTP") {
		let res = await fetch(sourceNode.properties.url, {
			method: sourceNode.properties.method,
		})
		let json = await res.json()
		return c.json({
			response: json,
		})
	} else if (sourceNode.type === "INPUT") {
		return c.json({
			response: sourceNode.outputs.value,
		})
	}

	return c.json({
		node,
		sourceNode,
	})
})
