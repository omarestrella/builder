import { useState } from "react"
import { Redirect, Route, useRoute } from "wouter"

import { AppDropdownMenu } from "./components/app-dropdown-menu"
import { Button } from "./components/kit/button"
import { LoginButton, LogoutButton } from "./components/login-registration"
import { useProject } from "./data/projects"
import { useCurrentSession } from "./data/session"
import { Editor } from "./editor"
import { ProjectPreview } from "./project-preview"

function App() {
	let [loaded, setLoaded] = useState(false)

	let [match] = useRoute("/")
	let [matchProject, params] = useRoute("/project/:projectID")
	let [matchPreview, previewParams] = useRoute("/project/:projectID/_preview")

	let newProject = matchProject && params?.projectID === "new"

	let { data: user, isLoading } = useCurrentSession()

	if (isLoading && !loaded) {
		return (
			<div className="flex size-full items-center justify-center">
				Loading...
			</div>
		)
	}

	if (!loaded) setLoaded(true)

	if (match) {
		return <Redirect to="/project/new" />
	}

	if (matchPreview && previewParams?.projectID) {
		return (
			<div className="h-screen w-screen">
				<Route path="/project/:projectID/_preview">
					<ProjectPreview projectID={previewParams.projectID} />
				</Route>
			</div>
		)
	}

	return (
		<div className="h-screen w-screen">
			<div className="grid h-full grid-rows-[48px,_minmax(0,1fr)]">
				<div className="flex h-full items-center justify-between border-b px-4">
					<div className="grid grid-cols-[32px,min-content] items-center gap-2">
						<AppDropdownMenu />

						{params?.projectID ? (
							<>
								<CurrentProjectName projectID={params.projectID} />
							</>
						) : (
							<span className="text-lg font-semibold">Builder</span>
						)}
					</div>

					<div className="flex gap-2">
						{newProject ? (
							<div className="flex gap-2">
								<Button>Save Project</Button>
							</div>
						) : null}

						<>{!user ? <LoginButton /> : <LogoutButton />}</>
					</div>
				</div>

				<Route path="/project/:projectID">
					<Editor />
				</Route>
			</div>
		</div>
	)
}

function CurrentProjectName({ projectID }: { projectID: string }) {
	let { data } = useProject(projectID)

	return (
		<div>
			<span className="text-sm font-medium">
				{projectID === "new" ? "New Project" : data?.project.name}
			</span>
		</div>
	)
}

export default App
