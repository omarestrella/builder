import { useDragNode } from "@/managers/drag/useDragNode"
import { ALL_NODES } from "@/nodes/nodes"

function DragNode({ node }: { node: (typeof ALL_NODES)[number] }) {
	let dragProps = useDragNode(node.type)

	let name = node.type.substring(0, 1) + node.type.toLowerCase().substring(1)

	return (
		<button
			key={node.type}
			className={`
     flex w-full cursor-grab items-center gap-1 rounded-md border p-2 transition-colors

     hover:border-slate-300
   `}
			{...dragProps}
		>
			{node.icon ? <node.icon size={14} /> : null}
			<span className="text-xs">{name}</span>
		</button>
	)
}

export function NodeList() {
	return (
		<div className="grid grid-cols-2 justify-center gap-2 p-2">
			{ALL_NODES.map((node) => (
				<DragNode key={node.type} node={node} />
			))}
		</div>
	)
}
