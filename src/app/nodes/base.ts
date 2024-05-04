import { proxy } from "valtio"
import { z } from "zod"

type OutputValue<T = unknown> = {
	id: string
	value: T
	to?: string
	from?: string
}

export type InputValue = {
	id: string
	fromNodeID?: string
	outputName?: string
}

export type Schema = z.AnyZodObject

export type NodeValues<T extends Schema> = z.TypeOf<T>

export abstract class BaseNode {
	static type: string

	id = crypto.randomUUID()

	inputs: Record<string, InputValue> = proxy({} as never)
	outputs: Record<string, OutputValue> = proxy({} as never)

	abstract name: string
	abstract definition: {
		inputs: Schema
		outputs: Schema
	}
	abstract component(props: { node: BaseNode }): JSX.Element

	initialize() {
		const inputKeys = getSchemaKeys(this.definition.inputs)
		const outputKeys = getSchemaKeys(this.definition.outputs)

		inputKeys.forEach((key) => {
			this.inputs[key] = {
				id: crypto.randomUUID(),
				fromNodeID: undefined,
				outputName: undefined,
			}
		})

		outputKeys.forEach((key) => {
			this.outputs[key] = {
				id: crypto.randomUUID(),
				value: null,
			}
		})
	}

	setOutput(key: string, value: unknown) {
		if (!this.outputs) throw new Error("Outputs not initialized")

		this.outputs[key].value = value
	}

	setInput(key: string, { fromNodeID, outputName }: Omit<InputValue, "id">) {
		if (!this.inputs) throw new Error("Inputs not initialized")
		if (!this.inputs[key]) throw new Error("Input key not found")

		this.inputs[key].fromNodeID = fromNodeID
		this.inputs[key].outputName = outputName
	}

	getOutput(name: string): OutputValue | undefined {
		if (!this.outputs) throw new Error("Outputs not initialized")

		return this.outputs?.[name]
	}

	getResult(_inputs: unknown): unknown {
		return null
	}
}

export function getSchemaKeys<T extends z.ZodTypeAny>(schema: T): string[] {
	if (schema === null || schema === undefined) return []
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
		return getSchemaKeys(schema.unwrap())
	if (schema instanceof z.ZodArray) return getSchemaKeys(schema.element)
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		const entries = Object.entries(schema.shape)
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			const nested =
				value instanceof z.ZodType
					? getSchemaKeys(value).map((subKey) => `${key}.${subKey}`)
					: []
			// return nested keys
			return nested.length ? nested : key
		})
	}
	// return empty array
	return []
}
