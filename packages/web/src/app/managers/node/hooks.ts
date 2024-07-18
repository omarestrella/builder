import { useEffect, useState } from "react"
import { subscribe } from "valtio"

import { nodeManager } from "./manager"

export function useNode(nodeID: string) {
	let [node, setNode] = useState(() => nodeManager.nodeMap[nodeID])

	useEffect(() => {
		subscribe(nodeManager.nodeMap, () => {
			setNode(nodeManager.nodeMap[nodeID])
		})
	}, [])

	return node
}
