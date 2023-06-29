import React from "react";
import { createServerComponentSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { cookies, headers } from "next/headers";
import { randomUUID } from "crypto";
import { SupabaseClient } from "@supabase/supabase-js";

import { revalidatePath } from "next/cache";
import ComposeTweetForm from "../client-components/compose-tweet-form";
import { db } from "@/lib/db";
import { tweets } from "@/lib/db/schema";

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

    let err = "";

    const res = await db
      .insert(tweets)
      .values({
        text: tweet.toString(),
        id: randomUUID(),
        profileId: userData.user.id,
      })
      .returning()
      .catch((error) => {
        console.log(error);
        err = "something wrong with server";
      });

    revalidatePath("/");

    return { data: res, error: err };
  }

  return <ComposeTweetForm serverAction={submitTweet} />;
};

export default ComposeTweet;
