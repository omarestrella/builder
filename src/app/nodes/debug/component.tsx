import { useNodeInputs } from "../hooks"
import { DebugNode } from "./node"

export function Component({ node }: { node: DebugNode }) {
	let { value } = useNodeInputs(node)

	return <div className="text-sm">{JSON.stringify(value, null, 2)}</div>
}
