import { bold, green, red, yellow } from "@std/fmt/colors"

export class Logger {
	constructor(readonly module: string) {}

	get base() {
		return bold(`[${this.module}]`)
	}

	log(message: string, ...contents: unknown[]) {
		console.log(green(this.base), green(message), ...contents)
	}

	warn(message: string, ...contents: unknown[]) {
		console.warn(yellow(this.base), yellow(message), ...contents)
	}

	error(message: string, ...contents: unknown[]) {
		console.error(red(this.base), red(message), ...contents)
	}
}
