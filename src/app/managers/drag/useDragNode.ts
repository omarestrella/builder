import { useCallback, useEffect, useRef, useState } from "react"

import { dragManager } from "./manager"

export function useDragNode(type: string) {
	let [isDragging, setIsDragging] = useState(false)

	let timerRef = useRef<number | null>(null)

	let onPointerDown = useCallback(
		(e: React.PointerEvent) => {
			let x = e.pageX
			let y = e.pageY
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
		let onPointerMove = (e: PointerEvent) => {
			if (!isDragging) {
				return
			}
			dragManager.state.position = {
				x: e.pageX,
				y: e.pageY,
			}
		}
		let onPointerUp = () => {
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
