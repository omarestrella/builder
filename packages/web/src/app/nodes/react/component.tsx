import { useCallback, useEffect, useMemo, useRef, useState } from "react"

import { CodeEditor } from "../../components/kit/code-editor"
import { useDebounce } from "../../hooks/use-debounce"
import { compilerManager } from "../../managers/compiler/manager"
import { vmManager } from "../../managers/vm/manager"
import { useNodeInputData, useNodeInputs, useNodeProperty } from "../hooks"
import { ReactNode } from "./node"
import { Renderer } from "./renderer"

export function Component({ node }: { node: ReactNode }) {
	let inputs = useNodeInputs(node)
	let inputData = useNodeInputData(node)
	let code = useNodeProperty(node, "code")

	let [error, setError] = useState<string | null>(null)
	let [parsedCode, setParsedCode] = useState<string | null>(null)

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

	let compileCode = useCallback(async () => {
		try {
			let transformedCode = await compilerManager.transform(code, {
				jsx: "transform",
				loader: "jsx",
				jsxFactory: "h",
				jsxSideEffects: true,
			})

			setError(null)
			setParsedCode(transformedCode.code)
		} catch (e: unknown) {
			setError((e as Error).message)
		}
	}, [code])

	let debouncedCompileCode = useDebounce(compileCode, 500)

	useEffect(() => {
		if (initialized.current) {
			return
		}
		initialized.current = true
		vmManager.init()
	}, [])

	useEffect(() => {
		debouncedCompileCode()
	}, [code, inputs, inputData, debouncedCompileCode, node])

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
				<Renderer code={parsedCode} />
			</div>
		</div>
	)
}
