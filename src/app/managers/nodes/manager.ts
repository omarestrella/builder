import { useSnapshot } from "valtio"
import { proxyMap } from "valtio/utils"

import { BaseNode } from "../../nodes/base"

class NodesManager {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	state = proxyMap<string, BaseNode<any, any>>()

	addNode(node: BaseNode<never, never>) {
		this.state.set(node.id, node)
	}

	getNode(id: string) {
		return this.state.get(id)
	}
}

export const nodesManager = new NodesManager()

export function useNodes() {
	return useSnapshot(nodesManager.state)
}
