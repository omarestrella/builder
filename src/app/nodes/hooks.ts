import { useEffect, useState } from "react"
import { proxy, subscribe, useSnapshot } from "valtio"
import { z } from "zod"

import { nodeManager } from "../managers/node/manager"
import { BaseNode, InputValue } from "./base"

const dummyProxy = proxy({
	value: null,
})

export function useOutputValue(node: BaseNode, key: string) {
	const state = useSnapshot(node.outputs?.[key] ?? dummyProxy)
	return state.value
}

export function useNodeInputs<
	Node extends BaseNode,
	Inputs extends z.TypeOf<Node["definition"]["inputs"]>,
>(node: Node) {
	const inputs = useSnapshot(node.inputs)

	const [results, setResults] = useState({})

	useEffect(() => {
		const subscriptions: (() => void)[] = []
		const inputEntries = Object.entries(inputs as Record<string, InputValue>)

		inputEntries.forEach(([key, value]) => {
			if (!value.fromNodeID) {
				return
			}

			const fromNode = nodeManager.getNode(value.fromNodeID)
			const outputKey = value.outputName
			if (!fromNode || !outputKey || !fromNode.outputs[outputKey]) {
				return
			}

			const unsubscribe = subscribe(fromNode.outputs[outputKey], () => {
				setResults((r) => ({ ...r, [key]: fromNode.outputs[outputKey].value }))
			})

			subscriptions.push(unsubscribe)
		})

		return () => {
			subscriptions.forEach((s) => s())
		}
	}, [inputs])

	return results as Inputs
}
