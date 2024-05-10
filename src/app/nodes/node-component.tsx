import { Handle, NodeProps, Position } from "reactflow"

import { Tooltip } from "../components/tooltip"
import { BaseNode } from "./base"
import { useNodeOutput } from "./hooks"

export function NodeComponent({ data: node, selected }: NodeProps<BaseNode>) {
	let inputData = Object.entries(node.inputData ?? {})
	let outputData = Object.entries(node.outputData ?? {})
	return (
		<>
			<div
				className={`flex flex-col rounded-md border bg-white/5 backdrop-blur-sm ${
					selected ? "border-black/30" : ""
				}`}
			>
				<div className="flex gap-2 border-b p-2 text-sm font-bold">
					<div className="">{node.name}</div>
				</div>

				{inputData.length > 0 ? (
					<div className="flex flex-col gap-2 border-b p-2">
						<p className="m-0 text-xs font-bold">Inputs</p>
						<div className="relative flex gap-2">
							{inputData.map(([key, _value]) => (
								<Handle
									key={key}
									type="target"
									position={Position.Top}
									id={key}
									className="!relative !inset-x-auto !top-auto !h-5 !w-fit !transform-none !rounded-sm px-1 text-xs text-white"
								>
									{key}
								</Handle>
							))}
						</div>
					</div>
				) : null}

				<div className="border-b p-2">
					<node.component node={node} />
				</div>

				<div className="text-xs text-gray-500">{node.id}</div>

				{outputData.length > 0 ? (
					<div className="flex flex-col gap-2 p-2">
						<p className="m-0 text-xs font-bold">Outputs</p>
						<div className="relative">
							{outputData.map(([key, _value]) => (
								<OutputHandle key={key} node={node} outputKey={key} />
							))}
						</div>
					</div>
				) : null}
			</div>
		</>
	)
}

function OutputHandle({
	node,
	outputKey,
}: {
	node: BaseNode
	outputKey: string
}) {
	let output = useNodeOutput(node, outputKey)

	return (
		<Tooltip label={output} side="bottom">
			<Handle
				type="source"
				position={Position.Right}
				id={outputKey}
				className="!relative !inset-x-auto !top-auto !h-5 !w-fit !transform-none !rounded-sm px-1 text-xs text-white"
			>
				{outputKey}
			</Handle>
		</Tooltip>
	)
}
