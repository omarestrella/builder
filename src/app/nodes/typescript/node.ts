import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	result: z.unknown(),
})

export class TypeScriptNode extends BaseNode<typeof inputs, typeof outputs> {
	definition = {
		inputs,
		outputs,
	}

	dynamic = true

	static type = "TYPESCRIPT"

	component(props: { node: TypeScriptNode }): JSX.Element {
		return Component(props)
	}
}
