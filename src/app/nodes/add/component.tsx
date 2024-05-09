import { useNodeInputs } from "../hooks"
import type { AddNode } from "./node"

export function Component({ node }: { node: AddNode }) {
	const { a, b } = useNodeInputs(node)

	const sum = (a ?? 0) + (b ?? 0)

	return (
		<div className="flex flex-col">
			<div>Add Two Numbers</div>
			<div>
				{a ?? 0} + {b ?? 0} = {sum}
			</div>
		</div>
	)
}
