import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({})
const outputs = z.object({
	number: z.number(),
})

export class NumberNode extends BaseNode<typeof inputs, typeof outputs> {
	static type = "NUMBER"

	name = "Number"

	definition = {
		inputs,
		outputs,
	}

	component(props: { node: NumberNode }): JSX.Element {
		return Component(props)
	}
}
