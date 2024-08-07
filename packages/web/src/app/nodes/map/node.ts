import { LucideMap } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({})
const outputs = z.object({
	lat: z.number(),
	long: z.number(),
})

export class MapNode extends BaseNode<typeof inputs, typeof outputs> {
	definition = {
		inputs,
		outputs,
	}

	static type = "MAP"

	component(props: { node: MapNode }): JSX.Element {
		return Component(props)
	}

	static get icon() {
		return LucideMap
	}
}
