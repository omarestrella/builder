import { useNodes } from "../../managers/nodes/manager"
import { useNodeInputs } from "../hooks"
import type { AddNode } from "./node"

export function Component({ node }: { node: AddNode }) {
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const a = useNodeInputs(node as any, "a")
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	const b = useNodeInputs(node as any, "b")

	const nodes = useNodes()

	const aNode = nodes.get(a.fromNodeID)
	const bNode = nodes.get(b.fromNodeID)

	const aInput = aNode?.outputs?.[a.outputName]?.value ?? 0
	const bInput = bNode?.outputs?.[b.outputName]?.value ?? 0

	const sum = aInput + bInput

	return (
		<div className="flex flex-col">
			<div>Add Two Numbers</div>
			<div>
				{aInput} + {bInput} = {sum}
			</div>
		</div>
	)
}
