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
	static type = "SUBTRACT"

	name = "Subtract"

	definition = {
		inputs,
		outputs,
	}

	component(props: { node: SubtractNode }): JSX.Element {
		return Component(props)
	}
}
