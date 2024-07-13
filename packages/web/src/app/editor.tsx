import { useParams } from "wouter"

import { Canvas } from "./canvas"
import { useProject } from "./data/projects"
import { DragLayer } from "./managers/drag/drag-layer"
import { NodeList } from "./node-list"

export function Editor() {
	let { projectID } = useParams<"/:projectID">()

	let { data, error, isLoading } = useProject(projectID)

	if (isLoading && projectID !== "new") {
		return <div></div>
	}

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

				<Canvas projectID={projectID} initialNodeData={data} />
			</div>

			<DragLayer />
		</>
	)
}
