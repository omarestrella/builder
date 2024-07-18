import { LucideTrash2 } from "lucide-react"
import { ErrorBoundary } from "react-error-boundary"
import {
	Handle,
	HandleType,
	NodeProps,
	Position,
	useUpdateNodeInternals,
} from "reactflow"

import { Tooltip } from "../../components/tooltip"
import { nodeManager } from "../../managers/node/manager"
import { BaseNode } from "../base"
import { useNodeInputData, useNodeOutput, useNodeOutputData } from "../hooks"
import { NodeWrapper } from "./node-wrapper"

export function CanvasNode({ data: node, selected }: NodeProps<BaseNode>) {
	return (
		<ErrorBoundary
			onError={(error, info) => console.error(error, info)}
			fallback={<div>Something went wrong</div>}
		>
			<NodeWrapper
				node={node}
				selected={selected ?? false}
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
		<div className="flex flex-col gap-1">
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
	let updateNodeInternals = useUpdateNodeInternals()

	return (
		<InternalHandle type="target" position={Position.Left} id={id}>
			{label}
			{dynamic ? (
				<span
					className={`
       inline-block w-0 cursor-pointer overflow-hidden transition-all

       hover:text-red-500

       group-hover:ml-1 group-hover:w-3
     `}
					onClick={() => {
						nodeManager.deleteInput({ node, key: id })
						updateNodeInternals(node.id)
					}}
				>
					<LucideTrash2 size={12} />
				</span>
			) : null}
		</InternalHandle>
	)
}

function Outputs({ node }: { node: BaseNode }) {
	let outputData = Object.entries(useNodeOutputData(node))

	return outputData.length > 0 ? (
		<div className="flex flex-col gap-1">
			<p className="m-0 text-xs font-bold">Outputs</p>
			<div className="flex gap-2">
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
	if (typeof output === "object" && output !== null) {
		output = JSON.stringify(output)
	}

	return (
		<Tooltip label={output} side="bottom">
			<InternalHandle type="source" position={Position.Bottom} id={outputKey}>
				{outputKey}
			</InternalHandle>
		</Tooltip>
	)
}

function InternalHandle({
	id,
	position,
	type,
	children,
}: {
	id: string
	position: Position
	type: HandleType
	children: React.ReactNode
}) {
	return (
		<Handle
			type={type}
			position={position}
			id={id}
			className={`
     group !relative !inset-auto flex !h-5 !w-fit !transform-none items-center !rounded-sm
     !border-none !bg-black px-1 text-xs text-white
   `}
		>
			{children}
		</Handle>
	)
}
