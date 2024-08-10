import { useCallback, useMemo } from "react"

import { CodeEditor } from "../../components/kit/code-editor"
import {
	useNodeInputData,
	useNodeInputs,
	useNodeOutput,
	useNodeProperty,
} from "../hooks"
import { JavaScriptNode } from "./node"

export function Component({ node }: { node: JavaScriptNode }) {
	let inputs = useNodeInputs(node)
	let inputData = useNodeInputData(node)
	let code = useNodeProperty(node, "code")
	let error = useNodeOutput(node, "error")

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

	return (
		<div className="flex size-full flex-col gap-2">
			<CodeEditor
				code={code ?? ""}
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
