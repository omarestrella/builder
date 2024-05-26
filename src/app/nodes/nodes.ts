import { BaseNode } from "./base"
import { DebugNode } from "./debug/node"
import { InputNode } from "./input/node"
import { JavaScriptNode } from "./javascript/node"

export { DebugNode, InputNode, JavaScriptNode as TypeScriptNode }

export const ALL_NODES = [InputNode, JavaScriptNode, DebugNode]

export * from "./base"

export function nodeFromType(
	type: string,
	id?: string,
	nodeData?: ReturnType<BaseNode["toJSON"]>,
) {
	let NodeDef = ALL_NODES.find((node) => node.type === type)

	if (!NodeDef) {
		throw new Error(`Unknown node type: ${type}`)
	}

	let node = new NodeDef(id)

	node.initialize(nodeData)
	return node
}
