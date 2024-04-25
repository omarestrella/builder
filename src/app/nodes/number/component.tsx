import { useOutputValue } from "../hooks"
import type { NumberNode } from "./node"

export function Component({ node }: { node: NumberNode }) {
	const value = useOutputValue(node, "number")

	return (
		<div>
			<input
				type="number"
				value={value ?? 0}
				placeholder="Number"
				onChange={(e) => {
					node.setOutput("number", e.target.valueAsNumber)
				}}
			/>
		</div>
	)
}
