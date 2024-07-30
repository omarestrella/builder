import { LucideWebhook } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({
	response: z.unknown(),
})
const outputs = z.object({})
const properties = z.object({
	contentType: z.string(),
	method: z.string(),
	url: z.string(),
	initialized: z.boolean(),
})

export class EndpointNode extends BaseNode<
	typeof inputs,
	typeof outputs,
	typeof properties
> {
	definition = {
		inputs,
		outputs,
		properties,
	}

	static type = "ENDPOINT"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 320, height: 240 }
	}

	component(props: { node: EndpointNode }): JSX.Element {
		return Component(props)
	}

	async onCreate(projectID: string): Promise<void> {
		let res = await fetch("/api/endpoints/provision", {
			method: "POST",
			body: JSON.stringify({
				projectID,
				nodeID: this.id,
			}),
		})
		let data = await res.json()
		this.setProperty("url", data.endpoint.url)
		this.setProperty("initialized", true)
	}

	async onDelete(): Promise<void> {
		await fetch(`/api/endpoints/${this.id}`, {
			method: "DELETE",
		})
	}

	static get icon() {
		return LucideWebhook
	}
}
