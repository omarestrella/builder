import { createClient } from "@libsql/client"
import { sql } from "drizzle-orm"
import { drizzle } from "drizzle-orm/libsql"
import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts"

import * as schema from "./schema.ts"

const env = await load()

export { sql }

const client = createClient({
	url: env["DATABASE_URL"]!,
	authToken: env["DATABASE_TOKEN"],
})

export const db = drizzle(client, {
	schema,
})
