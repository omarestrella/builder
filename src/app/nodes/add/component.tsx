import { useNodeInputs } from "../hooks"
import type { AddNode } from "./node"

export function Component({ node }: { node: AddNode }) {
	const { a, b } = useNodeInputs(node)

	const sum = a + b

	return (
		<div className="flex flex-col">
			<div>Add Two Numbers</div>
			<div>
				{+a} + {+b} = {sum}
			</div>
		</div>
	)
}
