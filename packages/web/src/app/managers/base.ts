import { subscribe } from "valtio"

export abstract class BaseManager<State> {
	abstract state: State

	subscribe(cb: (state: State) => void) {
		return subscribe(this.state as object, () => {
			cb(this.state)
		})
	}
}
