"use server";

import { Database } from "../supabase.types";
import { supabaseServer } from ".";
import { db } from "../db";
import {
  Like,
  Profile,
  Tweet,
  likes,
  profiles,
  tweets,
  tweetsReplies,
} from "../db/schema";
import { and, desc, eq, exists } from "drizzle-orm";

export type TweetType = Database["public"]["Tables"]["tweets"]["Row"] & {
  profiles: Pick<
    Database["public"]["Tables"]["profiles"]["Row"],
    "full_name" | "username"
  >;
};

export const getTweets = async ({
  currentUserID,
  getSingleTweetId,
  limit,
  orderBy,
  replyId,
  profileUsername,
}: {
  currentUserID?: string;
  getSingleTweetId?: string;
  orderBy?: boolean;
  limit?: number;
  replyId?: string;
  profileUsername?: string;
}) => {
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
        tweetsReplies,
      })
      .from(tweets)
      .where(eq(tweets.isReply, Boolean(replyId)))
      .leftJoin(likes, eq(tweets.id, likes.tweetId))
      .leftJoin(tweetsReplies, eq(tweets.id, tweetsReplies.replyId))
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

    if (replyId) {
      query = query.where(eq(tweets.replyId, replyId));
    }

    if (profileUsername) {
      query = query.where(
        and(eq(profiles.username, profileUsername), eq(tweets.isReply, false))
      );
    }

    const rows = await query;

    if (rows) {
      const result = rows.reduce<
        Record<
          string,
          {
            tweet: Tweet;
            likes: Like[];
            profile: Profile;
            hasLiked: boolean;
            replies: Tweet[];
          }
        >
      >((acc, row) => {
        const tweet = row.tweets;
        const like = row.likes;
        const profile = row.profiles;
        const hasLiked = Boolean(row.hasLiked);
        const reply = row.tweetsReplies;

        if (!acc[tweet.id]) {
          acc[tweet.id] = {
            tweet,
            likes: [],
            profile,
            hasLiked,
            replies: [],
          };
        }

        if (like) {
          acc[tweet.id].likes.push(like);
          const ids = acc[tweet.id].likes.map(({ id }) => id);
          const filteredLikesArr = acc[tweet.id].likes.filter(
            ({ id }, index) => !ids.includes(id, index + 1)
          );
          acc[tweet.id].likes = filteredLikesArr;
        }

        if (reply) {
          acc[tweet.id].replies.push(reply);
          const ids = acc[tweet.id].replies.map(({ id }) => id);
          const filteredRepliesArr = acc[tweet.id].replies.filter(
            ({ id }, index) => !ids.includes(id, index + 1)
          );
          acc[tweet.id].replies = filteredRepliesArr;
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
