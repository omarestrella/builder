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

export class AddNode extends BaseNode {
	name = "Add"

	definition = {
		inputs,
		outputs,
	}

	static type = "ADD"

	component(props: { node: AddNode }): JSX.Element {
		return Component(props)
	}
}
