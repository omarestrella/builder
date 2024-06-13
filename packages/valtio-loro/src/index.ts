import { Loro, LoroList, LoroMap } from "loro-crdt"
import { getVersion, type proxy, subscribe } from "valtio"

const isObject = (x: unknown): x is Record<string, unknown> =>
	typeof x === "object" && x !== null && getVersion(x) !== undefined

const isArray = (x: unknown): x is unknown[] =>
	Array.isArray(x) && getVersion(x) !== undefined

const isPrimitiveValue = (v: unknown): v is number | boolean | string =>
	v != null &&
	(typeof v === "number" || typeof v === "boolean" || typeof v === "string")

function getNestedDocumentValue<T extends object>(
	path: string[],
	proxyObj: T,
	doc: Loro,
) {
	let currentValue: LoroMap | LoroList = doc.getMap("root")
	if (path.length === 0) {
		return currentValue
	}
	for (let i = 0; i < path.length; i++) {
		let key = path[i]

		if (currentValue instanceof LoroMap) {
			currentValue = currentValue.get(key) as LoroMap | LoroList
		} else if (currentValue instanceof LoroList) {
			currentValue = currentValue.get(Number(key)) as LoroMap | LoroList
		} else {
			return currentValue // primitive, or undefined
		}
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
		let list = new LoroList()
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
		let tree = doc.getList("root")
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
					let parentDocumentValue = getNestedDocumentValue(parentPath, obj, doc)

					if (parentDocumentValue instanceof LoroMap) {
						parentDocumentValue.set(key, value)
					} else if (parentDocumentValue instanceof LoroList) {
						// no list ops yet
						throw new Error("No list ops yet")
					}

					break
				}
				default: {
					console.log("unknown operation", operation)
				}
			}
		})
	})

	return () => {
		unsubscribe()
	}
}
