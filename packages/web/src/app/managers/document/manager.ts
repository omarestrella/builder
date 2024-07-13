import { bind } from "@builder/loro/src/bind"
import { Loro } from "@builder/loro/src/index"
import { decodeMessage, encodeMessage, ServerMessage } from "@builder/messages"
import { proxy } from "valtio"

export class DocumentManager {
	loro: Loro = new Loro()

	private cleanup?: () => void
	private loroSubscription?: number

	private connectionResolver?: () => void

	socket?: WebSocket

	initializeDocument(nodes: ReturnType<typeof proxy>) {
		this.cleanup = bind(nodes, this.loro)
		// @ts-expect-error - expose Loro for debugging
		window.loro = this.loro

		this.loroSubscription = this.loro.subscribe((event) => {
			if (event.by === "local" && event.origin === "sync") {
				console.log(
					"sending update to server",
					this.loro.getMap("root").toJSON(),
				)
				this.socket?.send(
					encodeMessage("update", {
						updates: this.loro.exportSnapshot(),
					}),
				)
			}
		})
	}

	connect(projectID: string) {
		this.socket = new WebSocket(`ws://localhost:8000/sync/${projectID}`)
		this.socket.addEventListener("message", this.onMessage)
		return new Promise<void>((resolve) => {
			this.connectionResolver = resolve
		})
	}

	destroy() {
		this.cleanup?.()
		if (this.loroSubscription) {
			this.loro.unsubscribe(this.loroSubscription)
		}

		this.loro = new Loro()
		this.socket?.close()
	}

	onMessage = async (event: MessageEvent) => {
		try {
			let data = await event.data.arrayBuffer()
			let message = decodeMessage(new Uint8Array(data)) as ServerMessage

			switch (message.type) {
				case "connected":
					this.loro.import(message.data)
					// TODO: how do we wait for a sync step rather than the arbitrary time?
					await new Promise((resolve) => setTimeout(resolve, 200))
					this.connectionResolver?.()
					break
				case "sync":
					console.log("recieved sync from server")
					this.loro.import(message.data)
					break
			}
		} catch (err) {
			console.error("Unable to decode message", err)
		}
	}
}
