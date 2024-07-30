import { LucideMenu } from "lucide-react"
import { useEffect, useState } from "react"

import { DeleteProjectDialog } from "./delete-project-dialog"
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "./kit/dropdown-menu"
import { NewProjectDialog } from "./new-project-dialog"
import { ProjectsDialog } from "./projects-dialog"

export function AppDropdownMenu() {
	let [showProjects, setShowProjects] = useState(false)
	let [showCreateProject, setShowCreateProject] = useState(false)
	let [showDeleteProject, setShowDeleteProject] = useState(false)

	useEffect(() => {
		let onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "o" && e.ctrlKey) {
				setShowProjects(true)
			}
			if (e.key === "c" && e.ctrlKey) {
				setShowCreateProject(true)
			}
		}
		document.addEventListener("keydown", onKeyDown)

		return () => {
			document.removeEventListener("keydown", onKeyDown)
		}
	}, [])

	return (
		<div className="flex items-center">
			<DropdownMenu>
				<DropdownMenuTrigger asChild>
					<button>
						<LucideMenu size={14} />
					</button>
				</DropdownMenuTrigger>
				<DropdownMenuContent side="bottom" sideOffset={6} align="start">
					<DropdownMenuItem onSelect={() => setShowCreateProject(true)}>
						Create project
						<DropdownMenuShortcut>^C</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => setShowProjects(true)}>
						Open project
						<DropdownMenuShortcut>^O</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => setShowDeleteProject(true)}>
						<span className="text-red-500">Delete Project</span>
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => void undefined}>
						Settings
					</DropdownMenuItem>
					<DropdownMenuSeparator />
					<DropdownMenuItem onSelect={() => void undefined}>
						Help
						<DropdownMenuShortcut>?</DropdownMenuShortcut>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>

			<ProjectsDialog
				open={showProjects}
				onClose={() => setShowProjects(false)}
			/>
			<NewProjectDialog
				open={showCreateProject}
				onClose={() => setShowCreateProject(false)}
			/>
			<DeleteProjectDialog
				open={showDeleteProject}
				onClose={() => setShowDeleteProject(false)}
			/>
		</div>
	)
}
