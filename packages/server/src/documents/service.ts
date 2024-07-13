import { sql } from "drizzle-orm"
import { Loro } from "loro-crdt"

import { db } from "../database/db.ts"
import { project } from "../database/schema.ts"
import { Logger } from "../logger.ts"

type DocumentID = string
type Project = unknown // table in db?

function getProjectForDocumentID(_documentID: DocumentID) {
	return null
}

export class DocumentsService {
	projects = new Map<DocumentID, Project>()
	documents = new Map<DocumentID, Loro>()
	logger = new Logger("DocumentsService")

	constructor() {}

	async getProject(documentID: DocumentID): Promise<Project> {
		if (this.projects.has(documentID)) {
			return this.projects.get(documentID)!
		} else {
			return (await getProjectForDocumentID(documentID)) as Project
		}
	}

	async getDocument(_ownerID: string, documentID: DocumentID): Promise<Loro> {
		let loro = new Loro()
		if (this.documents.has(documentID)) {
			return this.documents.get(documentID)!
		} else {
			let data = await this.getDocumentData(documentID)
			if (data) {
				loro = Loro.fromSnapshot(data)
			}
			this.documents.set(documentID, loro)
		}
		return loro
	}

	async getDocumentData(documentID: string): Promise<Uint8Array | null> {
		let kv = await Deno.openKv()
		let data = await kv.get<Uint8Array>([documentID, "data"])
		return data.value
	}

	async saveDocument(_owner: string, documentID: string) {
		let document = this.documents.get(documentID)
		if (!document) return

		let kv = await Deno.openKv()
		await kv.set([documentID, "data"], document.exportSnapshot())

		// TODO: move this to updateStoredDocument and call via cron
		await db
			.update(project)
			.set({
				data: JSON.stringify(document.toJSON()),
			})
			.where(sql`id = ${documentID}`)
			.run()
	}

	async clearLocalCache(_documentID: string) {}

	private async updateStoredDocument(
		_owner: string,
		_documentID: string,
		_data: Uint8Array,
	) {
		this.logger.log("Uploading document")
	}
}
