"use server";

import { SupabaseClient } from "@supabase/supabase-js";
import { Database } from "../supabase.types";
import { randomUUID } from "crypto";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

export type TweetType = Database["public"]["Tables"]["tweets"]["Row"] & {
  profiles: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "full_name" | "username"
  >;
};

export const getTweets = async () => {
  if (supabaseUrl && supabaseSecretKey) {
    const supabaseServer = new SupabaseClient(supabaseUrl, supabaseSecretKey);

    return await supabaseServer
      .from("tweets")
      .select(
        `
      *,
      profiles (
        full_name,
        username
      )
      `
      )
      .returns<TweetType[]>();
  }
};

export const likeTweet = async ({
  tweetId,
  userId,
}: {
  tweetId: string;
  userId: string;
}) => {
  if (supabaseUrl && supabaseSecretKey) {
    const supabaseServer = new SupabaseClient<Database>(
      supabaseUrl,
      supabaseSecretKey
    );

    const { data, error } = await supabaseServer.from("likes").insert({
      id: randomUUID(),
      tweet_id: tweetId,
      user_id: userId,
    });

    console.log({ data, error });
  }
};
