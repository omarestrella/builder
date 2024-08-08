import { useMemo } from "react"

import { NodeWrapper } from "../../nodes/components/node-wrapper"
import { ALL_NODES } from "../../nodes/nodes"
import { useDragState } from "./manager"

export function DragLayer({ zoom }: { zoom: number }) {
	let { draggingType, position } = useDragState()

	let nodeInstance = useMemo(() => {
		let Node = ALL_NODES.find((node) => node.type === draggingType)
		if (!Node) {
			return null
		}
		return new Node()
	}, [draggingType])

	let isDragging = draggingType !== null

	if (!isDragging) {
		return null
	}

	return (
		<div className="fixed left-0 top-0 z-10 size-full">
			<div
				className="opacity-90 shadow-lg"
				style={{
					transform: `translate(${position.x / zoom}px, ${position.y / zoom}px)`,
					position: "absolute",
					zoom,
				}}
			>
				{nodeInstance ? (
					<NodeWrapper node={nodeInstance} selected={false} />
				) : (
					<span>{draggingType}</span>
				)}
			</div>
		</div>
	)
}
