import wasmLocation from "@jitl/quickjs-wasmfile-release-sync/wasm?url"
import { VMManager as BaseVMManager } from "@tectonica/vm"
import { proxy } from "valtio"

class VMManager extends BaseVMManager {
	state: never = proxy()

	init(): Promise<void> {
		return super.init({
			debug: false,
			async: false,
			variantOptions: {
				wasmLocation,
			},
		})
	}
}

export const vmManager = new VMManager()
