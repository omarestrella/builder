import { lazy, Suspense, useCallback } from "react"

import { useNodeInputs, useNodeOutput } from "../hooks"
import { TypeScriptNode } from "./node"

const CodeEditor = lazy(() => import("./code-editor"))

export function Component({ node }: { node: TypeScriptNode }) {
	let inputs = useNodeInputs(node)
	let output = useNodeOutput(node, "result")

	let onChange = useCallback((code: string) => {
		// this is so bad, but i dont care right now
		let result = eval(`(() => {
			${code}
		})()`)
		console.log("result", result)
	}, [])

	return (
		<div className="flex max-w-72 flex-col gap-2">
			<Suspense>
				<CodeEditor onChange={onChange} />
			</Suspense>
		</div>
	)
}
