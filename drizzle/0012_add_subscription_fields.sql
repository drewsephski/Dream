ALTER TABLE `apps` ADD `subscription_id` text;--> statement-breakpoint
ALTER TABLE `apps` ADD `subscription_status` text;--> statement-breakpoint
ALTER TABLE `apps` ADD `subscription_tier` text DEFAULT 'free';