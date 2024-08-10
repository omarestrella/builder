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

	runnable = false

	static type = "DEBUG"

	static get icon() {
		return LucideBug
	}

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 240, height: 128 }
	}

	component(props: { node: DebugNode }): JSX.Element {
		return Component(props)
	}
}
