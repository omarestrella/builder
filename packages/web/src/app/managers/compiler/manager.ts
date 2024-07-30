import * as esbuild from "esbuild-wasm"
import wasmURL from "esbuild-wasm/esbuild.wasm?url"

class CompilerManager {
	readyPromise: Promise<void>

	constructor() {
		this.readyPromise = new Promise((resolve) => {
			esbuild
				.initialize({
					wasmURL,
				})
				.then(resolve)
		})
	}

	async transform(code: string, options?: esbuild.TransformOptions) {
		await this.readyPromise
		return esbuild.transform(code, options)
	}
}

export const compilerManager = new CompilerManager()
