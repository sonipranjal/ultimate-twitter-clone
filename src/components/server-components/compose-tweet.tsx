import React from "react";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

import { revalidatePath } from "next/cache";
import ComposeTweetForm from "../client-components/compose-tweet-form";

const ComposeTweet = () => {
  async function submitTweet(formData: FormData) {
    "use server";

    const tweet = formData.get("tweet");

    if (!tweet) return;

    const supabaseClient = createServerComponentSupabaseClient({
      cookies,
      headers,
    });

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseSecretKey = process.env.SUPABASE_SECRET_KEY;

    if (!supabaseUrl || !supabaseSecretKey)
      return { error: { message: "supabase credentials are not provided!" } };

    const supabaseServer = new SupabaseClient(supabaseUrl, supabaseSecretKey);

    const { data: userData, error: userError } =
      await supabaseClient.auth.getUser();

    if (userError) return;

    const { data, error } = await supabaseServer.from("tweets").insert({
      profile_id: userData.user.id,
      text: tweet.toString(),
      id: randomUUID(),
    });

    revalidatePath("/");

    return { data, error };
  }

  return <ComposeTweetForm serverAction={submitTweet} />;
};

export default ComposeTweet;
