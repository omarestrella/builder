import { LucideRepeat } from "lucide-react"
import { z } from "zod"

import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.object({
	node: z.string(),
})
const outputs = z.object({
	results: z.array(z.unknown()),
})
const properties = z.object({
	times: z.number(),
})

export class RepeaterNode extends BaseNode<
	typeof inputs,
	typeof outputs,
	typeof properties
> {
	definition = {
		inputs,
		outputs,
		properties,
	}

	static type = "REPEATER"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 240, height: 200 }
	}

	component(props: { node: RepeaterNode }): JSX.Element {
		return Component(props)
	}

	async run({
		abortController,
		params,
	}: {
		abortController?: AbortController
		params: { repeatNode: BaseNode }
	}) {
		if (!params.repeatNode) {
			return { results: [] }
		}

		let { times } = this.properties
		if (!times) {
			return { results: [] }
		}

		let promises: Promise<unknown>[] = []
		for (let i = 0; i < times; i++) {
			let promise = params.repeatNode.run({
				abortController,
			})
			promises.push(promise)
		}

		let results = await Promise.all(promises)

		this.setOutput("results", results)

		return { results }
	}

	static get icon() {
		return LucideRepeat
	}
}
