import { LucideLoaderCircle, LucidePlay } from "lucide-react"
import { useState } from "react"

import { Button } from "../../components/kit/button"
import { nodeManager } from "../../managers/node/manager"
import { BaseNode } from "../base"

export function RunButton({ node }: { node: BaseNode }) {
	let [running, setRunning] = useState(false)

	let triggerDownstreamNodes = async () => {
		let trigger = async (node: BaseNode) => {
			for (let outputData of node.outputData) {
				let downstreamNode = nodeManager.getNode(outputData.toNodeID)
				if (!downstreamNode) {
					continue
				}
				await downstreamNode.run()
				await trigger(downstreamNode)
			}
		}
		return trigger(node)
	}

	let runNode = async () => {
		if (running) {
			return
		}

		setRunning(true)
		try {
			await node.run()
			await triggerDownstreamNodes()
		} finally {
			setRunning(false)
		}
	}

	if (!node.runnable) {
		return null
	}

	return (
		<Button
			className={`
     h-4 border-none !p-0 !outline-none

     focus:ring-0
   `}
			onClick={() => {
				requestAnimationFrame(() => runNode())
			}}
		>
			{!running ? (
				<LucidePlay size={14} />
			) : (
				<LucideLoaderCircle size={14} className="animate-spin" />
			)}
		</Button>
	)
}
