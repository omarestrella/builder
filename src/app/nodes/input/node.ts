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

	name = "Input"

	static type = "INPUT"

	component(props: { node: InputNode }): JSX.Element {
		return Component(props)
	}
}
