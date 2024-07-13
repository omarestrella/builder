import { fetcher, useSWR } from "./swr"

export function useCurrentSession() {
	return useSWR("/api/users/session", fetcher)
}
