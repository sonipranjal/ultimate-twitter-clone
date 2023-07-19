ALTER TABLE "tweets" ADD COLUMN "is_reply" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "tweets" ADD COLUMN "reply_id" uuid;--> statement-breakpoint
DO $$ BEGIN
 ALTER TABLE "tweets" ADD CONSTRAINT "tweets_reply_id_tweets_id_fk" FOREIGN KEY ("reply_id") REFERENCES "tweets"("id") ON DELETE no action ON UPDATE no action;
EXCEPTION
 WHEN duplicate_object THEN null;
END $$;
