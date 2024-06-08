import { LucideBug } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({
	value: z.unknown(),
})
const outputs = z.object({})

export class DebugNode extends BaseNode<typeof inputs, typeof outputs> {
	definition = {
		inputs,
		outputs,
	}

	static type = "DEBUG"

	static get icon() {
		return LucideBug
	}

	component(props: { node: DebugNode }): JSX.Element {
		return Component(props)
	}
}
