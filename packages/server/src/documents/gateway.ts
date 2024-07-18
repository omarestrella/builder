import { decodeMessage, encodeServerMessage } from "@builder/messages/index.ts"
import { WSContext } from "hono/websocket"

import { Logger } from "../logger.ts"
import { LiveDocument } from "./live-document.ts"
import { DocumentsService } from "./service.ts"

type DocumentID = string

export class DocumentsGateway {
	logger = new Logger("DocumentsGateway")

	liveDocuments = new Map<DocumentID, LiveDocument>()
	connections = new Map<DocumentID, Set<WSContext>>()
	connectionData = new Map<WSContext, LiveDocument>()

	websockets = new Set<WSContext>()

	constructor(private readonly documentsService: DocumentsService) {}

	onConnect = async (client: WSContext, userID: string, documentID: string) => {
		this.websockets.add(client)
		await this.handleConnection(client, userID, documentID)
	}

	async handleConnection(
		client: WSContext,
		userID: string,
		documentID: string,
	) {
		if (!documentID || !userID) {
			client.close(4500)
			return
		}
		if (!this.connections.get(documentID)) {
			this.connections.set(documentID, new Set())
		}

		let connections = this.connections.get(documentID)!
		connections.add(client)

		let liveDocument = this.liveDocuments.get(documentID)
		if (!liveDocument) {
			let document = await this.documentsService.getDocument(userID, documentID)

			liveDocument = new LiveDocument(this.documentsService, {
				document,
				documentID,
			})
			this.liveDocuments.set(documentID, liveDocument)
		}

		liveDocument.addConnection(client, {
			userID,
		})
		this.connectionData.set(client, liveDocument)

		this.logger.log("Client connected", userID, "-", documentID)

		let documentData = liveDocument.handleConnect(client, userID)

		client.send(
			encodeServerMessage("connected", {
				data: documentData,
			}),
		)
	}

	onDisconnect = async (client: WSContext) => {
		let liveDocument = this.connectionData.get(client)
		if (liveDocument) {
			let data = liveDocument.getConnectionData(client)
			this.logger.log(
				"Client disconnected",
				data?.userID,
				"-",
				liveDocument.documentID,
			)

			await liveDocument.removeConnection(client)
			this.connectionData.delete(client)

			let documentConnections = this.connections.get(liveDocument.documentID)
			documentConnections?.delete(client)

			if (documentConnections?.size === 0) {
				this.liveDocuments.delete(liveDocument.documentID)
			}
		}
	}

	onMessage = (client: WSContext, ev: MessageEvent) => {
		try {
			let decoded = decodeMessage(new Uint8Array(ev.data))
			switch (decoded.type) {
				case "update":
					this.handleUpdate(client, decoded.updates)
					break
				case "sync":
					this.handleSync(client, decoded.data)
					break
			}
		} catch (err) {
			this.logger.error("Could not decode message", err)
		}
	}

	handleSync(client: WSContext, data: unknown) {
		this.logger.log("Recieved sync from client")

		let liveDocument = this.connectionData.get(client)
		if (!liveDocument) {
			this.logger.error("No local document information")
			return
		}

		console.log(typeof data)
	}

	handleUpdate(client: WSContext, updates: Uint8Array) {
		if (updates.length <= 0) {
			return
		}

		this.logger.log("Recieved update from client")

		let liveDocument = this.connectionData.get(client)
		if (!liveDocument) {
			this.logger.error("No local document infor mation")
			return
		}

		liveDocument.applyUpdates(client, updates)
		liveDocument.connections.forEach((connection) => {
			if (connection !== client) {
				connection.send(
					encodeServerMessage("sync", {
						data: liveDocument.document.exportSnapshot(),
					}),
				)
			}
		})
	}
}
