import { LucideExternalLink } from "lucide-react"

import { Select, SelectGroup, SelectItem } from "../../components/kit/dropdown"
import { Input } from "../../components/kit/input"
import { useNodeProperty } from "../hooks"
import { EndpointNode } from "./node"

export function Component({ node }: { node: EndpointNode }) {
	let contentType = useNodeProperty(node, "contentType")
	let url = useNodeProperty(node, "url")
	let initialized = useNodeProperty(node, "initialized")
	let method = useNodeProperty(node, "method")

	return (
		<div className="flex size-full flex-col gap-2 p-2">
			<div className="grid grid-cols-1 grid-rows-[min-content,min-content]">
				<label className="text-xs font-medium">URL</label>
				<div className="text-gray-500">
					<span className="w-full">
						{!initialized ? (
							<>Provisioning...</>
						) : (
							<a
								href={url}
								target="_blank"
								rel="noreferrer"
								className={`grid grid-cols-[minmax(0,1fr),_12px] gap-1`}
							>
								<span className="overflow-hidden text-ellipsis whitespace-nowrap text-xs">
									{window.location.origin}
									{url}
								</span>
								<span className="mt-[1px]">
									<LucideExternalLink size={12} />
								</span>
							</a>
						)}
					</span>
				</div>
			</div>

			<div className="grid w-full grid-rows-[min-content,32px] gap-1">
				<label htmlFor={`${node.id}-method`} className="text-xs font-medium">
					Method
				</label>
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

			<div className="grid w-full grid-rows-[min-content,32px] gap-1">
				<label htmlFor={`${node.id}-url`} className="text-xs font-medium">
					Content type
				</label>
				<Input
					key="url"
					id={`${node.id}-url`}
					className="flex-1"
					value={contentType ?? ""}
					placeholder="application/json"
					onChange={(e) =>
						node.setProperty("contentType", e.currentTarget.value)
					}
				/>
			</div>
		</div>
	)
}
