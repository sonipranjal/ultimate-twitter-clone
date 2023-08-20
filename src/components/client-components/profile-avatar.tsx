"use client";

import React, { useContext, useEffect, useState, useTransition } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/app/supabase-provider";
import { toast } from "sonner";
import { nanoid } from "nanoid";
import { saveNewAvatar } from "@/lib/supabase/mutation";

type ProfileAvatarProps = {
  username?: string;
  avatarUrl: string | null;
  isOnTimeline?: boolean;
};

const ProfileAvatar = ({
  username,
  avatarUrl,
  isOnTimeline = false,
}: ProfileAvatarProps) => {
  const [profileImage, setProfileImage] = useState("");

  const { supabase } = useSupabase();

  let [isMutationLoading, startTransition] = useTransition();

  const uploadAvatar = async (file: File | null) => {
    if (file) {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return toast.error("please sign in");
      }

      if (data.user.user_metadata.username !== username) {
        return toast.error("you can only change your profile pic");
      }

      setProfileImage(URL.createObjectURL(file));

      const newFilePath = `public/${data.user.id}-${nanoid()}`;

      const { data: uploadedRes, error: UploadError } = await supabase.storage
        .from("avatars")
        .upload(newFilePath, file);

      if (UploadError) {
        return toast.error(UploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(newFilePath);

      setProfileImage(publicUrl);

      startTransition(() =>
        saveNewAvatar({ publicUrl, profileId: data.user.id })
      );
    }
  };

  useEffect(() => {
    return () => {
      if (profileImage !== "") {
        URL.revokeObjectURL(profileImage);
      }
    };
  }, [profileImage]);

  return (
    <div>
      <div className="relative w-fit">
        {!isOnTimeline && (
          <input
            type="file"
            name="user-avatar"
            id="user-avatar"
            className="invisible absolute"
            accept="image/jpeg,image/png,image/jpg,image/gif"
            onChange={(e) => uploadAvatar(e.target.files && e.target.files[0])}
            disabled={isMutationLoading}
          />
        )}
        <label
          htmlFor={isOnTimeline ? "" : "user-avatar"}
          className={!isOnTimeline ? "cursor-pointer" : ""}
        >
          <Avatar>
            {profileImage !== "" ? (
              <AvatarImage
                src={profileImage}
                alt={`@${username}`}
                className="object-cover bg-center"
              />
            ) : (
              <AvatarImage
                src={avatarUrl || ""}
                alt={`@${username}`}
                className="object-cover bg-center"
              />
            )}
            <AvatarFallback>
              {username
                ? `${username[0]} ${username[username.length - 1]}`
                : ""}
            </AvatarFallback>
          </Avatar>
        </label>
      </div>
    </div>
  );
};

export default ProfileAvatar;
