import equal from "fast-deep-equal"
import { Loro, LoroMap, LoroMovableList } from "loro-crdt"
import { getVersion, type proxy, subscribe } from "valtio"

const isObject = (x: unknown): x is Record<string, unknown> =>
	typeof x === "object" &&
	x !== null &&
	getVersion(x) !== undefined &&
	!Array.isArray(x)

const isArray = (x: unknown): x is unknown[] =>
	Array.isArray(x) && getVersion(x) !== undefined

const isPrimitiveValue = (v: unknown): v is number | boolean | string =>
	v != null &&
	(typeof v === "number" || typeof v === "boolean" || typeof v === "string")

function getNestedDocumentValue(path: string[], doc: Loro, obj: object) {
	let currentValue = isArray(obj)
		? doc.getMovableList("root")
		: doc.getMap("root")
	if (
		currentValue == null ||
		isPrimitiveValue(currentValue) ||
		path.length === 0
	) {
		return currentValue
	}

	for (let i = 0; i < path.length; i++) {
		let key = path[i]

		if (currentValue instanceof LoroMap) {
			currentValue = currentValue.get(key) as LoroMap | LoroMovableList
		} else if (currentValue instanceof LoroMovableList) {
			currentValue = currentValue.get(Number(key)) as LoroMap | LoroMovableList
		} else {
			return currentValue // primitive, or undefined
		}
	}
	return currentValue
}

function getNestedObjectValue<T extends object>(path: string[], obj: T) {
	let currentValue: unknown = obj
	for (let i = 0; i < path.length; i++) {
		let key = path[i]
		if (currentValue == null) {
			return undefined
		}
		currentValue = (currentValue as never)[key] as unknown
	}
	return currentValue
}

function toDocumentValue(data: unknown) {
	if (isObject(data)) {
		let map = new LoroMap()
		Object.entries(data).forEach(([key, value]) => {
			if (isPrimitiveValue(value)) {
				map.set(key, value)
			} else {
				let docValue = toDocumentValue(value)
				if (docValue) {
					map.setContainer(key, docValue)
				}
			}
		})
		return map
	} else if (isArray(data)) {
		let list = new LoroMovableList()
		data.forEach((item, idx) => {
			if (isPrimitiveValue(item)) {
				list.push(item)
			} else {
				let docValue = toDocumentValue(item)
				if (docValue) {
					list.insertContainer(idx, docValue)
				}
			}
		})
		return list
	}

	return undefined
}

function initializeDocument<T>(proxyObj: T, doc: Loro) {
	if (isObject(proxyObj)) {
		let tree = doc.getMap("root")
		Object.entries(proxyObj).forEach(([key, value]) => {
			if (isPrimitiveValue(value)) {
				tree.set(key, value)
			} else {
				let docValue = toDocumentValue(value)
				if (docValue) {
					tree.setContainer(key, docValue)
				}
			}
		})
	}
	if (isArray(proxyObj)) {
		let tree = doc.getMovableList("root")
		proxyObj.forEach((item, idx) => {
			if (isPrimitiveValue(item)) {
				tree.push(item)
			} else {
				let docValue = toDocumentValue(item)
				if (docValue) {
					tree.insertContainer(idx, docValue)
				}
			}
		})
	}

	doc.commit(Origin.Initialize)
}

export function bind<T extends object>(
	obj: ReturnType<typeof proxy<T>>,
	doc: Loro,
) {
	if (!isObject(obj) && !isArray(obj)) {
		throw new Error("proxy must be object or array")
	}

	initializeDocument(obj, doc)

	let unsubscribe = subscribe(obj, (ops) => {
		ops.forEach(([operation, path, value, _prevValue]) => {
			switch (operation) {
				case "set": {
					let parentPath = path.slice(0, -1) as string[]
					let key = path.at(-1) as string
					let parentDocumentValue = getNestedDocumentValue(parentPath, doc, obj)

					if (parentDocumentValue instanceof LoroMap) {
						let currentDocumentValue = parentDocumentValue.get(key)
						if (!equal(currentDocumentValue, value)) {
							// TODO: figure out a clean way to handle node class instances,
							// so proxy references are handled in-place
							let safeValue = value
							if (
								value &&
								typeof value === "object" &&
								value.constructor.toString().includes("class")
							) {
								safeValue = Object.entries(value as never).reduce(
									(acc, [key, value]) => {
										acc[key] = isPrimitiveValue(value)
											? value
											: toDocumentValue(value)
										return acc
									},
									{} as Record<string, unknown>,
								)
							}

							parentDocumentValue.set(key, safeValue)
						}
					} else if (parentDocumentValue instanceof LoroMovableList) {
						let idx = Number(key)
						if (!Number.isFinite(idx)) return

						let currentDocumentValue = parentDocumentValue.get(idx)
						if (!currentDocumentValue) {
							parentDocumentValue.insert(idx, value)
						} else if (!equal(currentDocumentValue, value)) {
							parentDocumentValue.set(idx, value)
						}
					}

					break
				}
				case "delete": {
					let parentPath = path.slice(0, -1) as string[]
					let key = path.at(-1) as string
					let parentDocumentValue = getNestedDocumentValue(parentPath, doc, obj)

					if (parentDocumentValue instanceof LoroMap) {
						parentDocumentValue.delete(key)
					} else if (parentDocumentValue instanceof LoroMovableList) {
						throw new Error("No delete list ops yet")
					}

					break
				}
				default: {
					throw new Error("Unhandled operation type: " + operation)
				}
			}
		})
		doc.commit(Origin.Sync)
	})

	let subID = doc.subscribe((event) => {
		if (event.origin === "undo" || event.origin === "redo") {
			event.events.forEach((event) => {
				let path = event.path.slice(1).map((s) => s.toString()) // remove "root"
				let data = getNestedObjectValue(path, obj)
				if (isObject(data) && event.diff.type === "map") {
					Object.entries(event.diff.updated).forEach(([key, value]) => {
						data[key] = value
					})
				} else if (isArray(data) && event.diff.type === "list") {
					throw new Error("No list ops yet")
				}
			})
		} else if (!event.origin) {
			// this is probably the same as undo/redo?
			event.events.forEach((event) => {
				let path = event.path.slice(1).map((s) => s.toString()) // remove "root"
				let data = getNestedObjectValue(path, obj)
				if (isObject(data) && event.diff.type === "map") {
					Object.entries(event.diff.updated).forEach(([key, value]) => {
						data[key] = value
					})
				} else if (isArray(data) && event.diff.type === "list") {
					throw new Error("No list ops yet")
				}
			})
		}
	})

	return () => {
		unsubscribe()
		doc.unsubscribe(subID)
	}
}

export const Origin = {
	Initialize: "initialize",
	Sync: "sync",
	User: "user",
	System: "system",
} as const
export type Origin = (typeof Origin)[keyof typeof Origin]
