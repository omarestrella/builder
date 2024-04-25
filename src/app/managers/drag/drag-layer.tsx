import { useDragState } from "./manager"

export function DragLayer() {
	const { draggingType, position } = useDragState()
	const isDragging = draggingType !== null

	if (!isDragging) {
		return null
	}

	return (
		<div className="fixed left-0 top-0 z-10 size-full">
			<div
				className="rounded-full border border-gray-300 bg-white shadow-lg"
				style={{
					transform: `translate(${position.x}px, ${position.y}px)`,
					position: "absolute",
				}}
			>
				{draggingType}
			</div>
		</div>
	)
}
