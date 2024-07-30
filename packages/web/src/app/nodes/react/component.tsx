import React, { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { createRoot } from "react-dom/client"

import { CodeEditor } from "../../components/kit/code-editor"
import { useDebounce } from "../../hooks/use-debounce"
import { compilerManager } from "../../managers/compiler/manager"
import { vmManager } from "../../managers/vm/manager"
import { useNodeInputData, useNodeInputs, useNodeProperty } from "../hooks"
import { ReactNode } from "./node"

export function Component({ node }: { node: ReactNode }) {
	let inputs = useNodeInputs(node)
	let inputData = useNodeInputData(node)
	let code = useNodeProperty(node, "code")

	let [error, setError] = useState<string | null>(null)

	let initialized = useRef(false)
	let reactContainer = useRef<HTMLDivElement>(null)

	let root = useRef<ReturnType<typeof createRoot>>()

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
			vmManager.awaitReady().then(async () => {
				let context: Record<string, unknown> = {
					React,
				}
				Object.entries(inputData).forEach(([key]) => {
					context[key] = inputs[key]
				})

				let transformedCode = await compilerManager.transform(code, {
					jsx: "transform",
					loader: "jsx",
					jsxSideEffects: true,
				})
				let finalCode = `(() => {
					let Comp = (function Comp() {
						${transformedCode.code}
					})()

					return Comp
				})()
				`

				try {
					let result = vmManager.scopedEval(finalCode, context)
					root.current?.render(result)

					node.setOutput("output", result)
					setError(null)
				} catch (err) {
					console.error(err)
					setError((err as Error).toString())
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

		if (!root.current) {
			root.current = createRoot(reactContainer.current!)
		}
	}, [])

	useEffect(() => {
		debouncedRunCode()
	}, [code, inputs, inputData, debouncedRunCode, node])

	return (
		<div className="flex size-full flex-col gap-1">
			<CodeEditor
				code={code ?? ""}
				onChange={onChange}
				completionData={inputCompletionData}
				language="javascript"
				options={{
					lineNumbers: true,
				}}
			/>
			<div className="flex flex-col gap-1 px-2 pb-2">
				<span className="text-xs font-semibold">Preview</span>
				{error ? <div className="text-xs text-red-500">{error}</div> : null}
				<div ref={reactContainer} />
			</div>
		</div>
	)
}
