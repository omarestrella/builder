import { Handle, NodeProps, Position } from "reactflow"

import { BaseNode } from "./base"

export function NodeComponent({ data: node, selected }: NodeProps<BaseNode>) {
	return (
		<>
			{Object.entries(node.inputData ?? {}).map(([key, _value], idx) => (
				<Handle
					key={key}
					type="target"
					position={Position.Left}
					id={key}
					style={{
						top: `calc(50% + ${20 * idx - 10}px)`,
						width: "10px",
						height: "10px",
						transform: "translate(0, -50%)",
					}}
				/>
			))}

			<div
				className={`rounded-md border bg-white p-3 ${
					selected ? "border-black" : ""
				}`}
			>
				<node.component node={node} />

				<div className="text-xs text-gray-500">{node.id}</div>
			</div>

			{Object.entries(node.outputData ?? {}).map(([key, _value]) => (
				<Handle
					key={key}
					type="source"
					position={Position.Right}
					id={key}
					style={{
						width: "10px",
						height: "10px",
						transform: "translate(0, -50%)",
					}}
				/>
			))}
		</>
	)
}
