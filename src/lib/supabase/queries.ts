"use server";

import { Database } from "../supabase.types";
import { supabaseServer } from ".";
import { db } from "../db";
import { Like, Profile, Tweet, likes, profiles, tweets } from "../db/schema";
import { and, desc, eq, exists, sql } from "drizzle-orm";

export type TweetType = Database["public"]["Tables"]["tweets"]["Row"] & {
  profiles: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "full_name" | "username"
  >;
};

export const getTweets = async (
  currentUserID?: string,
  getSingleTweetId?: string,
  orderBy?: boolean,
  limit?: number
) => {
  try {
    let query = db
      .select({
        tweets,
        profiles,
        ...(currentUserID
          ? {
              hasLiked: exists(
                db
                  .select()
                  .from(likes)
                  .where(
                    and(
                      eq(likes.tweetId, tweets.id),
                      eq(likes.userId, currentUserID)
                    )
                  )
              ),
            }
          : {}),
        likes,
      })
      .from(tweets)
      .leftJoin(likes, eq(tweets.id, likes.tweetId))
      .innerJoin(profiles, eq(tweets.profileId, profiles.id))
      .orderBy(desc(tweets.createdAt));

    if (orderBy) {
      query = query.orderBy(desc(tweets.createdAt));
    }

    if (getSingleTweetId) {
      query = query.where(eq(tweets.id, getSingleTweetId));
    }

    if (limit) {
      query = query.limit(limit);
    }

    const rows = await query;

    if (rows) {
      const result = rows.reduce<
        Record<
          string,
          { tweet: Tweet; likes: Like[]; profile: Profile; hasLiked: boolean }
        >
      >((acc, row) => {
        const tweet = row.tweets;
        const like = row.likes;
        const profile = row.profiles;
        const hasLiked = Boolean(row.hasLiked);

        if (!acc[tweet.id]) {
          acc[tweet.id] = { tweet, likes: [], profile, hasLiked };
        }

        if (like) {
          acc[tweet.id].likes.push(like);
        }

        return acc;
      }, {});

      const data = Object.values(result);
      return data;
    }
  } catch (error) {
    console.log(error);
    // return { error: "something wrong with querying the db" };
  }
};

export const getLikesCount = async (tweetId: string) => {
  const res = await supabaseServer
    .from("likes")
    .select("id", {
      count: "exact",
    })
    .eq("tweet_id", tweetId);

  return res;
};

export const isLiked = async ({
  tweetId,
  userId,
}: {
  tweetId: string;
  userId?: string;
}) => {
  if (!userId) return false;

  const { data, error } = await supabaseServer
    .from("likes")
    .select("id")
    .eq("tweet_id", tweetId)
    .eq("user_id", userId)
    .single();

  return Boolean(data?.id);
};
