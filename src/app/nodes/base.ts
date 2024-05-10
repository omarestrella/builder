import { proxy } from "valtio"
import { z } from "zod"

type OutputData = {
	id: string
	to?: string
	from?: string
}

type InputData = {
	id: string
	fromNodeID?: string
	outputName?: string
}

export type Schema = z.AnyZodObject

export type Definition<T extends Schema> = z.TypeOf<T>

// this can probably be typed better, but I dont care right now
export abstract class BaseNode<
	InputDef extends Schema = Schema,
	OutputDef extends Schema = Schema,
	InputKey extends keyof z.TypeOf<InputDef> = keyof z.TypeOf<InputDef>,
	OutputKey extends keyof z.TypeOf<OutputDef> = keyof z.TypeOf<OutputDef>,
	InputValue = z.TypeOf<InputDef>[InputKey],
	OutputValue = z.TypeOf<OutputDef>[OutputKey],
> {
	static type: string

	id = crypto.randomUUID()

	inputData: Record<InputKey, InputData> = proxy({} as never)
	outputData: Record<OutputKey, OutputData> = proxy({} as never)

	inputs: Record<InputKey, InputValue> = proxy({} as never)
	outputs: Record<OutputKey, OutputValue> = proxy({} as never)

	abstract name: string
	abstract definition: {
		inputs: Schema
		outputs: Schema
	}
	abstract component(props: { node: BaseNode }): JSX.Element

	initialize() {
		let inputKeys = getSchemaKeys(this.definition.inputs) as InputKey[]
		let outputKeys = getSchemaKeys(this.definition.outputs) as OutputKey[]

		inputKeys.forEach((key) => {
			this.inputData[key] = {
				id: crypto.randomUUID(),
				fromNodeID: undefined,
				outputName: undefined,
			}
		})

		outputKeys.forEach((key) => {
			this.outputData[key] = {
				id: crypto.randomUUID(),
			}
		})
	}

	setOutput(key: OutputKey, value: OutputValue) {
		this.outputs[key] = value
	}

	setInput(key: InputKey, value: InputValue) {
		this.inputs[key] = value
		this.writeOutputs()
	}

	setInputData(
		key: InputKey,
		{ fromNodeID, outputName }: Omit<InputData, "id">,
	) {
		if (!this.inputData) throw new Error("Inputs not initialized")
		if (!this.inputData[key]) throw new Error("Input key not found")

		this.inputData[key].fromNodeID = fromNodeID
		this.inputData[key].outputName = outputName
	}

	removeInputData(key: InputKey) {
		if (!this.inputData) throw new Error("Inputs not initialized")

		delete this.inputs[key]
		this.inputData[key].fromNodeID = undefined
		this.inputData[key].outputName = undefined
	}

	getOutputData(name: OutputKey): OutputData | undefined {
		if (!this.outputData) throw new Error("Outputs not initialized")
		return this.outputData?.[name]
	}

	getResult(_inputs: unknown): unknown {
		return null
	}

	protected writeOutputs() {
		console.warn("writeOutputs not implemented.")
	}
}

export function getSchemaKeys<T extends z.ZodTypeAny>(schema: T): string[] {
	if (schema === null || schema === undefined) return []
	if (schema instanceof z.ZodNullable || schema instanceof z.ZodOptional)
		return getSchemaKeys(schema.unwrap())
	if (schema instanceof z.ZodArray) return getSchemaKeys(schema.element)
	if (schema instanceof z.ZodObject) {
		// get key/value pairs from schema
		let entries = Object.entries(schema.shape)
		// loop through key/value pairs
		return entries.flatMap(([key, value]) => {
			// get nested keys
			let nested =
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
