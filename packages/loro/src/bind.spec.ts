/* eslint-disable @typescript-eslint/no-explicit-any */
import { Loro, LoroMap, LoroMovableList, UndoManager } from "loro-crdt"
import { proxy } from "valtio/vanilla"
import { describe, expect, test } from "vitest"

import { bind } from "./bind"

let wait = (ms: number) => new Promise((r) => setTimeout(r, ms))

describe("bind", () => {
	test("binding object proxy initializes a document", () => {
		let obj = proxy({
			a: 1,
			b: 2,
			c: { d: "test", e: 3 },
			d: [1, 2, 3],
		} as Record<string, any>)
		let doc = new Loro()

		bind(obj, doc)

		expect(doc.getMap("root").toJSON()).toEqual({
			a: 1,
			b: 2,
			c: { d: "test", e: 3 },
			d: [1, 2, 3],
		})
	})

	test("binding array proxy initializes a document", () => {
		let obj = proxy([1, 2, 3])
		let doc = new Loro()

		bind(obj, doc)

		expect(doc.getMovableList("root").toJSON()).toEqual([1, 2, 3])
	})

	describe("proxy -> document", () => {
		describe("objects", () => {
			test("add top-level key", async () => {
				let obj = proxy({ a: 1, b: 2 } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				obj.c = 3

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 1, b: 2, c: 3 })
			})

			test("add nested key", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				obj.a.c = 2

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1, c: 2 },
				})
			})

			test("add object", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				obj.a.c = { type: 2 }

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1, c: { type: 2 } },
				})

				obj.d = { e: 3 }

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1, c: { type: 2 } },
					d: { e: 3 },
				})
			})

			test("add deep object", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				obj.c = { d: { e: 2 } }

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1 },
					c: { d: { e: 2 } },
				})
			})

			test("add proxied object", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				let nested = {
					c: proxy({ d: 2 } as Record<string, any>),
				}
				obj.nested = nested

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1 },
					nested: { c: { d: 2 } },
				})
			})

			test("add array", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				obj.a.c = [1, 2, 3]
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1, c: [1, 2, 3] },
				})

				obj.a.c = [1, 2]
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: { b: 1, c: [1, 2] },
				})
			})

			test("update key", async () => {
				let obj = proxy({ a: 1, b: { c: 1 }, d: { name: "test" } } as Record<
					string,
					any
				>)
				let doc = new Loro()

				bind(obj, doc)

				obj.a = 2
				obj.b.c = 3
				obj.d = { other: "test2" }

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({
					a: 2,
					b: { c: 3 },
					d: { other: "test2" },
				})
			})

			test("delete key", async () => {
				let obj = proxy({ a: 1, b: 2 } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				delete obj.a

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ b: 2 })
			})

			test("delete nested key", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				delete obj.a.b

				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: {} })
			})
		})

		// no array ops yet
		describe.skip("arrays", () => {
			test("push item", async () => {
				let obj = proxy([1, 2, 3] as any[])
				let doc = new Loro()

				bind(obj, doc)

				obj.push(4)
				await wait(10)

				expect(doc.getList("root").toJSON()).toEqual([1, 2, 3, 4])
			})

			test("unshift item", async () => {
				let obj = proxy([1, 2, 3] as any[])
				let doc = new Loro()

				bind(obj, doc)

				obj.unshift(0)
				await wait(10)

				expect(doc.getList("root").toJSON()).toEqual([0, 1, 2, 3])
			})

			test("delete item", async () => {
				let obj = proxy([1, 2, 3] as any[])
				let doc = new Loro()

				bind(obj, doc)
				await wait(10)

				obj.splice(1, 1)
				await wait(10)

				expect(doc.getList("root").toJSON()).toEqual([1, 3])
			})
		})
	})

	describe("document -> proxy", () => {
		describe("updates", () => {
			test("can apply remote document changes", async () => {
				let obj = proxy({ a: 1 } as Record<string, any>)
				let docA = new Loro()

				bind(obj, docA)

				let docB = new Loro()
				docB.import(docA.exportFrom())

				docB.getMap("root").set("a", 2)
				docB.commit()
				docA.import(docB.exportFrom())

				await wait(10)

				expect(obj).toEqual({ a: 2 })
			})
		})

		describe("maps", () => {
			test("add top-level key", async () => {
				let obj = proxy({} as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)

				doc.getMap("root").set("a", 1)
				doc.commit()
				await wait(10)

				expect(obj).toEqual({ a: 1 })
			})

			test("add nested key", async () => {
				let obj = proxy({ a: { b: 1 } } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)
				;(doc.getByPath("root/a") as LoroMap).set("c", 2)

				doc.commit()
				await wait(10)

				expect(obj).toEqual({ a: { b: 1, c: 2 } })
			})

			test.skip("add nested key - array", async () => {
				let obj = proxy({ a: {} } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)
				let list = new LoroMovableList()
				list.push(1)
				;(doc.getByPath("root/a") as LoroMap).setContainer("b", list)

				doc.commit()
				await wait(10)

				expect(obj).toEqual({ a: { b: [1] } })
			})

			test.skip("add nested key - object", async () => {
				let obj = proxy({ a: {} } as Record<string, any>)
				let doc = new Loro()

				bind(obj, doc)
				let map = new LoroMap()
				map.set("c", 2)
				;(doc.getByPath("root/a") as LoroMap).setContainer("b", map)

				doc.commit()
				await wait(10)

				expect(obj).toEqual({ a: { b: { c: 2 } } })
			})
		})

		describe("undo-redo", () => {
			test("can undo object edits", async () => {
				let obj = proxy({ a: 1 } as Record<string, any>)
				let doc = new Loro()
				let undoManager = new UndoManager(doc, {
					mergeInterval: 0, // dont wait to apply updates
				})

				bind(obj, doc)

				obj.a = 2
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 2 })

				obj.a = 3
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 3 })

				undoManager.undo()
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 2 })
				expect(obj.a).toBe(2)

				undoManager.undo()
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 1 })
				expect(obj.a).toBe(1)
			})

			test("can redo object edits", async () => {
				let obj = proxy({ a: 1, b: 3 } as Record<string, any>)
				let doc = new Loro()
				let undoManager = new UndoManager(doc, {
					mergeInterval: 0, // dont wait to apply updates
				})

				bind(obj, doc)

				obj.a = 2
				obj.b = 3
				await wait(10)

				undoManager.undo()
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 1, b: 3 })

				undoManager.redo()
				await wait(10)

				expect(doc.getMap("root").toJSON()).toEqual({ a: 2, b: 3 })
			})
		})
	})
})
