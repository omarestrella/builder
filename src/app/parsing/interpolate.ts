// @ts-expect-error no types here, its okay
import { parse } from "./parser"

type Position = { start: number; offset: number; column: number }
type ParseResult = Array<
	string | { text: string; location: { start: Position; end: Position } }
>

export function interpolate(
	str: string,
	context: Record<string, unknown>,
): string {
	let parsed: ParseResult = parse(str)

	console.log(parsed)

	return parsed
		.map((part) => {
			if (typeof part === "string") {
				return part
			}

			let { text } = part
			let key = text.slice(2, -2).trim()
			if (key in context) {
				return context[key]
			}
			return text
		})
		.join("")
}
