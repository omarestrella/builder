import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { CodeEditor } from "../../components/code-editor"
import { useDebounce } from "../../hooks/use-debounce"
import { vmManager } from "../../managers/vm/manager"
import { useNodeInputData, useNodeInputs, useNodeProperty } from "../hooks"
import { JavaScriptNode } from "./node"

export function Component({ node }: { node: JavaScriptNode }) {
	let inputs = useNodeInputs(node)
	let inputData = useNodeInputData(node)
	let code = useNodeProperty(node, "code")

	let [error, setError] = useState<string | null>(null)
	let initialized = useRef(false)

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

	let runCode = useCallback(() => {
		try {
			vmManager.awaitReady().then(() => {
				let context: Record<string, unknown> = {}
				Object.entries(inputData).forEach(([key]) => {
					context[key] = inputs[key]
				})
				let result = vmManager.scopedEval(
					`(() => {
					${code}
				})()`,
					context,
				)

				if (result instanceof Promise) {
					result.then((value) => {
						node.setOutput("result", value)
						setError(null)
					})
				} else {
					node.setOutput("result", result)
					setError(null)
				}
			})
		} catch (e: unknown) {
			setError((e as Error).message)
		}
	}, [code, inputs, inputData, node])

	let debouncedRunCode = useDebounce(runCode, 500)

	useEffect(() => {
		if (initialized.current) {
			return
		}
		initialized.current = true
		vmManager.init()
	}, [])

	useEffect(() => {
		debouncedRunCode()
	}, [code, inputs, inputData, debouncedRunCode, node])

	return (
		<div className="flex size-full flex-col gap-2">
			<CodeEditor
				initialCode={code}
				onChange={onChange}
				completionData={inputCompletionData}
				options={{
					lineNumbers: true,
				}}
			/>
			{error ? <div className="text-xs text-red-500">{error}</div> : null}
		</div>
	)
}
