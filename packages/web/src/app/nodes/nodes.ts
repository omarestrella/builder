import { BaseNode } from "./base"
import { DebugNode } from "./debug/node"
import { EndpointNode } from "./endpoint/node"
import { HttpRequestNode } from "./http/node"
import { InputNode } from "./input/node"
import { JavaScriptNode } from "./javascript/node"
import { ReactNode } from "./react/node"

export {
	DebugNode,
	EndpointNode,
	HttpRequestNode,
	InputNode,
	JavaScriptNode,
	ReactNode,
}

export const ALL_NODES = [
	InputNode,
	JavaScriptNode,
	ReactNode,
	EndpointNode,
	HttpRequestNode,
	DebugNode,
]

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
