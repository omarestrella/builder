import { Handle, NodeProps, Position } from "reactflow"

import { Tooltip } from "../../components/tooltip"
import { BaseNode } from "../base"
import { useNodeOutput } from "../hooks"
import { NodeWrapper } from "./node"

export function CanvasNode({ data: node, selected }: NodeProps<BaseNode>) {
	return (
		<NodeWrapper
			node={node}
			selected={selected}
			inputs={<Inputs node={node} />}
			outputs={<Outputs node={node} />}
		/>
	)
}

function Inputs({ node }: { node: BaseNode }) {
	let inputData = Object.entries(node.inputData ?? {})

	return inputData.length > 0 ? (
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
	) : null
}

function Outputs({ node }: { node: BaseNode }) {
	let outputData = Object.entries(node.outputData ?? {})

	return outputData.length > 0 ? (
		<div className="flex flex-col gap-2 p-2">
			<p className="m-0 text-xs font-bold">Outputs</p>
			<div className="relative">
				{outputData.map(([key, _value]) => (
					<OutputHandle key={key} node={node} outputKey={key} />
				))}
			</div>
		</div>
	) : null
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
