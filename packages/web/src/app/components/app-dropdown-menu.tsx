import { LucideMenu } from "lucide-react"
import { useEffect, useState } from "react"

import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuShortcut,
	DropdownMenuTrigger,
} from "./kit/dropdown-menu"
import { ProjectsDialog } from "./projects-dialog"

export function AppDropdownMenu() {
	let [showProjects, setShowProjects] = useState(false)

	useEffect(() => {
		let onKeyDown = (e: KeyboardEvent) => {
			if (e.key === "o" && e.ctrlKey) {
				setShowProjects(true)
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
					<DropdownMenuItem onSelect={() => void undefined}>
						New Project
						<DropdownMenuShortcut>^N</DropdownMenuShortcut>
					</DropdownMenuItem>
					<DropdownMenuItem onSelect={() => setShowProjects(true)}>
						Open Project
						<DropdownMenuShortcut>^O</DropdownMenuShortcut>
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
		</div>
	)
}
