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

export class AddNode extends BaseNode<typeof inputs, typeof outputs> {
	definition = {
		inputs,
		outputs,
	}

	name = "Add"

	static type = "ADD"

	component(props: { node: AddNode }): JSX.Element {
		return Component(props)
	}

	protected writeOutputs(): void {
		const { a, b } = this.inputs
		this.setOutput("result", a + b)
	}
}
