import { WSContext } from "hono/websocket"
import { Loro } from "loro-crdt"

import { Logger } from "../logger.ts"
import { DocumentsService } from "./service.ts"

export class LiveDocument {
	logger = new Logger("LiveDocument")

	connectionData = new Map<WebSocket, { userID: string }>()

	connections = new Set<WebSocket>()

	documentID: string
	document: Loro

	constructor(
		readonly documentsService: DocumentsService,
		{
			document,
			documentID,
		}: {
			document: Loro
			documentID: string
		},
	) {
		this.document = document
		this.documentID = documentID

		this.logger.log("Live document is ready")
	}

	addConnection(client: WSContext, info: { userID: string }) {
		this.connectionData.set(client, info)
		this.connections.add(client)
	}

	async removeConnection(client: WSContext) {
		this.connections.delete(client)
		this.connectionData.delete(client)

		if (this.connections.size === 0) {
			await this.cleanup()
		}
	}

	getConnectionData(client: WSContext) {
		return this.connectionData.get(client)
	}

	async cleanup() {
		this.logger.log("Cleaning up live document")

		await this.saveDocument()

		this.connections.clear()
		this.connectionData.clear()
	}

	handleConnect(_client: WSContext, userID: string) {
		this.logger.log("Client connected", userID)
		return this.document.exportSnapshot()
	}

	applyUpdates(_sourceClient: WSContext, updates: Uint8Array) {
		this.document.import(updates)
	}

	async saveDocument() {
		this.logger.log("Saving document")
		await this.documentsService.saveDocument("", this.documentID)
	}
}
