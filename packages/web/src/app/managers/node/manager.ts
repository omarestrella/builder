import { debounce } from "lodash"
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

	private saveController = new AbortController()

	initialize(projectID: string, nodeData: Record<string, unknown> | undefined) {
		if (!nodeData) return []

		this.projectID = projectID
		try {
			let parsedNodes = nodeData as Record<
				string,
				ReturnType<BaseNode["toJSON"]>
			>
			let nodes = Object.entries(parsedNodes)
				.map(([id, nodeData]) => {
					if (!nodeData?.type) {
						return
					}

					let node = nodeFromType(nodeData.type, id, nodeData)

					this.nodeMap[node.id] = node
					this.nodes.set(node.id, node)

					return node
				})
				.filter((n) => !!n) as BaseNode[]

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
		let node = this.nodeMap[id]

		delete this.nodeMap[id]
		this.nodes.delete(id)
		this.outputSubscriptions.get(id)?.forEach((s) => s())
		this.outputSubscriptions.delete(id)
		this.dataSubscriptions.get(id)?.()
		this.dataSubscriptions.delete(id)
		this.inputSubscriptions.get(id)?.()
		this.inputSubscriptions.delete(id)
		this.proxyNodes.delete(id)

		node.onDelete().then(() => {
			this.save()
		})
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
		let dataSubscription = subscribe(proxyClass, (ops) => {
			let outputsChanged = ops.every(([op, path]) => {
				return op === "set" && path.includes("outputs")
			})
			if (outputsChanged) {
				return
			}
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

	async save() {
		if (this.projectID === "new") {
			localStorage.setItem("nodes", JSON.stringify(this.toJSON()))
		} else {
			this.throttledSave()
		}
	}

	throttledSave = debounce(
		() => {
			this.saveController.abort()

			this.saveController = new AbortController()
			fetch(`/api/projects/${this.projectID}`, {
				method: "PATCH",
				body: JSON.stringify({
					data: this.toJSON(),
				}),
				signal: this.saveController.signal,
			}).catch((err) => {
				if (err.name === "AbortError") return
				throw err
			})
		},
		200,
		{ leading: true },
	)

	reset() {
		this.projectID = ""
		this.nodeMap = proxy({})
		this.nodes = new Map<string, BaseNode>()
		this.dataSubscriptions.forEach((s) => s())
		this.inputSubscriptions.forEach((s) => s())
		this.outputSubscriptions.forEach((s) => s.forEach((cb) => cb()))
		this.dataSubscriptions.clear()
		this.inputSubscriptions.clear()
		this.outputSubscriptions.clear()
		this.proxyNodes.clear()
	}
}

export const nodeManager = new NodeManager()
