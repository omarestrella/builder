import { pack, unpack } from "msgpackr"
import { z } from "zod"

export type Messages = {
	// Server
	sync(data: Uint8Array): void
	connected(data: Uint8Array): void

	// Client
	update(updates: number[]): void
	connect(email: string, documentID: string): void
}

export const ServerMessage = z.discriminatedUnion("type", [
	z.object({ type: z.literal("sync"), data: z.instanceof(Uint8Array) }),
	z.object({ type: z.literal("connected"), data: z.instanceof(Uint8Array) }),
])
export type ServerMessage = z.infer<typeof ServerMessage>

export const ClientMessage = z.discriminatedUnion("type", [
	z.object({ type: z.literal("update"), updates: z.instanceof(Uint8Array) }),
	z.object({
		type: z.literal("connect"),
		userID: z.string(),
		documentID: z.string(),
	}),
])
export type ClientMessage = z.infer<typeof ClientMessage>

const Message = z.union([ClientMessage, ServerMessage])
export type Message = z.infer<typeof Message>

export type MessageType = Message["type"]
export type MessageData<T extends MessageType> = Omit<
	Extract<Message, { type: T }>,
	"type"
>

function encodeMessage<M extends Message, T extends M["type"]>(
	type: T,
	data: MessageData<T>,
) {
	return pack({
		type,
		...data,
	})
}

export function encodeClientMessage<T extends ClientMessage["type"]>(
	type: T,
	data: MessageData<T>,
) {
	return encodeMessage<ClientMessage, T>(type, data)
}

export function encodeServerMessage<T extends ServerMessage["type"]>(
	type: T,
	data: MessageData<T>,
) {
	return encodeMessage<ServerMessage, T>(type, data)
}

export function decodeMessage(message: Uint8Array): Message {
	let unpacked = unpack(message)
	return Message.parse(unpacked)
}
