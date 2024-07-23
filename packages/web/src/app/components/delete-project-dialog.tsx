import { useState } from "react"
import { useLocation } from "wouter"

import { useCurrentProject, useDeleteProject } from "../data/projects"
import { Button } from "./kit/button"
import { Dialog } from "./kit/dialog"

export function DeleteProjectDialog({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) {
	let [disabled, setDisabled] = useState(false)

	let [, setLocation] = useLocation()
	let deleteProject = useDeleteProject()

	let currentProject = useCurrentProject()

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title="Delete project"
			className="max-w-sm"
		>
			<div className="px-4 pb-4">
				<span className="text-sm text-gray-600">
					Are you sure you? This cannot be undone.
				</span>
			</div>
			<div className="flex justify-end gap-2 px-4">
				<Button onClick={onClose}>Cancel</Button>
				<Button
					type="submit"
					className={`
       border-red-600 !bg-red-500 text-white

       hover:border-red-700 hover:!bg-red-600
     `}
					disabled={disabled}
					onClick={() => {
						if (!currentProject) return

						setDisabled(true)
						deleteProject(currentProject.id)
							.then(() => {
								setLocation("/project/new")
								onClose()
							})
							.finally(() => {
								setDisabled(false)
							})
					}}
				>
					Delete
				</Button>
			</div>
		</Dialog>
	)
}
