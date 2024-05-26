import { LucideBraces } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	result: z.unknown(),
})
const properties = z.object({
	code: z.string(),
})

export class JavaScriptNode extends BaseNode<
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

	static type = "JAVASCRIPT"

	component(props: { node: JavaScriptNode }): JSX.Element {
		return Component(props)
	}

	static get icon() {
		return LucideBraces
	}
}
