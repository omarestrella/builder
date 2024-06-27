import { Canvas } from "./canvas"
import { DragLayer } from "./managers/drag/drag-layer"
import { LoroManagerProvider } from "./managers/loro/react"
import { NodeList } from "./node-list"

function App() {
	return (
		<LoroManagerProvider>
			<div className="h-screen w-screen">
				<div className="grid h-full grid-cols-[220px,_minmax(0,1fr)]">
					<div className="border-r">
						<NodeList />
					</div>

					<Canvas />
				</div>

				<DragLayer />
			</div>
		</LoroManagerProvider>
	)
}

export default App
