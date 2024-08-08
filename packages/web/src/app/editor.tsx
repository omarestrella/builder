import { useCallback } from "react"
import { useStore } from "reactflow"
import { useParams } from "wouter"

import { Canvas } from "./canvas"
import { useProject } from "./data/projects"
import { DragLayer } from "./managers/drag/drag-layer"
import { NodeList } from "./node-list"

export function Editor() {
	let { projectID } = useParams<"/:projectID">()

	let { data, error, isLoading } = useProject(projectID)

	let zoom = useStore(useCallback((state) => state.transform[2], []))

	if (error && projectID !== "new") {
		return (
			<div className="flex size-full items-center justify-center">
				Project not found 😔
			</div>
		)
	}

	return (
		<>
			<div className="grid h-full grid-cols-[220px,_minmax(0,1fr)]">
				<div className="border-r">
					<NodeList />
				</div>

				{isLoading && projectID !== "new" ? null : (
					<Canvas
						projectID={projectID}
						initialNodeData={data?.project.data as Record<string, unknown>}
					/>
				)}
			</div>

			<DragLayer zoom={zoom} />
		</>
	)
}
