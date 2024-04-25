import { Canvas } from "./canvas"
import { DragLayer } from "./managers/drag/drag-layer"
import { NodeList } from "./node-list"

function App() {
	return (
		<div className="h-screen w-screen">
			<div className="grid h-full grid-cols-[180px,_minmax(0,1fr)]">
				<div className="border-r">
					<NodeList />
				</div>

				<Canvas />
			</div>

			<DragLayer />
		</div>
	)
}

export default App
