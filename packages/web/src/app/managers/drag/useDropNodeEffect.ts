import { useEffect } from "react"

import { dragManager } from "./manager"

export function useDropNodeEffect(
	cb: (type: string, position: { x: number; y: number }) => void,
) {
	useEffect(() => {
		let lastDraggingType: string | null = null

		let unsubscribe = dragManager.subscribe((state) => {
			if (state.draggingType) {
				lastDraggingType = state.draggingType
			}

			if (state.draggingType === null && lastDraggingType) {
				cb(lastDraggingType, state.position)
				lastDraggingType = null
			}
		})

		return () => {
			lastDraggingType = null
			unsubscribe()
		}
	}, [cb])
}
