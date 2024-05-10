import { useDragNode } from "./managers/drag/useDragNode"
import { ALL_NODES } from "./nodes/nodes"

function DragNode({ node }: { node: (typeof ALL_NODES)[number] }) {
	let dragProps = useDragNode(node.type)

	return (
		<button key={node.type} className="border" {...dragProps}>
			{node.type}
		</button>
	)
}

export function NodeList() {
	return (
		<div className="flex flex-col gap-2 p-2">
			{ALL_NODES.map((node) => (
				<DragNode key={node.type} node={node} />
			))}
		</div>
	)
}
