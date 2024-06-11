import { Input } from "@/components/input"
import { useNodeOutput } from "@/nodes/hooks"

import { InputNode } from "./node"

export function Component({ node }: { node: InputNode }) {
	let value = useNodeOutput(node, "value")

	return (
		<div className="p-0.5">
			<Input
				value={value ?? ""}
				onChange={(e) => {
					node.setOutput("value", e.target.value)
				}}
			/>
		</div>
	)
}
