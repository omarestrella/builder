import { LucideLoaderCircle, LucidePlay } from "lucide-react"
import { useState } from "react"

import { Button } from "../../components/kit/button"
import { BaseNode } from "../base"

export function RunButton({ node }: { node: BaseNode }) {
	let [running, setRunning] = useState(false)

	let triggerDownstreamNodes = () => {
		// TODO: trigger nodes that are connected to this node
		// for (let [_id, outputData] of Object.entries(node.outputData)) {
		// 	console.log(outputData)
		// }
	}

	let runNode = async () => {
		if (running) {
			return
		}

		setRunning(true)
		try {
			await node.run()

			triggerDownstreamNodes()
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
			onClick={runNode}
		>
			{!running ? (
				<LucidePlay size={14} />
			) : (
				<LucideLoaderCircle size={14} className="animate-spin" />
			)}
		</Button>
	)
}
