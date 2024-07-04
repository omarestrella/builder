import { useState } from "react"

export type LocalStorageKey = "doNotShowIntro"

export function useLocalStorage<T>(
	key: LocalStorageKey,
	defaultValue: T,
): [T, (value: T) => void] {
	let [value, setValue] = useState<T>(() => {
		let item = window.localStorage.getItem(key)
		if (item) {
			return JSON.parse(item)
		} else {
			return defaultValue
		}
	})

	let updateValue = (value: T) => {
		setValue(value)
		window.localStorage.setItem(key, JSON.stringify(value))
	}

	return [value, updateValue]
}
