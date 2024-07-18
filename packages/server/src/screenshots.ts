import { launch } from "@astral/astral"
import { S3Client } from "@bradenmacdonald/s3-lite-client"

import { db } from "./database/db.ts"
import { project, projectScreenshot } from "./database/schema.ts"
import { Logger } from "./logger.ts"

const s3client = new S3Client({
	endPoint: "s3.us-west-001.backblazeb2.com",
	port: 443,
	useSSL: true,
	region: "us-west-1",
	bucket: "app-builder",
	accessKey: Deno.env.get("S3_ACCESS_KEY")!,
	secretKey: Deno.env.get("S3_SECRET_KEY")!,
	pathStyle: false,
})

const logger = new Logger("Screenshots")

export function startJob() {
	Deno.cron("screenshot projects", { minute: { every: 30 } }, async () => {
		logger.log("Starting screenshots")

		let browser = await launch({
			headless: false,
			product: "chrome",
		})

		let projectIDs = (await db.select({ id: project.id }).from(project)).map(
			(p) => p.id,
		)

		let page = await browser.newPage("http://localhost:5173")
		await page.setViewportSize({ width: 1200, height: 900 })

		for (let projectID of projectIDs) {
			logger.log("Taking screenshot of project", projectID)

			await page.setCookies([
				{
					name: "accessToken",
					domain: "http://localhost:5173",
					path: "/",
					secure: false,
					httpOnly: true,
					expires: Date.now() + 1000 * 60 * 60 * 24,
					priority: "High",
					session: true,
					size: 1,
					sameSite: "Lax",
					sourcePort: -1,
					sourceScheme: "Unset",
					sameParty: false,
					value: Deno.env.get("SCREENSHOTS_ACCESS_TOKEN")!,
				},
			])

			let screenshot = await page.screenshot()
			await Deno.writeFile(
				`${import.meta.dirname}/${projectID}.png`,
				screenshot,
				{
					create: true,
				},
			)
			await s3client.putObject(`projects/${projectID}.png`, screenshot)

			let object = await s3client.getObject(`projects/${projectID}.png`)
			await db
				.insert(projectScreenshot)
				.values({
					projectID: projectID,
					location: object.url,
				})
				.onConflictDoNothing()
		}

		await browser.close()
	})
}
