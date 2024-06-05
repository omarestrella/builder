import { useNodeInputs } from "@/nodes/hooks"

import { DebugNode } from "./node"

export function Component({ node }: { node: DebugNode }) {
	let { value } = useNodeInputs(node)

	return (
		<div className="text-sm">
			<pre className="font-mono">
				<code>
					{value !== undefined ? JSON.stringify(value, null, 2) : "undefined"}
				</code>
			</pre>
		</div>
	)
}
