import { debounce } from "lodash"
import { useCallback, useEffect, useRef } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type DebounceFunction<T> = (...args: T[]) => void

export function useDebounce<Arg>(fn: DebounceFunction<Arg>, delay: number) {
	let debouncedFnRef = useRef<ReturnType<
		typeof debounce<DebounceFunction<Arg>>
	> | null>(null)

	useEffect(() => {
		debouncedFnRef.current = debounce(fn, delay)

		return () => {
			debouncedFnRef.current?.cancel()
		}
	}, [delay, fn])

	return useCallback((...args: Arg[]) => {
		debouncedFnRef.current?.(...args)
	}, [])
}
