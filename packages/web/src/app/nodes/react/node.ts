import { LucideCodeXml } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	output: z.unknown(),
})
const properties = z.object({
	code: z.string(),
})

export class ReactNode extends BaseNode<
	typeof inputs,
	typeof outputs,
	typeof properties
> {
	definition = {
		inputs,
		outputs,
		properties,
	}

	dynamic = true

	static type = "REACT"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 320, height: 240 }
	}

	component(props: { node: ReactNode }): JSX.Element {
		return Component(props)
	}

	static get icon() {
		return LucideCodeXml
	}
}
