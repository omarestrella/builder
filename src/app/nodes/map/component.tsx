import { lazy, Suspense } from "react"
import { useMapEvents } from "react-leaflet"

import type { MapNode } from "./node"

const Map = lazy(() => import("./map"))

function EventHandlers({
	onMove,
}: {
	onMove?: (lat: number, long: number) => void
}) {
	let map = useMapEvents({
		click() {
			map.locate()
		},
		move(e) {
			let { lat, lng } = e.target.getCenter()
			onMove?.(lat, lng)
		},
	})

	return null
}

export function Component({ node }: { node: MapNode }) {
	return (
		<div className="flex h-64 w-72 flex-col">
			<Suspense fallback={<div>Loading...</div>}>
				<Map>
					<EventHandlers
						onMove={(lat, long) => {
							node.setOutput("lat", lat)
							node.setOutput("long", long)
						}}
					/>
				</Map>
			</Suspense>
		</div>
	)
}
