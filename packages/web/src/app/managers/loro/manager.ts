import { bind } from "@builder/loro/src/bind"
import { Loro } from "@builder/loro/src/index"
import { proxy } from "valtio"

export class LoroManager {
	loro: Loro = new Loro()

	private cleanup?: () => void

	initializeDocument(nodes: ReturnType<typeof proxy>) {
		this.cleanup = bind(nodes, this.loro)
	}
}
