CREATE TABLE `session` (
	`id` text PRIMARY KEY NOT NULL,
	`userId` integer NOT NULL,
	`expiresAt` integer NOT NULL,
	FOREIGN KEY (`userId`) REFERENCES `user`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `user` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`discordId` text(32) NOT NULL,
	`discordUsername` text(32) NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `user_discordId_unique` ON `user` (`discordId`);