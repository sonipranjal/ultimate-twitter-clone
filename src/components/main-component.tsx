import ComposeTweet from "./server-components/compose-tweet";

import { getTweets } from "@/lib/supabase/getTweets";
import Tweet from "./client-components/tweet";

const MainComponent = async () => {
  const res = await getTweets();

  return (
    <main className="flex w-full h-full min-h-screen flex-col border-l-[0.5px] border-r-[0.5px] border-gray-600">
      <h1 className="text-xl font-bold p-6 backdrop-blur bg-black/10 sticky top-0">
        Home
      </h1>
      <div className="border-t-[0.5px] px-4 border-b-[0.5px] flex items-stretch py-6 space-x-2 border-gray-600 relative">
        <div className="w-11 h-11 bg-slate-400 rounded-full flex-none"></div>
        <ComposeTweet />
      </div>
      <div className="w-full">
        {res?.error && <div>Something wrong with the server</div>}
        {res?.data &&
          res.data.map((tweet) => <Tweet key={tweet.id} tweet={tweet} />)}
      </div>
    </main>
  );
};

export default MainComponent;
