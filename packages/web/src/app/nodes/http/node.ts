import { LucideGlobe } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	response: z.unknown(),
	error: z.unknown(),
})
const properties = z.object({
	method: z.string(),
	url: z.string(),
	body: z.string(),
	headers: z.array(z.object({ key: z.string(), value: z.string() })),
})

export class HttpRequestNode extends BaseNode<
	typeof inputs,
	typeof outputs,
	typeof properties
> {
	definition = {
		inputs,
		outputs,
		properties,
	}

	dynamic = true

	static type = "HTTP"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 400, height: 280 }
	}

	component(props: { node: HttpRequestNode }): JSX.Element {
		return Component(props)
	}

	static get icon() {
		return LucideGlobe
	}
}
