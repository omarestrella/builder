import { DebugNode } from "./debug/node"
import { InputNode } from "./input/node"
import { MapNode } from "./map/node"
import { TypeScriptNode } from "./typescript/node"

export { DebugNode, InputNode, MapNode, TypeScriptNode }

export const ALL_NODES = [InputNode, MapNode, TypeScriptNode, DebugNode]

export * from "./base"

export function nodeFromType(type: string) {
	let NodeDef = ALL_NODES.find((node) => node.type === type)

	if (!NodeDef) {
		throw new Error(`Unknown node type: ${type}`)
	}

	let node = new NodeDef()

	node.initialize()
	return node
}
