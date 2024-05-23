import { lazy, Suspense, useCallback, useEffect, useState } from "react"

import { useNodeInputs, useNodeProperty } from "@/nodes/hooks"

import { TypeScriptNode } from "./node"

const CodeEditor = lazy(() => import("./code-editor"))

export function Component({ node }: { node: TypeScriptNode }) {
	let inputs = useNodeInputs(node)
	let code = useNodeProperty(node, "code")

	let [error, setError] = useState<string | null>(null)

	let onChange = useCallback(
		(code: string) => {
			node.setProperty("code", code)
		},
		[node],
	)

	useEffect(() => {
		try {
			// this is so bad, but i dont care right now
			let fn = eval(`((inputs) => {
				Object.entries(inputs).forEach(([key, value]) => {
					globalThis[key] = value
				})
				${code}
			})`)
			let result = fn({ ...inputs })
			node.setOutput("result", result)
			setError(null)
		} catch (e: unknown) {
			setError((e as Error).message)
		}
	}, [code, inputs, node])

	return (
		<div className="flex size-full flex-col gap-2">
			<Suspense>
				<CodeEditor initialCode={code} onChange={onChange} />
			</Suspense>
			{error ? <div className="text-xs text-red-500">{error}</div> : null}
		</div>
	)
}
