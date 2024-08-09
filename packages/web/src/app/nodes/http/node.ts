import { LucideGlobe } from "lucide-react"
import { z } from "zod"

import { interpolate } from "../../parsing/interpolate"
import { BaseNode } from "../base"
import { Component } from "./component"

const inputs = z.record(z.string(), z.unknown())
const outputs = z.object({
	response: z.unknown(),
	error: z.unknown(),
})
const properties = z.object({
	method: z.string(),
	url: z.string(),
	body: z.string(),
	headers: z.array(z.object({ key: z.string(), value: z.string() })),
})

export class HttpRequestNode extends BaseNode<
	typeof inputs,
	typeof outputs,
	typeof properties
> {
	definition = {
		inputs,
		outputs,
		properties,
	}

	dynamicInputs = true

	static type = "REQUEST"

	constructor(id?: string) {
		super(id)
		this.meta.size = { width: 400, height: 280 }
	}

	component(props: { node: HttpRequestNode }): JSX.Element {
		return Component(props)
	}

	async run(args: { abortController?: AbortController }) {
		let abortController = args?.abortController

		let { url, headers, method, body } = this.properties

		if (!url) {
			return {
				response: null,
				error: "No URL",
			}
		}

		let requestUrl = interpolate(url, this.inputs)

		let headersObj = Object.fromEntries(
			(headers ?? []).map((header) => [header.key, header.value]),
		)
		let interpolatedHeaders = interpolate(
			JSON.stringify(headersObj),
			this.inputs,
		)

		try {
			let response = await fetch(requestUrl, {
				method,
				body:
					method !== "GET" && body ? interpolate(body, this.inputs) : undefined,
				headers: JSON.parse(interpolatedHeaders),
				signal: abortController?.signal,
			})

			if (response.ok) {
				let data: unknown = ""
				if (
					response.headers.get("Content-Type")?.includes("application/json")
				) {
					data = await response.json()
				} else {
					data = await response.text()
				}
				this.setOutput("response", data)
				this.setOutput("error", undefined)

				return {
					response: data,
					error: null,
				}
			} else {
				this.setOutput("response", null)
				this.setOutput("error", response.statusText)

				return {
					response: null,
					error: response.statusText,
				}
			}
		} catch (error) {
			let err = error as Error
			this.setOutput("response", undefined)
			this.setOutput("error", err.toString())

			return {
				response: null,
				error: err.toString(),
			}
		}
	}

	static get icon() {
		return LucideGlobe
	}
}
