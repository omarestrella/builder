import { LucideBraces } from "lucide-react"
import { z } from "zod"

import { vmManager } from "../../managers/vm/manager"
import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	result: z.unknown(),
	error: z.string(),
})
const properties = z.object({
	code: z.string(),
})

export class JavaScriptNode extends BaseNode<
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

	static type = "JAVASCRIPT"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 320, height: 240 }
	}

	component(props: { node: JavaScriptNode }): JSX.Element {
		return Component(props)
	}

	async run() {
		await vmManager.awaitReady()

		try {
			let { code } = this.properties

			if (!code) {
				return null
			}

			let context: Record<string, unknown> = {}
			Object.entries(this.inputData).forEach(([key]) => {
				context[key] = this.inputs[key]
			})
			let result = vmManager.scopedEval(
				`const runner = () => {
					${code}
				}
				runner()
				`,
				context,
			)

			if (result instanceof Promise) {
				let value = await result
				this.setOutput("result", value)
				return value
			} else {
				this.setOutput("result", result)
				return result
			}
		} catch (e: unknown) {
			this.setOutput("error", e instanceof Error ? e.message : String(e))
			throw e
		}
	}

	static get icon() {
		return LucideBraces
	}
}
