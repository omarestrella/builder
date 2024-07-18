CREATE TABLE `project_screenshot` (
	`id` integer PRIMARY KEY NOT NULL,
	`project_id` integer NOT NULL,
	`location` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `refresh_token` (
	`token` text,
	`user_id` integer PRIMARY KEY NOT NULL,
	`expires_at` integer
);
--> statement-breakpoint
DROP TABLE `login_token`;