CREATE INDEX IF NOT EXISTS "modules_user_id_idx" ON "modules" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "modules_last_visited_idx" ON "modules" USING btree ("last_visited");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "modules_user_last_visited_idx" ON "modules" USING btree ("user_id","last_visited");--> statement-breakpoint
CREATE INDEX IF NOT EXISTS "modules_archived_idx" ON "modules" USING btree ("archived");