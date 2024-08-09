import { useEffect } from "react"
import { subscribe, useSnapshot } from "valtio"
import { z } from "zod"

import { BaseNode } from "./base"

export function useNodeOutput<
	Node extends BaseNode,
	Outputs extends z.TypeOf<Node["definition"]["outputs"]>,
	Key extends keyof Outputs,
>(node: Node, key: Key) {
	let state = useSnapshot(node.outputs)
	return state[key as string] as Outputs[Key] | undefined
}

export function useNodeInputs<
	Node extends BaseNode,
	Inputs extends z.TypeOf<Node["definition"]["inputs"]>,
>(node: Node) {
	let inputs = useSnapshot(node.inputs)
	return inputs as Partial<Inputs>
}

export function useNodeInput<
	Node extends BaseNode,
	Inputs extends z.TypeOf<Node["definition"]["inputs"]>,
	Key extends keyof Inputs,
>(node: Node, key: Key) {
	let inputs = useSnapshot(node.inputs)
	return inputs[key as string] as Inputs[Key]
}

export function useNodeInputData<
	Node extends BaseNode,
	InputData extends Node["inputData"],
>(node: Node) {
	let inputData = useSnapshot(node.inputData)
	return inputData as InputData
}

export function useNodeOutputData<
	Node extends BaseNode,
	OutputData extends Node["outputData"],
>(node: Node) {
	let outputData = useSnapshot(node.outputData)
	return outputData as OutputData
}

export function useNodeProperty<
	Node extends BaseNode,
	Definition extends NonNullable<Node["definition"]["properties"]>,
	Properties extends z.TypeOf<Definition>,
	Key extends keyof Properties,
>(node: Node, key: Key) {
	let properties = useSnapshot(node.properties)
	return properties[key as string] as Properties[Key]
}

export function useNodeName(node: BaseNode) {
	let meta = useSnapshot(node.meta)
	return meta.name
}
export function useNodeSize(node: BaseNode) {
	return useSnapshot(node.meta.size)
}
export function useNodePositionEffect(
	node: BaseNode,
	handler: (position: { x: number; y: number }) => void,
) {
	useEffect(() => {
		let unsubscribe = subscribe(node.meta.position, () => {
			handler(node.meta.position)
		})
		return () => {
			unsubscribe()
		}
	}, [node, handler])
}
