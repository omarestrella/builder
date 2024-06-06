import { LucidePlus } from "lucide-react"

import { Button } from "@/components/button"
import { Select, SelectGroup, SelectItem } from "@/components/dropdown"
import { Input } from "@/components/input"
import { KeyValue } from "@/components/key-value"
import { useNodeInputs, useNodeProperty } from "@/nodes/hooks"

import { HttpRequestNode } from "./node"

export function Component({ node }: { node: HttpRequestNode }) {
	let method = useNodeProperty(node, "method")
	let url = useNodeProperty(node, "url")
	let headers = useNodeProperty(node, "headers")
	let inputs = useNodeInputs(node)

	return (
		<div className="flex size-full min-h-52 w-96 flex-col gap-2 p-1">
			<div className="flex gap-1">
				<div className="w-[112px]">
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
		</div>
	)
}
