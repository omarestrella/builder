import { lazy, Suspense, useCallback, useEffect, useState } from "react"

import { useNodeInputs } from "../hooks"
import { TypeScriptNode } from "./node"

const CodeEditor = lazy(() => import("./code-editor"))

export function Component({ node }: { node: TypeScriptNode }) {
	let inputs = useNodeInputs(node)

	let [code, setCode] = useState("")

	console.log("inputs", inputs)

	let onChange = useCallback((code: string) => {
		setCode(code)
	}, [])

	useEffect(() => {
		try {
			// this is so bad, but i dont care right now
			let fn = eval(`((inputs) => {
			${code}
		})`)
			let result = fn({ ...inputs })
			node.setOutput("result", result)
		} catch {
			// dont care right now
		}
	}, [code, inputs, node])

	return (
		<div className="flex max-w-72 flex-col gap-2">
			<Suspense>
				<CodeEditor onChange={onChange} />
			</Suspense>
		</div>
	)
}
