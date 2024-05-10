import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({
	value: z.string(),
})
const outputs = z.object({})

export class DebugNode extends BaseNode<typeof inputs, typeof outputs> {
	definition = {
		inputs,
		outputs,
	}

	name = "Debug"

	static type = "DEBUG"

	component(props: { node: DebugNode }): JSX.Element {
		return Component(props)
	}
}
