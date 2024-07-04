import { Canvas } from "./canvas"
import { useLocalStorage } from "./hooks/use-localstorage"
import { DragLayer } from "./managers/drag/drag-layer"
import { NodeList } from "./node-list"

function App() {
	let [doNotShowIntro, setDoNotShowIntro] = useLocalStorage(
		"doNotShowIntro",
		false,
	)

	return (
		<div className="h-screen w-screen">
			{!doNotShowIntro ? (
				<div
					className={`absolute z-10 flex h-screen w-screen items-center justify-center bg-black/40 p-8`}
				>
					<div
						className={`
        flex h-[400px] w-full max-w-[800px] flex-col rounded-md bg-white p-8

        sm:w-2/3
      `}
					>
						<div className="mb-5 text-4xl font-bold">Builder</div>
						<div className="flex flex-1 flex-col justify-between">
							<div>
								Builder is a visual programming tool that allows you to create
								complex logic using a simple drag and drop interface.
							</div>
							<div className="flex">
								<button
									className="rounded-md bg-blue-500 px-4 py-2 text-white"
									onClick={() => setDoNotShowIntro(true)}
								>
									Got it
								</button>
							</div>
						</div>
					</div>
				</div>
			) : null}

			<div className="grid h-full grid-rows-[48px,_minmax(0,1fr)]">
				<div className="flex h-full items-center justify-between border-b px-4">
					<div className="text-lg font-semibold">Builder</div>
				</div>

				<div className="grid h-full grid-cols-[220px,_minmax(0,1fr)]">
					<div className="border-r">
						<NodeList />
					</div>

					<Canvas />
				</div>

				<DragLayer />
			</div>
		</div>
	)
}

export default App
