import { LucideTrash2 } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"
import { Handle, NodeProps, Position, useUpdateNodeInternals } from "reactflow"

import { Tooltip } from "@/components/tooltip"
import { nodeManager } from "@/managers/node/manager"
import { BaseNode } from "@/nodes/base"
import { NodeWrapper } from "@/nodes/components/node"
import { useNodeInputData, useNodeOutput } from "@/nodes/hooks"

export function CanvasNode({ data: node, selected }: NodeProps<BaseNode>) {
	return (
		<ErrorBoundary
			onError={(error, info) => console.error(error, info)}
			fallback={<div>Something went wrong</div>}
		>
			<NodeWrapper
				node={node}
				selected={selected}
				inputs={<Inputs node={node} />}
				outputs={<Outputs node={node} />}
			/>
		</ErrorBoundary>
	)
}

function Inputs({ node }: { node: BaseNode }) {
	let updateNodeInternals = useUpdateNodeInternals()

	let inputData = Object.entries(useNodeInputData(node))

	if (!node.dynamic && inputData.length === 0) {
		return null
	}

	return (
		<div className="flex flex-col gap-2 border-b p-2">
			<p className="m-0 text-xs font-bold">Inputs</p>

			<div className="flex gap-2">
				{inputData.length > 0 ? (
					<div className="flex flex-col gap-2">
						<div className="relative flex gap-2">
							{inputData.map(([key, _value]) => (
								<InputHandle
									key={key}
									id={key}
									label={key}
									node={node}
									dynamic={node.dynamic}
								/>
							))}
						</div>
					</div>
				) : null}
				{node.dynamic ? (
					<button
						className="flex h-5 items-center rounded-sm bg-black px-1 text-xs text-white"
						onClick={() => {
							let name = window.prompt("Enter the name of the argument")
							if (name) {
								node.setInputData(name, {
									fromNodeID: undefined,
									outputName: undefined,
								})
								updateNodeInternals(node.id)
							}
						}}
					>
						+ add arg
					</button>
				) : null}
			</div>
		</div>
	)
}

function InputHandle({
	id,
	node,
	label,
	dynamic,
}: {
	id: string
	node: BaseNode
	label: string
	dynamic?: boolean
}) {
	return (
		<Handle
			type="target"
			position={Position.Top}
			id={id}
			className="group !relative !inset-x-auto !top-auto flex !h-5 !w-fit !transform-none items-center !rounded-sm !border-none !bg-black px-1 text-xs text-white"
		>
			{label}
			{dynamic ? (
				<span
					className="inline-block w-0 cursor-pointer overflow-hidden transition-all hover:text-red-500 group-hover:ml-1 group-hover:w-3"
					onClick={() => {
						nodeManager.deleteInput({ node, key: id })
					}}
				>
					<LucideTrash2 size={12} />
				</span>
			) : null}
		</Handle>
	)
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
