import { useCallback, useEffect } from "react"
import { subscribe } from "valtio"

import { Input } from "../../components/kit/input"
import { useDebounce } from "../../hooks/use-debounce"
import { useNode } from "../../managers/node/hooks"
import { useNodeInput, useNodeProperty } from "../hooks"
import { RepeaterNode } from "./node"

export function Component({ node }: { node: RepeaterNode }) {
	let nodeID = useNodeInput(node, "node")
	let times = useNodeProperty(node, "times")

	let repeatNode = useNode(nodeID)

	let runRepeater = useCallback(() => {
		node.run({
			params: {
				repeatNode,
			},
		})
	}, [node, repeatNode])

	let debouncedRunRepeater = useDebounce(runRepeater, 200)

	useEffect(() => {
		debouncedRunRepeater()
	}, [times, repeatNode, debouncedRunRepeater])

	useEffect(() => {
		if (!repeatNode) {
			return
		}

		let unsubscribe = subscribe(repeatNode, (ops) => {
			let propertiesChanged = ops.some(([op, path]) => {
				return op === "set" && path.includes("properties")
			})
			if (propertiesChanged) {
				debouncedRunRepeater()
			}
		})

		return () => unsubscribe()
	}, [debouncedRunRepeater, repeatNode])

	return (
		<div className="flex flex-col gap-2 p-2">
			<div>
				<label className="text-xs font-medium">Times</label>
				<Input
					type="number"
					value={times}
					onChange={(e) => {
						node.setProperty("times", e.target.valueAsNumber)
					}}
				/>
			</div>
		</div>
	)
}
