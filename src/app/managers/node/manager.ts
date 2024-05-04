import { subscribe, useSnapshot } from "valtio"
import { proxyMap } from "valtio/utils"

import { BaseNode } from "../../nodes/base"

export class NodeManager {
	state = proxyMap<string, BaseNode>()

	subscriptions = new Map<string, (() => void)[]>()

	addNode(node: BaseNode) {
		this.state.set(node.id, node)

		this.setupListeners(node)
	}

	getNode(id?: string) {
		if (!id) return undefined

		return this.state.get(id)
	}

	removeNode(id: string) {
		this.state.delete(id)
		this.subscriptions.get(id)?.forEach((s) => s())
		this.subscriptions.delete(id)
	}

	private setupListeners(node: BaseNode) {
		if (this.subscriptions.get(node.id)) {
			return
		}

		const unsubscribeInputs = subscribe(node.inputs, () => {
			console.log("inputs changed", node.inputs)
		})

		const unsubscribeOutputs = subscribe(node.outputs, () => {
			console.log("outputs changed", node.outputs)
		})

		this.subscriptions.set(node.id, [unsubscribeInputs, unsubscribeOutputs])
	}
}

export const nodeManager = new NodeManager()

export function useNodes() {
	return useSnapshot(nodeManager.state)
}

export function useNode(id: string) {
	const state = useSnapshot(nodeManager.state)
	return state.get(id)
}
