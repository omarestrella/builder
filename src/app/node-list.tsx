import { useDragNode } from "./managers/drag/useDragNode"
import { AddNode, BaseNode, NumberNode, SubtractNode } from "./nodes/nodes"

function DragNode({ node }: { node: typeof BaseNode }) {
	const dragProps = useDragNode(node.type)

	return (
		<button key={node.type} className="border" {...dragProps}>
			{node.type}
		</button>
	)
}

export function NodeList() {
	const nodes = [NumberNode, AddNode, SubtractNode]
	return (
		<div className="flex flex-col gap-2 p-2">
			{nodes.map((node) => (
				<DragNode key={node.type} node={node} />
			))}
		</div>
	)
}
