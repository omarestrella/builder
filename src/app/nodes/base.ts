import { proxy } from "valtio"
import { z } from "zod"

type OutputValue<T> = {
	id: string
	value: T
	to?: string
	from?: string
}

type InputValue = {
	id: string
	fromNodeID?: string
	outputName?: string
}

export type Schema = z.AnyZodObject

export abstract class BaseNode<
	InputSchema extends Schema,
	OutputSchema extends Schema,
	Inputs = z.TypeOf<InputSchema>,
	Outputs = z.TypeOf<OutputSchema>,
> {
	static type: string

	id = crypto.randomUUID()

	inputs?: Record<keyof Inputs, InputValue>
	outputs?: Record<keyof Outputs, OutputValue<Outputs[keyof Outputs] | null>>

	abstract name: string
	abstract definition: {
		inputs: InputSchema
		outputs: OutputSchema
	}
	abstract component(props: {
		node: BaseNode<InputSchema, OutputSchema>
	}): JSX.Element

	initialize() {
		const inputKeys = getSchemaKeys(
			this.definition.inputs,
		) as unknown as (keyof Inputs)[]
		const outputKeys = getSchemaKeys(
			this.definition.outputs,
		) as unknown as (keyof Outputs)[]

		this.inputs = inputKeys.reduce((acc, key) => {
			acc[key] = proxy({
				id: crypto.randomUUID(),
				fromNodeID: undefined,
				outputName: undefined,
			})
			return acc
		}, {} as NonNullable<typeof this.inputs>)

		this.outputs = outputKeys.reduce((acc, key) => {
			acc[key] = proxy({
				id: crypto.randomUUID(),
				value: null,
			})
			return acc
		}, {} as NonNullable<typeof this.outputs>)
	}

	setOutput<T extends keyof Outputs>(key: T, value: Outputs[T]) {
		if (!this.outputs) throw new Error("Outputs not initialized")

		this.outputs[key].value = value
	}

	setInput<T extends keyof Inputs>(
		key: T,
		{ fromNodeID, outputName }: Omit<InputValue, "id">,
	) {
		if (!this.inputs) throw new Error("Inputs not initialized")
		if (!this.inputs[key]) throw new Error("Input key not found")

		this.inputs[key].fromNodeID = fromNodeID
		this.inputs[key].outputName = outputName
	}

	getOutput(name: keyof Outputs): OutputValue<unknown> | undefined {
		if (!this.outputs) throw new Error("Outputs not initialized")

		return this.outputs?.[name]
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
