import { Suspense, useCallback, useEffect, useMemo, useState } from "react"

import { CodeEditor } from "@/components/code-editor"
import { useNodeInputData, useNodeInputs, useNodeProperty } from "@/nodes/hooks"

import { JavaScriptNode } from "./node"

export function Component({ node }: { node: JavaScriptNode }) {
	let inputs = useNodeInputs(node)
	let inputData = useNodeInputData(node)
	let code = useNodeProperty(node, "code")

	let [error, setError] = useState<string | null>(null)

	let onChange = useCallback(
		(code: string) => {
			node.setProperty("code", code)
		},
		[node],
	)

	let inputCompletionData = useMemo(() => {
		return Object.entries(inputData).map(([key]) => {
			return {
				label: key,
				value: inputs[key],
			}
		})
	}, [inputs, inputData])

	useEffect(() => {
		try {
			// this is so bad, but i dont care right now
			let fn = eval(`((inputs) => {
				Object.entries(inputs).forEach(([key, value]) => {
					globalThis[key] = value
				})
				${code}
			})`)
			let data = Object.fromEntries(
				Object.keys(inputData).map((key) => [key, inputs[key]]),
			)

			let result = fn(data)
			node.setOutput("result", result)
			setError(null)
		} catch (e: unknown) {
			setError((e as Error).message)
		}
	}, [code, inputs, inputData, node])

	return (
		<div className="flex size-full h-52 w-80 flex-col gap-2">
			<Suspense>
				<CodeEditor
					initialCode={code}
					onChange={onChange}
					completionData={inputCompletionData}
					options={{
						lineNumbers: true,
					}}
				/>
			</Suspense>
			{error ? <div className="text-xs text-red-500">{error}</div> : null}
		</div>
	)
}
