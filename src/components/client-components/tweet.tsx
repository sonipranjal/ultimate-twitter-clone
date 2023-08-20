"use client";

import { TweetType, getLikesCount, isLiked } from "@/lib/supabase/queries";
import { BsChat, BsDot, BsThreeDots } from "react-icons/bs";
import { AiOutlineRetweet } from "react-icons/ai";
import { IoShareOutline, IoStatsChart } from "react-icons/io5";

import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

import LikeButton from "./like-button";
import { Profile, Tweet } from "@/lib/db/schema";

import ReplyDialog from "./reply-dialog";
import { useRouter } from "next/navigation";
import ProfileAvatar from "./profile-avatar";

dayjs.extend(relativeTime);

type TweetProps = {
  tweet: {
    userProfile: Profile;
    tweetDetails: Tweet;
  };
  currentUserId?: string;
  likesCount: number;
  hasLiked: boolean;
  repliesCount: number;
};

const Tweet = async ({
  tweet,
  likesCount,
  hasLiked,
  repliesCount,
}: TweetProps) => {
  const router = useRouter();

  return (
    <>
      <div className="border-b-[0.5px]  border-gray-600 p-2 flex space-x-4 w-full">
        <div>
          <ProfileAvatar
            username={tweet.userProfile.username}
            avatarUrl={tweet.userProfile.avatarUrl}
            isOnTimeline={true}
          />
        </div>
        <div className="flex flex-col w-full">
          <div className="flex items-center w-full justify-between">
            <div className="flex items-center space-x-1 w-full">
              <div className="font-bold">
                {tweet.userProfile.fullName ?? ""}
              </div>
              <div className="text-gray-500">@{tweet.userProfile.username}</div>
              <div className="text-gray-500">
                <BsDot />
              </div>
              <div className="text-gray-500">
                {dayjs(tweet.tweetDetails.createdAt).fromNow()}
              </div>
            </div>
            <div>
              <BsThreeDots />
            </div>
          </div>
          <div
            onClick={() => {
              router.push(`/tweet/${tweet.tweetDetails.id}`);
            }}
            className="text-white text-base w-full cursor-pointer hover:bg-white/5 transition-all"
          >
            {tweet.tweetDetails.text}
          </div>
          {/* <div className="bg-slate-400 aspect-square w-full h-80 rounded-xl mt-2"></div> */}
          <div className="flex items-center justify-start space-x-20 mt-2 w-full">
            <ReplyDialog tweet={tweet} repliesCount={repliesCount} />
            <div className="rounded-full hover:bg-white/10 transition duration-200 p-3 cursor-pointer">
              <AiOutlineRetweet />
            </div>
            <LikeButton
              tweetId={tweet.tweetDetails.id}
              likesCount={likesCount}
              isUserHasLiked={hasLiked}
            />
            <div className="rounded-full hover:bg-white/10 transition duration-200 p-3 cursor-pointer">
              <IoStatsChart />
            </div>
            <div className="rounded-full hover:bg-white/10 transition duration-200 p-3 cursor-pointer">
              <IoShareOutline />
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Tweet;
