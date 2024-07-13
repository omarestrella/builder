import { proxy, subscribe } from "valtio"

import { BaseNode } from "../../nodes/base"
import { nodeFromType } from "../../nodes/nodes"

export class NodeManager {
	// the classes get stripped out here, so we need to maintain a clean map as well
	nodeMap = proxy<Record<string, BaseNode>>({})
	nodes = new Map<string, BaseNode>()

	dataSubscriptions = new Map<string, () => void>()
	inputSubscriptions = new Map<string, () => void>()
	outputSubscriptions = new Map<string, (() => void)[]>()
	proxyNodes = new Map<string, ReturnType<typeof proxy>>()

	projectID = ""

	constructor() {
		subscribe(this.nodeMap, (ops) => {
			if (this.projectID === "new") {
				return
			}

			ops.forEach(([operation, path, value, _prevValue]) => {
				switch (operation) {
					case "set": {
						let nodeID = path[0] as string
						let nodeData = value as ReturnType<BaseNode["toJSON"]>

						if (!nodeData) {
							return
						}

						// setting the initial node value
						if (nodeID && path.length === 1) {
							if (this.nodes.get(nodeID) || !nodeData.type) {
								return
							}

							let node = nodeFromType(nodeData.type, nodeID, nodeData)

							this.setupListeners(node)

							this.nodeMap[node.id] = node
							this.nodes.set(node.id, node)
						}
						break
					}
					case "delete": {
						// delete this.nodeMapJSON[path]
						break
					}
				}
			})
		})
	}

	initialize(projectID: string, nodeData: Record<string, unknown> | undefined) {
		if (!nodeData) return []

		this.projectID = projectID
		try {
			let parsedNodes = nodeData as Record<
				string,
				ReturnType<BaseNode["toJSON"]>
			>
			let nodes = Object.entries(parsedNodes).map(([id, nodeData]) => {
				let node = nodeFromType(nodeData.type, id, nodeData)
				this.nodeMap[node.id] = node
				this.nodes.set(node.id, node)

				return node
			})

			nodes.forEach((node) => {
				this.setupListeners(node)
			})

			return nodes
		} catch {
			return []
		}
	}

	addNode(node: BaseNode) {
		this.nodeMap[node.id] = node
		this.nodes.set(node.id, node)

		this.setupListeners(node)
	}

	getNode(id?: string) {
		if (!id) return undefined

		return this.nodeMap[id]
	}

	removeNode(id: string) {
		delete this.nodeMap[id]
		this.nodes.delete(id)
		this.outputSubscriptions.get(id)?.forEach((s) => s())
		this.outputSubscriptions.delete(id)
		this.dataSubscriptions.get(id)?.()
		this.dataSubscriptions.delete(id)
		this.inputSubscriptions.get(id)?.()
		this.inputSubscriptions.delete(id)
		this.proxyNodes.delete(id)

		this.save()
	}

	private setupListeners(node: BaseNode) {
		let subscriptions: (() => void)[] = []

		let onInputChange = () => {
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
		}
		let inputSubscription = subscribe(node.inputData, onInputChange)

		// trigger once so initial values are set, needed when loading from storage
		onInputChange()

		this.inputSubscriptions.set(node.id, inputSubscription)
		this.outputSubscriptions.set(node.id, subscriptions)

		let proxyClass = proxy(node)
		let dataSubscription = subscribe(proxyClass, () => {
			this.save()
		})
		this.proxyNodes.set(node.id, proxyClass)
		this.dataSubscriptions.set(node.id, dataSubscription)
	}

	addConnection({
		fromNodeID,
		toNodeID,
		fromKey,
		toKey,
	}: {
		fromNodeID: string
		toNodeID: string
		fromKey: string
		toKey: string
	}) {
		let sourceNode = this.getNode(fromNodeID)
		let targetNode = this.getNode(toNodeID)

		if (!sourceNode || !targetNode) {
			return
		}

		targetNode.setInputData(toKey, {
			fromNodeID: sourceNode.id,
			outputName: fromKey,
		})
		sourceNode.setOutputData(fromKey, {
			from: fromKey,
			to: toKey,
		})
	}

	removeConnections({ toNodeID, toKey }: { toNodeID: string; toKey: string }) {
		let toNode = this.getNode(toNodeID)
		toNode?.removeInputData(toKey)
		this.save()
	}

	deleteInput({ node, key }: { node: BaseNode; key: string }) {
		let inputData = node.inputData[key]
		if (inputData && inputData.outputName) {
			let fromNode = this.getNode(inputData.fromNodeID)
			fromNode?.removeOutputData(inputData.outputName)
		}
		node.deleteInputData(key)
		this.save()
	}

	toJSON() {
		let nodes: Record<string, Record<string, unknown>> = {}
		Object.entries(this.nodeMap).forEach(([id, node]) => {
			nodes[id] = node.toJSON()
		})
		return nodes
	}

	save() {
		if (this.projectID === "new") {
			localStorage.setItem("nodes", JSON.stringify(this.toJSON()))
		}
	}
}

export const nodeManager = new NodeManager()
