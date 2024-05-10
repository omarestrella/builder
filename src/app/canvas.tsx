import "reactflow/dist/style.css"

import { useCallback, useMemo, useState } from "react"
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

import { useDropNodeEffect } from "./managers/drag/useDropNodeEffect"
import { nodeManager } from "./managers/node/manager"
import { NodeComponent } from "./nodes/node-component"
import { nodeFromType } from "./nodes/nodes"

export function Canvas() {
	let [canvasNodes, setCanvasNodes] = useState<Node[]>([])
	let [canvasEdges, setCanvasEdges] = useState<Edge[]>([])

	let nodeTypes = useMemo(() => ({ node: NodeComponent }), [])

	let reactFlow = useReactFlow()

	let onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			setCanvasNodes((nds) => applyNodeChanges(changes, nds))
		},
		[setCanvasNodes],
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

			let sourceNode = nodeManager.getNode(connection.source)
			let targetNode = nodeManager.getNode(connection.target)
			if (!sourceNode || !targetNode) return

			let sourceOutput = sourceNode.getOutputData(connection.sourceHandle)
			if (!sourceOutput) return

			targetNode.setInputData(connection.targetHandle, {
				fromNodeID: sourceNode.id,
				outputName: connection.sourceHandle,
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

			// i actually dont care about the typing here
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
				panOnScroll
				selectionOnDrag
			>
				<Background />
			</ReactFlow>
		</div>
	)
}
