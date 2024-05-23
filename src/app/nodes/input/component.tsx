import { useNodeOutput } from "@/nodes/hooks"

import { InputNode } from "./node"

export function Component({ node }: { node: InputNode }) {
	let value = useNodeOutput(node, "value")

	return (
		<div className="flex flex-col gap-2">
			<input
				className="rounded-md border border-slate-200 p-0.5"
				value={value ?? ""}
				onChange={(e) => {
					node.setOutput("value", e.target.value)
				}}
			/>
		</div>
	)
}
