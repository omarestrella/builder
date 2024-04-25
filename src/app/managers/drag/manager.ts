import { proxy, useSnapshot } from "valtio"

import { BaseManager } from "../base"

type DragState = {
	draggingType: string | null
	position: {
		x: number
		y: number
	}
}

class DragManager extends BaseManager<DragState> {
	state = proxy<DragState>({
		draggingType: null,
		position: {
			x: 0,
			y: 0,
		},
	})
}

export const dragManager = new DragManager()

export function useDragState() {
	return useSnapshot(dragManager.state)
}
