import { Redirect, Route, useRoute } from "wouter"

import { Button } from "./components/button"
import { useCurrentSession } from "./data/session"
import { Editor } from "./editor"

function App() {
	let { isLoading } = useCurrentSession()

	let [match] = useRoute("/")
	let [matchProject, params] = useRoute("/project/:projectID")

	if (isLoading) {
		return (
			<div className="flex size-full items-center justify-center">
				Loading...
			</div>
		)
	}

	if (match) {
		return <Redirect to="/project/new" />
	}

	let newProject = matchProject && params?.projectID === "new"

	return (
		<div className="h-screen w-screen">
			<div className="grid h-full grid-rows-[48px,_minmax(0,1fr)]">
				<div className="flex h-full items-center justify-between border-b px-4">
					<div className="text-lg font-semibold">Builder</div>

					{newProject ? (
						<div>
							<Button type="submit">Save Project</Button>
						</div>
					) : null}
				</div>

				<Route path="/project/:projectID">
					<Editor />
				</Route>
			</div>
		</div>
	)
}

export default App
