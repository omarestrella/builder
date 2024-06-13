/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loro, LoroMap } from "loro-crdt"
import { proxy } from "valtio/vanilla"
import { describe, expect, test } from "vitest"

import { bind } from "./index"

let wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe("bind", () => {
	test("add top-level key to object", async () => {
		let obj = proxy({ a: 1, b: 2 } as Record<string, any>)
		let doc = new Loro()

		bind(obj, doc)

		expect(doc.getMap("root").get("a")).toBe(1)
		expect(doc.getMap("root").get("c")).toBe(undefined)

		obj.c = 3
		obj.a = 4

		await wait(50)

		expect(doc.getMap("root").get("a")).toBe(4)
		expect(doc.getMap("root").get("c")).toBe(3)
	})

	test("add nested key to object", async () => {
		let obj = proxy({ a: { b: 1 } } as Record<string, any>)
		let doc = new Loro()

		bind(obj, doc)

		expect((doc.getMap("root").get("a") as LoroMap).get("c")).toBe(undefined)

		obj.a.c = 2

		await wait(50)

		expect((doc.getMap("root").get("a") as LoroMap).get("c")).toBe(2)
	})
})
