import { useState } from "react"

import { useCreateProject } from "../data/projects"
import { Button } from "./kit/button"
import { Dialog } from "./kit/dialog"
import { Input } from "./kit/input"

export function NewProjectDialog({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) {
	let [disable, setDisable] = useState(false)

	let createProject = useCreateProject()

	return (
		<Dialog
			open={open}
			onClose={onClose}
			title="New project"
			className="max-w-md"
		>
			<form
				onSubmit={(e) => {
					e.preventDefault()
					e.stopPropagation()
					setDisable(true)

					let formData = new FormData(e.target as HTMLFormElement)

					createProject({
						name: formData.get("name") as string,
					})
						.then(() => {
							onClose()
						})
						.finally(() => setDisable(false))
				}}
			>
				<div className="flex flex-col justify-between gap-1 px-4 pb-4">
					<label htmlFor="name" className="text-xs font-medium">
						Name
					</label>
					<Input
						id="name"
						type="text"
						name="name"
						className="w-full rounded border px-2 py-1 font-sans"
					/>
				</div>

				<div className="flex justify-end gap-2 px-4">
					<Button onClick={onClose}>Cancel</Button>
					<Button type="submit" disabled={disable}>
						Create Project
					</Button>
				</div>
			</form>
		</Dialog>
	)
}
