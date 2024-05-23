import { useSnapshot } from "valtio"
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
	let meta = useSnapshot(node.meta)
	return meta.size
}
