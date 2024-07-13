import { fetcher, useSWR } from "./swr"

export function useProject(id: string) {
	return useSWR(`/api/projects/${id}`, fetcher)
}

export function useProjects() {
	return useSWR("/api/projects", fetcher)
}
