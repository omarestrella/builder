export { default as useSWR } from "swr"

export const fetcher = (...args: unknown[]) =>
	// @ts-expect-error this is fine
	fetch(...args).then((res) => {
		if (res.ok) return res.json()
		return res.text().then((data) => Promise.reject(data))
	})
