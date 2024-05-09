import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({
	a: z.number(),
	b: z.number(),
})
const outputs = z.object({
	result: z.number(),
})

export class SubtractNode extends BaseNode {
	definition = {
		inputs,
		outputs,
	}

	static type = "SUBTRACT"

	name = "Subtract"

	component(props: { node: SubtractNode }): JSX.Element {
		return Component(props)
	}

	protected writeOutputs(): void {
		const { a, b } = this.inputs
		this.setOutput("result", a - b)
	}
}
