import { LucideTextCursorInput } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({})
const outputs = z.object({
	value: z.string(),
})

export class InputNode extends BaseNode<typeof inputs, typeof outputs> {
	definition = {
		inputs,
		outputs,
	}

	static type = "INPUT"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 240, height: 46 }
	}

	component(props: { node: InputNode }): JSX.Element {
		return Component(props)
	}

	static get icon() {
		return LucideTextCursorInput
	}
}
