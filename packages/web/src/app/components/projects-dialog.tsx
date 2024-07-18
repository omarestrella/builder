import { useState } from "react"
import { Link } from "wouter"

import { useProjects } from "../data/projects"
import { Button } from "./button"
import { Dialog } from "./dialog"

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
			className="max-w-4xl"
		>
			<div className="grid h-full w-full grid-rows-[1fr,32px] gap-2">
				<div className="overflow-auto">
					<div className="grid w-full grid-cols-[repeat(auto-fit,_15rem)] gap-3 px-4">
						{projects?.map((project) => (
							<Link
								key={project.id}
								href={`/project/${project.id}`}
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
				</div>
				<div className="px-4">
					<Button>Create project</Button>
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
