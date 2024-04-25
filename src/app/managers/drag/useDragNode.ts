import { useCallback, useEffect, useRef, useState } from "react"

import { dragManager } from "./manager"

export function useDragNode(type: string) {
	const [isDragging, setIsDragging] = useState(false)

	const timerRef = useRef<number | null>(null)

	const onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			const x = e.pageX
			const y = e.pageY
			dragManager.state.position = {
				x,
				y,
			}
			timerRef.current = setTimeout(() => {
				setIsDragging(true)
				dragManager.state.draggingType = type
			}, 100)
		},
		[type],
	)

	useEffect(() => {
		const onPointerMove = (e: PointerEvent) => {
			if (!isDragging) {
				return
			}
			dragManager.state.position = {
				x: e.pageX,
				y: e.pageY,
			}
		}
		const onPointerUp = () => {
			if (timerRef.current) {
				clearTimeout(timerRef.current)
			}
			setIsDragging(false)
			dragManager.state.draggingType = null
		}

		window.addEventListener("pointermove", onPointerMove)
		window.addEventListener("pointerup", onPointerUp)

		return () => {
			window.removeEventListener("pointermove", onPointerMove)
		}
	}, [isDragging])

	return {
		onPointerDown,
		...(isDragging ? { "data-dragging": isDragging } : {}),
	}
}
