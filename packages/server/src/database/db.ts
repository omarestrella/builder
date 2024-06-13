import { load } from "https://deno.land/std@0.224.0/dotenv/mod.ts"
import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import { sql } from "drizzle-orm"

const env = await load()

export { sql }

const client = createClient({
	url: env["DATABASE_URL"]!,
	authToken: env["DATABASE_TOKEN"],
})

export const db = drizzle(client)
