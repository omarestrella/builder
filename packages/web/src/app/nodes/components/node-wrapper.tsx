import { useCallback } from "react"
import { NodeResizeControl, useReactFlow, XYPosition } from "reactflow"

import { EditableText } from "../../components/kit/editable-text"
import { ScrollArea } from "../../components/kit/scroll-area"
import { useThrottle } from "../../hooks/use-throttle"
import { BaseNode } from "../base"
import { useNodeName, useNodePositionEffect, useNodeSize } from "../hooks"

export function NodeWrapper({
	node,
	selected,
	inputs,
	outputs,
}: {
	node: BaseNode
	selected: boolean
	inputs?: React.ReactNode
	outputs?: React.ReactNode
}) {
	let reactFlow = useReactFlow()

	let name = useNodeName(node)
	let size = useNodeSize(node)

	let updateNodePosition = useCallback(
		(position: XYPosition) => {
			reactFlow.setNodes((nodes) => {
				let nodeIndex = nodes.findIndex((n) => n.id === node.id)
				if (nodeIndex === -1) return nodes

				let newNode = { ...nodes[nodeIndex], position }
				nodes[nodeIndex] = newNode

				return [...nodes]
			})
		},
		[node.id, reactFlow],
	)

	let throttledUpdateNodePosition = useThrottle(updateNodePosition, 0)

	useNodePositionEffect(node, throttledUpdateNodePosition)

	return (
		<div className="flex size-full flex-col gap-1">
			{inputs ? (
				<div className="absolute -top-1 -translate-y-full px-1">{inputs}</div>
			) : null}

			<div
				className={`
      flex size-full flex-col overflow-hidden rounded-md border bg-white

      ${selected ? "border-black/30" : ""}
    `}
				style={{
					width: `${size.width}px`,
					height: `${size.height}px`,
					maxHeight: `${size.height}px`,
				}}
			>
				<div className="flex items-center justify-between gap-2 border-b p-2 text-sm font-bold">
					<EditableText
						value={name}
						onSubmit={(value) => (node.meta.name = value)}
					/>
				</div>

				<div
					className={`min-h-0 flex-1 border-b border-none`}
					data-node-container
					style={{
						padding: 0,
					}}
				>
					<ScrollArea>
						<node.component node={node} />
					</ScrollArea>
				</div>

				{/* <div className="p-1 text-xs text-gray-500">{node.id}</div> */}

				{/* Disabled for now */}
				<NodeResizeControl
					minWidth={240}
					className={`!size-auto !-translate-x-5 !-translate-y-5 !bg-transparent opacity-25`}
					onResize={(_e, data) => {
						node.meta.size.width = data.width
						node.meta.size.height = data.height
					}}
				>
					<svg
						version="1.1"
						xmlns="http://www.w3.org/2000/svg"
						width="16"
						height="16"
						viewBox="0 0 16 16"
					>
						<path fill="#444" d="M6.7 16l9.3-9.3v-1.4l-10.7 10.7z"></path>
						<path fill="#444" d="M9.7 16l6.3-6.3v-1.4l-7.7 7.7z"></path>
						<path fill="#444" d="M12.7 16l3.3-3.3v-1.4l-4.7 4.7z"></path>
						<path fill="#444" d="M15.7 16l0.3-0.3v-1.4l-1.7 1.7z"></path>
					</svg>
				</NodeResizeControl>
			</div>

			{outputs ? (
				<div className="absolute -bottom-1 translate-y-full px-1">
					{outputs}
				</div>
			) : null}
		</div>
	)
}
