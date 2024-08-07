import { bind } from "@builder/loro/src/bind"
import { Loro } from "@builder/loro/src/index"
import {
	decodeMessage,
	encodeClientMessage,
	ServerMessage,
} from "@builder/messages"
import { proxy } from "valtio"

export class DocumentManager {
	doc: Loro = new Loro()

	private cleanup?: () => void
	private loroSubscription?: number

	private connectionResolver?: () => void

	socket?: WebSocket

	initializeDocument(nodes: ReturnType<typeof proxy>) {
		this.cleanup = bind(nodes, this.doc)
		// @ts-expect-error - expose Loro for debugging
		window.loro = this.doc

		this.loroSubscription = this.doc.subscribe((event) => {
			if (event.by === "local" && event.origin === "sync") {
				console.log(
					"sending update to server",
					this.doc.getMap("root").toJSON(),
				)
				this.socket?.send(
					encodeClientMessage("update", {
						updates: this.doc.exportSnapshot(),
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
			this.doc.unsubscribe(this.loroSubscription)
		}

		this.doc = new Loro()
		this.socket?.close()
	}

	onMessage = async (event: MessageEvent) => {
		try {
			let data = await event.data.arrayBuffer()
			let message = decodeMessage(new Uint8Array(data)) as ServerMessage

			switch (message.type) {
				case "connected":
					this.doc.import(message.data)
					// TODO: how do we wait for a sync step rather than the arbitrary time?
					await new Promise((resolve) => setTimeout(resolve, 200))
					this.connectionResolver?.()
					break
				case "sync":
					console.log("recieved sync from server")
					this.doc.import(message.data)
					break
			}
		} catch (err) {
			console.error("Unable to decode message", err)
		}
	}
}
