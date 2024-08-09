import { LucidePlus } from "lucide-react"
import { useCallback, useEffect, useRef } from "react"

import { Button } from "../../components/kit/button"
import { CodeEditor } from "../../components/kit/code-editor"
import { Select, SelectGroup, SelectItem } from "../../components/kit/dropdown"
import { Input } from "../../components/kit/input"
import { KeyValue } from "../../components/kit/key-value"
import { useDebounce } from "../../hooks/use-debounce"
import { useNodeInputs, useNodeProperty } from "../hooks"
import { HttpRequestNode } from "./node"

export function Component({ node }: { node: HttpRequestNode }) {
	let method = useNodeProperty(node, "method")
	let url = useNodeProperty(node, "url")
	let headers = useNodeProperty(node, "headers")
	let body = useNodeProperty(node, "body")
	let inputs = useNodeInputs(node)

	let abortControllerRef = useRef<AbortController>()

	let onBodyChange = useCallback(
		(code: string) => {
			node.setProperty("body", code)
		},
		[node],
	)

	let performRequest = useCallback(() => {
		abortControllerRef.current?.abort()
		abortControllerRef.current = new AbortController()

		node.run({ abortController: abortControllerRef.current })
	}, [node])

	let debouncedPerformRequest = useDebounce(performRequest, 500)

	useEffect(() => {
		debouncedPerformRequest()
	}, [body, headers, inputs, method, url, debouncedPerformRequest])

	return (
		<div className="flex size-full flex-col gap-2 p-2">
			<div className="grid w-full grid-cols-[112px,_1fr] gap-1">
				<div className="w-full">
					<Select
						placeholder="Method"
						value={method}
						onChange={(value: string) => node.setProperty("method", value)}
					>
						<SelectGroup>
							<SelectItem value="GET">GET</SelectItem>
							<SelectItem value="POST">POST</SelectItem>
							<SelectItem value="PUT">PUT</SelectItem>
							<SelectItem value="DELETE">DELETE</SelectItem>
							<SelectItem value="OPTIONS">OPTIONS</SelectItem>
						</SelectGroup>
					</Select>
				</div>

				<Input
					key="url"
					className="flex-1"
					value={url ?? ""}
					onChange={(e) => node.setProperty("url", e.currentTarget.value)}
				/>
			</div>

			<div className="flex flex-col gap-1">
				<div className="flex h-[22px] items-center justify-between">
					<label className="text-xs font-medium">Headers</label>
					<Button
						onClick={(e) => {
							node.setProperty("headers", [
								...(headers ?? []),
								{ key: "", value: "" },
							])
							e.currentTarget.blur()
						}}
						className={`
        flex !size-auto gap-1 border-0 !text-xs

        hover:text-blue-300
      `}
					>
						<LucidePlus size={12} /> Add
					</Button>
				</div>
				<KeyValue
					value={headers}
					onChange={(index: number, data: { key: string; value: string }) => {
						let newHeaders = [...(headers ?? [])]
						newHeaders[index] = data

						node.setProperty("headers", newHeaders)
					}}
					onDelete={(index: number) => {
						let newHeaders = [...(headers ?? [])]
						newHeaders.splice(index, 1)

						node.setProperty("headers", newHeaders)
					}}
				/>
			</div>

			<div
				className={`
      grid min-h-16 w-full flex-1 grid-rows-[min-content,_1fr] flex-col gap-1

      [&_.cm-editor]:rounded-sm [&_.cm-editor]:border
    `}
			>
				<label className="text-xs font-medium">Body</label>
				<CodeEditor
					code={body}
					language="json"
					completionData={[]}
					onChange={onBodyChange}
					options={{
						lineNumbers: true,
					}}
				/>
			</div>
		</div>
	)
}
