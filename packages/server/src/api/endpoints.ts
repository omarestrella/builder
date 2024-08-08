import { transform } from "esbuild"
import React from "react"
import { renderToString } from "react-dom/server"
import { z } from "zod"

import { db, sql } from "../database/db.ts"
import { nodeEndpoint, project } from "../database/schema.ts"
import { HonoAPI } from "../hono.ts"

export const endpoints = new HonoAPI()

let provisionSchema = z.object({
	projectID: z.string(),
	nodeID: z.string(),
})

async function getDocument(strCode: string, title: string) {
	let { code } = await transform(strCode, {
		loader: "jsx",
		jsx: "transform",
		jsxSideEffects: true,
	})
	let finalCode = `(() => {
			${code}
		})()`
	;(globalThis as unknown as { React?: typeof React }).React = React
	// EXTREMELY UNSAFE, THIS NEEDS TO BE REPLACED
	let data = eval(finalCode)

	return `
			<!DOCTYPE html>
    	<html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
				<script src="https://cdn.tailwindcss.com"></script>
				<title>${title}</title>
      </head>
			<body>
			<div id="root">
				${renderToString(data)}
			</div>
			<script type="module">
				import React from "https://esm.sh/react";
				import { hydrateRoot } from "https://esm.sh/react-dom/client";

				const result = ${finalCode};
				const container = document.querySelector("#root")
				hydrateRoot(container, result)
			</script>
			</body>
			</html>
		`
}

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

	if (!sourceNode) {
		return c.json({ error: "No source node" })
	}

	let contentType = node.properties.contentType ?? "application/json"
	console.log(contentType)

	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let renderer: (...args: any[]) => Response | Promise<Response> = c.json
	if (contentType === "text/html") {
		renderer = c.render
	} else if (contentType === "text") {
		renderer = c.text
	}

	if (sourceNode.type === "HTTP") {
		let res = await fetch(sourceNode.properties.url, {
			method: sourceNode.properties.method,
		})
		let json = await res.json()
		return renderer({
			response: json,
		})
	} else if (sourceNode.type === "INPUT") {
		return renderer({
			response: sourceNode.outputs.value,
		})
	} else if (sourceNode.type === "REACT") {
		let code = sourceNode.properties.code
		return renderer(getDocument(code, sourceNode.meta.name))
	}

	return renderer({
		node,
		sourceNode,
	})
})

endpoints.delete("/:nodeID", async (c) => {
	let nodeID = c.req.param("nodeID")

	await db.delete(nodeEndpoint).where(sql`${nodeEndpoint.nodeID} = ${nodeID}`)

	return c.json({
		ok: true,
	})
})
