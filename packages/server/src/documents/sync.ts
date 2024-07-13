import { upgradeWebSocket } from "hono/deno"

import { Hono } from "../hono.ts"
import { currentUser } from "../middleware.ts"
import { DocumentsGateway } from "./gateway.ts"
import { DocumentsService } from "./service.ts"

export const sync = new Hono()
sync.use(currentUser)

const documentsGateway = new DocumentsGateway(new DocumentsService())

sync.get(
	"/:id",
	upgradeWebSocket((c) => {
		if (!c.get("currentUser")) {
			throw new Error("unauthorized")
		}
		let userID = c.get("currentUser").id
		let documentID = c.req.param("id")
		if (!userID || !documentID) {
			throw new Error("invalid request. missing user or document id")
		}
		return {
			onOpen(_event, ws) {
				documentsGateway.onConnect(ws, userID, documentID)
			},
			onMessage(event, ws) {
				documentsGateway.onMessage(ws, event)
			},
			onClose(_event, ws) {
				documentsGateway.onDisconnect(ws)
			},
		}
	}),
)
