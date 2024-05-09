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
	useReactFlow,
} from "reactflow"

import { useDropNodeEffect } from "./managers/drag/useDropNodeEffect"
import { nodeManager } from "./managers/node/manager"
import { NodeComponent } from "./nodes/node-component"
import { nodeFromType } from "./nodes/nodes"

export function Canvas() {
	const [canvasNodes, setCanvasNodes] = useState<Node[]>([])
	const [canvasEdges, setCanvasEdges] = useState<Edge[]>([])

	const nodeTypes = useMemo(() => ({ node: NodeComponent }), [])

	const reactFlow = useReactFlow()

	const onNodesChange = useCallback(
		(changes: NodeChange[]) => {
			setCanvasNodes((nds) => applyNodeChanges(changes, nds))
		},
		[setCanvasNodes],
	)

	const onEdgesChange = useCallback(
		(changes: EdgeChange[]) => {
			setCanvasEdges((nds) => applyEdgeChanges(changes, nds))
		},
		[setCanvasEdges],
	)

	const onConnect = useCallback(
		(connection: Connection) => {
			if (!connection.source || !connection.target) return
			if (!connection.sourceHandle || !connection.targetHandle) return

			const sourceNode = nodeManager.getNode(connection.source)
			const targetNode = nodeManager.getNode(connection.target)
			if (!sourceNode || !targetNode) return

			const sourceOutput = sourceNode.getOutputData(connection.sourceHandle)
			if (!sourceOutput) return

			targetNode.setInputData(connection.targetHandle, {
				fromNodeID: sourceNode.id,
				outputName: connection.sourceHandle,
			})

			setCanvasEdges((eds) => addEdge(connection, eds))
		},
		[setCanvasEdges],
	)

	const onNodeDrop = useCallback(
		(type: string, { x, y }: { x: number; y: number }) => {
			const position = reactFlow.screenToFlowPosition({
				x: x,
				y: y,
			})

			// i actually dont care about the typing here
			const node = nodeFromType(type)
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
				onConnect={onConnect}
			>
				<Background />
			</ReactFlow>
		</div>
	)
}
