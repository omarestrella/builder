import "reactflow/dist/style.css"

import { useCallback, useEffect, useRef, useState } from "react"
import ReactFlow, {
	addEdge,
	applyEdgeChanges,
	applyNodeChanges,
	Background,
	Connection,
	Edge,
	EdgeChange,
	Node,
	NodeChange,
	SelectionMode,
	useReactFlow,
} from "reactflow"

import { useThrottle } from "./hooks/use-throttle"
import { useDocumentManager } from "./managers/document/hooks"
import { useDropNodeEffect } from "./managers/drag/useDropNodeEffect"
import { nodeManager } from "./managers/node/manager"
import { CanvasNode } from "./nodes/components/canvas-node"
import { nodeFromType } from "./nodes/nodes"

let nodeTypes = { node: CanvasNode }

export function Canvas({
	projectID,
	initialZoom,
	initialNodeData,
}: {
	projectID: string
	initialZoom?: number
	initialNodeData?: Record<string, unknown>
}) {
	let documentManager = useDocumentManager()

	let initializedRef = useRef(false)
	let currentProjectIDRef = useRef(projectID)

	let [canvasNodes, setCanvasNodes] = useState<Node[]>([])
	let [canvasEdges, setCanvasEdges] = useState<Edge[]>([])

	let reactFlow = useReactFlow()

	let writeChanges = useCallback((changes: NodeChange[]) => {
		changes.forEach((change) => {
			if (change.type === "position") {
				let node = nodeManager.getNode(change.id)
				if (!node || !change.position) return

				node.meta.position = change.position
			}
			if (change.type === "remove") {
				nodeManager.removeNode(change.id)
			}
		})
	}, [])

	let throttledWriteChanges = useThrottle(writeChanges, 100, true)

	let onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			throttledWriteChanges(changes)
			setCanvasNodes((nds) => applyNodeChanges(changes, nds))
		},
		[setCanvasNodes, throttledWriteChanges],
	)

	let onEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			setCanvasEdges((nds) => applyEdgeChanges(changes, nds))
		},
		[setCanvasEdges],
	)

	let onEdgesDelete = useCallback((edges: Edge[]) => {
		edges.forEach((edge) => {
			if (!edge.sourceHandle || !edge.targetHandle) return

			nodeManager.removeConnections({
				toNodeID: edge.target,
				toKey: edge.targetHandle,
			})
		})
	}, [])

	let onConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) return
			if (!connection.sourceHandle || !connection.targetHandle) return

			nodeManager.addConnection({
				fromNodeID: connection.source,
				toNodeID: connection.target,
				fromKey: connection.sourceHandle,
				toKey: connection.targetHandle,
			})

			setCanvasEdges((eds) => addEdge(connection, eds))
		},
		[setCanvasEdges],
	)

	let onNodeDrop = useCallback(
		(type: string, { x, y }: { x: number; y: number }) => {
			let position = reactFlow.screenToFlowPosition({
				x: x,
				y: y,
			})

			let node = nodeFromType(type)
			nodeManager.addNode(node)

			setCanvasNodes((nodes) => [
				...nodes,
				{
					id: node.id,
					position,
					data: node,
					type: "node",
				},
			])
		},
		[reactFlow],
	)

	useDropNodeEffect(onNodeDrop)

	useEffect(() => {
		let didProjectChange = currentProjectIDRef.current !== projectID
		if (initializedRef.current && !didProjectChange) {
			return
		}

		if (didProjectChange) {
			nodeManager.reset()
			initializedRef.current = false
		}

		if (initialNodeData) {
			let nodes = nodeManager.initialize(projectID, initialNodeData)
			setCanvasNodes(
				nodes.map((node) => ({
					id: node.id,
					position: node.meta.position,
					data: node,
					type: "node",
				})),
			)
			let edges: Edge[] = nodes.flatMap((inputNode) => {
				return Object.entries(inputNode.inputData)
					.map(([_key, input]) => {
						if (!input.fromNodeID || !input.outputName) return

						let outputNode = nodeManager.getNode(input.fromNodeID)
						if (!outputNode) return

						let outputData = outputNode.outputData[
							input.outputName as never
						] as Record<string, unknown>

						if (!outputData || !outputData.to || !outputData.from) return

						return {
							id: crypto.randomUUID(),
							source: outputNode.id,
							sourceHandle: outputData.from,
							target: inputNode.id,
							targetHandle: outputData.to,
						}
					})
					.filter((e) => !!e) as Edge[]
			})
			setCanvasEdges(edges)

			edges.forEach((edge) => {
				nodeManager.addConnection({
					fromNodeID: edge.source,
					toNodeID: edge.target,
					fromKey: edge.sourceHandle!,
					toKey: edge.targetHandle!,
				})
			})
		} else if (projectID === "new") {
			let data = JSON.parse(localStorage.getItem("nodes") || "{}")
			let nodes = nodeManager.initialize(projectID, data)
			setCanvasNodes(
				nodes.map((node) => ({
					id: node.id,
					position: node.meta.position,
					data: node,
					type: "node",
				})),
			)

			let edges: Edge[] = nodes.flatMap((inputNode) => {
				return Object.entries(inputNode.inputData)
					.map(([_key, input]) => {
						if (!input.fromNodeID || !input.outputName) return

						let outputNode = nodeManager.getNode(input.fromNodeID)
						if (!outputNode) return

						let outputData = outputNode.outputData[
							input.outputName as never
						] as Record<string, unknown>

						if (!outputData || !outputData.to || !outputData.from) return

						return {
							id: crypto.randomUUID(),
							source: outputNode.id,
							sourceHandle: outputData.from,
							target: inputNode.id,
							targetHandle: outputData.to,
						}
					})
					.filter((e) => !!e) as Edge[]
			})
			setCanvasEdges(edges)

			edges.forEach((edge) => {
				nodeManager.addConnection({
					fromNodeID: edge.source,
					toNodeID: edge.target,
					fromKey: edge.sourceHandle!,
					toKey: edge.targetHandle!,
				})
			})
		}

		initializedRef.current = true
		currentProjectIDRef.current = projectID
	}, [documentManager, projectID, initialNodeData, initialZoom, reactFlow])

	return (
		<div className="size-full">
			<ReactFlow
				nodes={canvasNodes}
				edges={canvasEdges}
				nodeTypes={nodeTypes}
				onNodesChange={onNodesChange}
				onEdgesChange={onEdgesChange}
				onEdgesDelete={onEdgesDelete}
				onConnect={onConnect}
				selectionMode={SelectionMode.Partial}
				minZoom={0.1}
				panOnScroll
				selectionOnDrag
			>
				<Background />
			</ReactFlow>
		</div>
	)
}
