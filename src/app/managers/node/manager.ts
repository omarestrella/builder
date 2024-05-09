import { subscribe, useSnapshot } from "valtio"
import { proxyMap } from "valtio/utils"

import { BaseNode } from "../../nodes/base"

export class NodeManager {
	nodes = proxyMap<string, BaseNode>()

	inputSubscriptions = new Map<string, () => void>()
	outputSubscriptions = new Map<string, (() => void)[]>()

	addNode(node: BaseNode) {
		this.nodes.set(node.id, node)

		this.setupListeners(node)
	}

	getNode(id?: string) {
		if (!id) return undefined

		return this.nodes.get(id)
	}

	removeNode(id: string) {
		this.nodes.delete(id)
		this.outputSubscriptions.get(id)?.forEach((s) => s())
		this.outputSubscriptions.delete(id)
	}

	private setupListeners(node: BaseNode) {
		let subscriptions: (() => void)[] = []

		const inputSubscription = subscribe(node.inputData, () => {
			let inputEntries = Object.entries(node.inputData)

			this.outputSubscriptions.get(node.id)?.forEach((s) => s())

			inputEntries.forEach(([key, value]) => {
				if (!value.fromNodeID) {
					return
				}

				let fromNode = this.getNode(value.fromNodeID)
				let outputKey = value.outputName
				if (!fromNode || !outputKey) {
					return
				}

				let unsubscribe = subscribe(fromNode.outputs, () => {
					node.setInput(key, fromNode.outputs[outputKey])
				})
				node.setInput(key, fromNode.outputs[outputKey])

				subscriptions.push(unsubscribe)
			})
		})

		this.inputSubscriptions.set(node.id, inputSubscription)
		this.outputSubscriptions.set(node.id, subscriptions)
	}
}

export const nodeManager = new NodeManager()

export function useNodes() {
	return useSnapshot(nodeManager.nodes)
}

export function useNode(id: string) {
	const state = useSnapshot(nodeManager.nodes)
	return state.get(id)
}
