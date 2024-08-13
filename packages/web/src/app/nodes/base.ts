import { proxy } from "valtio"
import { z } from "zod"

type OutputData = {
	id: string
	toNodeID?: string
	toInputName?: string
	fromOutputName?: string
}

type InputData = {
	id: string
	fromNodeID?: string
	outputName?: string
}

export type Schema = z.AnyZodObject | z.ZodRecord

export type Definition<T extends Schema> = z.TypeOf<T>

type SchemaKey<D extends Schema> = keyof z.TypeOf<D> | "node"
type SchemaValue<
	D extends Schema,
	K extends SchemaKey<D> = SchemaKey<D>,
> = K extends "node" ? string : z.TypeOf<D>[K]

// this can probably be typed better, but I dont care right now
export abstract class BaseNode<
	InputDef extends Schema = Schema,
	OutputDef extends Schema = Schema,
	PropertiesDef extends Schema = Schema,
> {
	static type: string

	id: string

	inputData: Record<SchemaKey<InputDef>, InputData> = proxy({} as never)
	outputData: Array<OutputData> = proxy([] as never)

	inputs: Record<SchemaKey<InputDef>, SchemaValue<InputDef>> = proxy(
		{} as never,
	)
	outputs: Record<SchemaKey<OutputDef>, SchemaValue<OutputDef>> = proxy(
		{} as never,
	)
	properties: Partial<{
		[K in SchemaKey<PropertiesDef>]: SchemaValue<PropertiesDef, K>
	}> = proxy({} as never)

	meta = proxy({
		name: "",
		notes: "",
		position: {
			x: 0,
			y: 0,
		},
		size: {
			width: 0,
			height: 0,
		},
	})

	dynamic = false
	runnable = true

	abstract definition: {
		inputs: Schema
		outputs: Schema
		properties?: Schema
	}
	abstract component(props: { node: BaseNode }): JSX.Element
	static get icon(): React.ExoticComponent | null {
		return null
	}

	constructor(id?: string) {
		this.id = id ?? crypto.randomUUID()

		// good enough for now
		this.meta.name =
			this.type.substring(0, 1).toUpperCase() +
			this.type.substring(1).toLowerCase()
	}

	onCreate(_projectID: string): Promise<void> {
		return Promise.resolve()
	}

	onDelete(): Promise<void> {
		return Promise.resolve()
	}

	run(
		..._args: unknown[]
	): Promise<
		Omit<{ [K in SchemaKey<OutputDef>]: SchemaValue<OutputDef, K> }, "node">
	> {
		throw new Error("run() is not implemented")
	}

	initialize(nodeData?: ReturnType<BaseNode["toJSON"]>) {
		let inputKeys = getSchemaKeys(
			this.definition.inputs,
		) as SchemaKey<InputDef>[]

		inputKeys.forEach((key) => {
			this.inputData[key] = {
				id: crypto.randomUUID(),
				fromNodeID: undefined,
				outputName: undefined,
			}
		})

		this.outputs["node"] = this.id

		if (nodeData) {
			Object.entries(nodeData.inputData).forEach(([key, value]) => {
				this.setInputData(key, {
					fromNodeID: value.fromNodeID,
					outputName: value.outputName,
				})
			})
			nodeData.outputData.forEach((value) => {
				this.addOutputData({
					fromOutputName: value.fromOutputName,
					toInputName: value.toInputName,
					toNodeID: value.toNodeID,
				})
			})
			Object.entries(nodeData.properties).forEach(([key, value]) => {
				this.setProperty(key as never, value as never)
			})
		}

		Object.entries(this.meta).forEach(([mKey, _value]) => {
			let key = mKey as never // dont care atm
			this.meta[key] = (nodeData?.meta[key] ?? this.meta[key]) as never
		})
	}

	setOutput(key: SchemaKey<OutputDef>, value: SchemaValue<OutputDef>) {
		this.outputs[key] = value
	}

	setInput(key: SchemaKey<InputDef>, value: SchemaValue<InputDef>) {
		this.inputs[key] = value
	}

	setProperty<K extends SchemaKey<PropertiesDef> = keyof this["properties"]>(
		key: K,
		value: SchemaValue<PropertiesDef, K>,
	) {
		this.properties[key] = value
	}

	setInputData(
		key: SchemaKey<InputDef>,
		{ fromNodeID, outputName }: Omit<InputData, "id">,
	) {
		if (!this.inputData) throw new Error("Inputs not initialized")
		if (!this.inputData[key]) {
			if (!this.dynamic) {
				console.warn("Input key not found", { key, fromNodeID, outputName })
				return
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

	addOutputData(data: Omit<OutputData, "id">) {
		let existing = this.outputData.find(
			(d) =>
				d.fromOutputName == data.fromOutputName &&
				d.toInputName === data.toInputName &&
				d.toNodeID === data.toNodeID,
		)
		if (existing) return
		let newOutputData = {
			id: crypto.randomUUID(),
			...data,
		}
		this.outputData.push(newOutputData)
	}

	removeInputData(key: SchemaKey<InputDef>) {
		if (!this.inputData) throw new Error("Inputs not initialized")

		delete this.inputs[key]
		if (this.inputData[key]) {
			this.inputData[key].fromNodeID = undefined
			this.inputData[key].outputName = undefined
		}
	}

	deleteInputData(key: SchemaKey<InputDef>) {
		if (!this.dynamic) throw new Error("Dynamic inputs not enabled")

		delete this.inputs[key]
		delete this.inputData[key]
	}

	getOutputData(name: SchemaKey<OutputDef>): OutputData[] | undefined {
		if (!this.outputData) throw new Error("Outputs not initialized")
		return this.outputData?.filter((d) => d.fromOutputName === name)
	}

	removeOutputData(name: SchemaKey<OutputDef>) {
		if (!this.outputData) throw new Error("Outputs not initialized")
		this.outputData = this.outputData.filter((d) => d.fromOutputName !== name)
	}

	getOutputKeys(): SchemaKey<OutputDef>[] {
		return getSchemaKeys(this.definition.outputs) as SchemaKey<OutputDef>[]
	}

	getResult(_inputs: unknown): unknown {
		return null
	}

	get type() {
		return (<typeof BaseNode>this.constructor).type
	}

	get name() {
		return this.meta.name
	}

	clone(): BaseNode {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		let node = new (this.constructor as any)()
		node.initialize(this.toJSON())
		return node
	}

	toJSON() {
		return {
			id: this.id,
			type: this.type,
			inputData: { ...this.inputData },
			outputData: Array.from(this.outputData),
			properties: { ...this.properties },
			meta: { ...this.meta },
			// outputs: { ...this.outputs },
			// inputs: { ...this.inputs },
		}
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
