import { proxy, useSnapshot } from "valtio"

import { BaseNode, Schema } from "./base"

const dummyProxy = proxy({
	value: null,
})

export function useOutputValue<
	I extends Schema,
	O extends Schema,
	Node extends BaseNode<I, O>,
	// [TODO]: fix key type
>(node: Node | undefined, key: string) {
	const state = useSnapshot(node?.outputs?.[key] ?? dummyProxy)
	return state.value
}

type NodeInput<T> = T extends BaseNode<infer X, never> ? X : never
type NodeOutput<T> = T extends BaseNode<never, infer X> ? X : never

export function useNodeInputs<
	Node extends BaseNode<NodeInput<Node>, NodeOutput<Node>>,
>(node: Node, key: string) {
	return useSnapshot(node.inputs?.[key] ?? dummyProxy)
}
