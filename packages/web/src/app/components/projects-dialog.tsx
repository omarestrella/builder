import { useState } from "react"
import { Link } from "wouter"

import { useProjects } from "../data/projects"
import { Button } from "./kit/button"
import { Dialog } from "./kit/dialog"

export function ProjectsDialog({
	open,
	onClose,
}: {
	open: boolean
	onClose: () => void
}) {
	let { data } = useProjects()

	let projects = data?.projects ?? []

	return (
		<Dialog
			title="Projects"
			open={open}
			onClose={onClose}
			className="min-h-48 max-w-2xl"
		>
			<div className="grid h-full w-full grid-rows-1 gap-2">
				<div className="overflow-auto">
					{projects?.length ? (
						<div className="grid w-full grid-cols-[repeat(auto-fit,_15rem)] gap-3 px-4">
							{projects?.map((project) => (
								<Link
									key={project.id}
									href={`/project/${project.id}`}
									onClick={onClose}
									className={`
           relative flex flex-col gap-1 rounded-md border border-gray-100 transition-colors

           hover:cursor-pointer hover:border-gray-200
         `}
								>
									<div
										className={`flex h-48 w-60 items-center justify-center rounded-lg bg-gray-200/10`}
									>
										<span className="text-xs text-black/50">No screenshot</span>
									</div>
									<div className="flex flex-col gap-1 px-2 pb-2">
										<span className="text-sm">{project.name}</span>
										<span className="text-xs text-gray-500">
											{new Date(project.createdAt).toLocaleDateString()}
										</span>
									</div>
								</Link>
							))}
						</div>
					) : (
						<div className="flex h-full items-center justify-center">
							<span className="text-sm text-gray-500">No projects</span>
						</div>
					)}
				</div>
			</div>
		</Dialog>
	)
}

export function ProjectsButton() {
	let [open, setOpen] = useState(false)

	return (
		<>
			<Button onClick={() => setOpen(true)}>Projects</Button>
			<ProjectsDialog open={open} onClose={() => setOpen(false)} />
		</>
	)
}
