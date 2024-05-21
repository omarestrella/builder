import { throttle } from "lodash"
import { useCallback, useEffect, useRef } from "react"

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ThrottleFunction<T> = (...args: T[]) => void

export function useThrottle<Arg>(
	fn: ThrottleFunction<Arg>,
	delay: number,
	leading?: boolean,
) {
	let throttleFnRef = useRef<ReturnType<
		typeof throttle<ThrottleFunction<Arg>>
	> | null>(null)

	useEffect(() => {
		throttleFnRef.current = throttle(fn, delay, {
			leading,
		})

		return () => {
			throttleFnRef.current?.cancel()
		}
	}, [delay, leading, fn])

	return useCallback((...args: Arg[]) => {
		throttleFnRef.current?.(...args)
	}, [])
}
