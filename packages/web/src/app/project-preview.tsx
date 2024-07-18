import { Canvas } from "./canvas"
import { useProject } from "./data/projects"

export function ProjectPreview({ projectID }: { projectID: string }) {
	let { data, isLoading } = useProject(projectID)
	if (isLoading) {
		return null
	}

	return (
		<Canvas
			projectID="new"
			initialNodeData={data?.project.data}
			initialZoom={0.5}
		/>
	)
}
