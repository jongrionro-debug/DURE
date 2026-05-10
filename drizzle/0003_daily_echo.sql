ALTER TABLE "participants" ADD COLUMN "village_id" uuid;--> statement-breakpoint
UPDATE "participants"
SET "village_id" = "classes"."village_id"
FROM "classes"
WHERE "participants"."class_id" = "classes"."id"
  AND "participants"."village_id" IS NULL;--> statement-breakpoint
ALTER TABLE "participants" ADD CONSTRAINT "participants_village_id_villages_id_fk" FOREIGN KEY ("village_id") REFERENCES "public"."villages"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "participants_village_idx" ON "participants" USING btree ("village_id");
