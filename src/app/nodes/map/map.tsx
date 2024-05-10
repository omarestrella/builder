import "leaflet/dist/leaflet.css"

import { MapContainer, TileLayer } from "react-leaflet"

export default function Map({ children }: { children?: React.ReactNode }) {
	return (
		// eslint-disable-next-line tailwindcss/no-custom-classname
		<div className="nodrag nowheel size-full">
			<MapContainer
				center={[32.8179, -79.9589]}
				zoom={10}
				scrollWheelZoom={true}
				style={{
					width: "100%",
					height: "100%",
				}}
			>
				<TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
				{children}
			</MapContainer>
		</div>
	)
}
