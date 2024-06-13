import { Loro } from "loro-crdt"

export class Project {
	doc: Loro

	constructor(readonly projectID: string) {
		this.doc = new Loro()
	}
}
