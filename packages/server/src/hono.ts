import { Hono as BaseHono } from "hono"

import { User } from "./database/schema.ts"

export const Hono = BaseHono<{ Variables: { currentUser?: User } }>
export const HonoAPI = BaseHono<{ Variables: { currentUser: User } }>
