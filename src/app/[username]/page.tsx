import ProfileAvatar from "@/components/client-components/profile-avatar";
import Tweet from "@/components/client-components/tweet";
import { getTweets } from "@/lib/supabase/queries";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";

import React from "react";

const UserProfilePage = async ({
  params,
}: {
  params: { username: string };
}) => {
  const supabaseClient = createServerComponentSupabaseClient({
    cookies,
    headers,
  });

  const { data: userData, error: userError } =
    await supabaseClient.auth.getUser();

  const getUserTweets = await getTweets({
    currentUserID: userData.user?.id,
    profileUsername: params.username,
  });

  // useEffect(() => {
  //   supabase.auth.getUser().then((res) => {
  //     if (res.data.user?.id) {
  //       const filePath = `public/${res.data.user?.id}`;

  //       const {
  //         data: { publicUrl },
  //       } = supabase.storage.from("avatars").getPublicUrl(filePath);

  //       setProfileImage(publicUrl);
  //     }
  //   });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);
  return (
    <main className="flex w-full  h-full min-h-screen flex-col border-l-[0.5px] border-r-[0.5px] border-gray-600">
      <div className="flex flex-col font-bold p-6 backdrop-blur bg-black/10 sticky top-0">
        <ProfileAvatar
          username={params.username}
          avatarUrl={getUserTweets ? getUserTweets[0].profile.avatarUrl : null}
        />
        <h1 className="text-lg">
          {userData.user?.user_metadata?.username || "Profile"}
        </h1>
        <div className="text-xs text-gray-400">
          {getUserTweets?.length || 0} Tweets
        </div>
      </div>
      <div className="w-full">
        {getUserTweets &&
          getUserTweets.map(({ likes, tweet, profile, hasLiked, replies }) => {
            return (
              <Tweet
                key={tweet.id}
                tweet={{
                  tweetDetails: {
                    ...tweet,
                  },
                  userProfile: {
                    ...profile,
                  },
                }}
                likesCount={likes.length}
                currentUserId={userData.user?.id}
                hasLiked={hasLiked}
                repliesCount={replies.length}
              />
            );
          })}
      </div>
    </main>
  );
};

export default UserProfilePage;
