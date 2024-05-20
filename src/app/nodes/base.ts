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

export type Schema = z.AnyZodObject | z.ZodRecord

export type Definition<T extends Schema> = z.TypeOf<T>

type SchemaKey<D extends Schema> = keyof z.TypeOf<D>
type SchemaValue<D extends Schema> = z.TypeOf<D>[SchemaKey<D>]

// this can probably be typed better, but I dont care right now
export abstract class BaseNode<
	InputDef extends Schema = Schema,
	OutputDef extends Schema = Schema,
	PropertiesDef extends Schema = never,
> {
	static type: string

	id = crypto.randomUUID()

	inputData: Record<SchemaKey<InputDef>, InputData> = proxy({} as never)
	outputData: Record<SchemaKey<OutputDef>, OutputData> = proxy({} as never)

	inputs: Record<SchemaKey<InputDef>, SchemaValue<InputDef>> = proxy(
		{} as never,
	)
	outputs: Record<SchemaKey<OutputDef>, SchemaValue<OutputDef>> = proxy(
		{} as never,
	)
	properties: Record<SchemaKey<PropertiesDef>, SchemaValue<PropertiesDef>> =
		proxy({} as never)

	meta = proxy({
		name: "",
		notes: "",
	})

	dynamic = false

	abstract definition: {
		inputs: Schema
		outputs: Schema
	}
	abstract component(props: { node: BaseNode }): JSX.Element

	constructor() {
		// good enough for now
		this.meta.name =
			this.type.substring(0, 1).toUpperCase() +
			this.type.substring(1).toLowerCase()
	}

	initialize() {
		let inputKeys = getSchemaKeys(
			this.definition.inputs,
		) as SchemaKey<InputDef>[]
		let outputKeys = getSchemaKeys(
			this.definition.outputs,
		) as SchemaKey<OutputDef>[]

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

	setOutput(key: SchemaKey<OutputDef>, value: SchemaValue<OutputDef>) {
		this.outputs[key] = value
	}

	setInput(key: SchemaKey<InputDef>, value: SchemaValue<InputDef>) {
		this.inputs[key] = value
		this.writeOutputs()
	}

	setInputData(
		key: SchemaKey<InputDef>,
		{ fromNodeID, outputName }: Omit<InputData, "id">,
	) {
		if (!this.inputData) throw new Error("Inputs not initialized")
		if (!this.inputData[key]) {
			if (!this.dynamic) {
				throw new Error("Input key not found")
			} else {
				this.inputData[key] = {
					id: crypto.randomUUID(),
					fromNodeID: undefined,
					outputName: undefined,
				}
			}
		}

		this.inputData[key].fromNodeID = fromNodeID
		this.inputData[key].outputName = outputName
	}

	removeInputData(key: SchemaKey<InputDef>) {
		if (!this.inputData) throw new Error("Inputs not initialized")

		delete this.inputs[key]
		this.inputData[key].fromNodeID = undefined
		this.inputData[key].outputName = undefined
	}

	getOutputData(name: SchemaKey<OutputDef>): OutputData | undefined {
		if (!this.outputData) throw new Error("Outputs not initialized")
		return this.outputData?.[name]
	}

	getResult(_inputs: unknown): unknown {
		return null
	}

	protected writeOutputs() {
		console.warn("writeOutputs not implemented.")
	}

	get type() {
		return (<typeof BaseNode>this.constructor).type
	}

	get name() {
		return this.meta.name
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
