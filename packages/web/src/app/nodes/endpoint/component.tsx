import { LucideExternalLink } from "lucide-react"

import { Input } from "../../components/kit/input"
import { useNodeProperty } from "../hooks"
import { EndpointNode } from "./node"

export function Component({ node }: { node: EndpointNode }) {
	let contentType = useNodeProperty(node, "contentType")
	let url = useNodeProperty(node, "url")
	let initialized = useNodeProperty(node, "initialized")

	return (
		<div className="flex size-full flex-col gap-2 p-1">
			<div className="grid grid-cols-1 grid-rows-[min-content,min-content]">
				<label className="text-xs font-medium">URL</label>
				<div className="grid grid-cols-[minmax(0,1fr),_12px] gap-1 text-gray-500">
					<span className="w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs">
						{!initialized ? (
							<>Provisioning...</>
						) : (
							<a href={url} target="_blank" rel="noreferrer">
								{window.location.origin}
								{url}
							</a>
						)}
					</span>
					<span className="mt-[1px]">
						<LucideExternalLink size={12} />
					</span>
				</div>
			</div>
			<div className="grid w-full grid-rows-[min-content,min-content] gap-1">
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
