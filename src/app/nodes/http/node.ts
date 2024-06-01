import { LucideGlobe } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	response: z.unknown(),
})
const properties = z.object({
	method: z.string(),
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

	component(props: { node: HttpRequestNode }): JSX.Element {
		return Component(props)
	}

	static get icon() {
		return LucideGlobe
	}
}