import Tweet from "@/components/client-components/tweet";
import { db } from "@/lib/db";
import { likes, profiles, replies, tweets } from "@/lib/db/schema";
import React from "react";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { and, eq, exists } from "drizzle-orm";
import { getTweets } from "@/lib/supabase/queries";
import { BsDot, BsThreeDots } from "react-icons/bs";

const TweetPage = async ({ params }: { params: { id: string } }) => {
  const supabaseClient = createServerComponentSupabaseClient({
    cookies,
    headers,
  });

  const { data: userData, error: userError } =
    await supabaseClient.auth.getUser();

  const tweet = await getTweets(userData.user?.id, params.id);

  const repliesRes = await db.query.replies.findMany({
    with: {
      profile: true,
    },
    where: eq(replies.tweetId, params.id),
  });

  return (
    <main className="flex w-full h-full min-h-screen flex-col border-l-[0.5px] border-r-[0.5px] border-gray-600">
      {tweet ? (
        <Tweet
          hasLiked={Boolean(tweet[0].hasLiked)}
          likesCount={tweet[0].likes.length ?? 0}
          tweet={{
            tweetDetails: tweet[0].tweet,
            userProfile: tweet[0].profile,
          }}
          currentUserId={userData.user?.id}
        />
      ) : (
        <div>no tweet found</div>
      )}
      {repliesRes.map((reply) => (
        <div
          key={reply.id}
          className="border-b-[0.5px]  border-gray-600 p-2 flex space-x-4 w-full"
        >
          <div>
            <div className="w-10 h-10 bg-slate-200 rounded-full" />
          </div>
          <div className="flex flex-col w-full">
            <div className="flex items-center w-full justify-between">
              <div className="flex items-center space-x-1 w-full">
                <div className="font-bold">{reply.profile.fullName ?? ""}</div>
                <div className="text-gray-500">@{reply.profile.username}</div>
                <div className="text-gray-500">
                  <BsDot />
                </div>
              </div>
              <div>
                <BsThreeDots />
              </div>
            </div>
            <div className="text-white text-base w-full transition-all">
              {reply.text}
            </div>
          </div>
        </div>
      ))}
    </main>
  );
};

export default TweetPage;
