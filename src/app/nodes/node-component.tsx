import { Handle, NodeProps, Position } from "reactflow"

import { BaseNode } from "./base"

export function NodeComponent({
	data: node,
	selected,
}: NodeProps<BaseNode<never, never>>) {
	return (
		<>
			{Object.entries(node.inputs ?? {}).map(([key, _value], idx) => (
				<Handle
					key={key}
					type="target"
					position={Position.Left}
					id={key}
					style={{
						top: `calc(50% + ${20 * idx - 10}px)`,
					}}
				/>
			))}

			<div
				className={`rounded-md border bg-white p-3 ${
					selected ? "border-black" : ""
				}`}
			>
				<node.component node={node} />
			</div>

			{Object.entries(node.outputs ?? {}).map(([key, _value]) => (
				<Handle key={key} type="source" position={Position.Right} id={key} />
			))}
		</>
	)
}
