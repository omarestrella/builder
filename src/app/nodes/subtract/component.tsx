import type { SubtractNode } from "./node"

export function Component({ node }: { node: SubtractNode }) {
	return <>{node.name}</>
}
