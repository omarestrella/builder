import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url"
import { VMManager as BaseVMManager } from "@tectonica/vm"
import { proxy } from "valtio"

class VMManager extends BaseVMManager {
	state: never = proxy()

	async init(): Promise<void> {
		let result = await super.init({
			debug: false,
			async: false,
			variantOptions: {
				wasmLocation,
			},
		})

		await this.initializeGlobals()

		return result
	}

	async initializeGlobals() {
		await this.awaitReady()

		this.registerVMGlobal("setTimeout", window.setTimeout)
	}
}

export const vmManager = new VMManager()

vmManager.init()
