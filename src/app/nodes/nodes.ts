import { AddNode } from "./add/node"
import { BaseNode } from "./base"
import { NumberNode } from "./number/node"
import { SubtractNode } from "./subtract/node"

export { AddNode, NumberNode, SubtractNode }

export * from "./base"

export function nodeFromType(type: string) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	let node: BaseNode<any, any>
	switch (type) {
		case NumberNode.type:
			node = new NumberNode()
			break
		case AddNode.type:
			node = new AddNode()
			break
		case SubtractNode.type:
			node = new SubtractNode()
			break
		default:
			throw new Error(`Unknown node type: ${type}`)
	}
	node.initialize()
	return node
}
