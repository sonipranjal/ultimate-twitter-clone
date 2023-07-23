"use client";

import React, { useContext, useEffect, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useSupabase } from "@/app/supabase-provider";
import { toast } from "sonner";

type ProfileAvatarProps = {
  username?: string;
};

const ProfileAvatar = ({ username }: ProfileAvatarProps) => {
  const [profileImage, setProfileImage] = useState("");

  const { supabase } = useSupabase();

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data.user?.id) {
        const filePath = `public/${res.data.user?.id}`;

        const {
          data: { publicUrl },
        } = supabase.storage.from("avatars").getPublicUrl(filePath);

        setProfileImage(publicUrl);
      }
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const uploadAvatar = async (file: File | null) => {
    if (file) {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        return toast.error("please sign in");
      }
      console.log(data.user.user_metadata.username, username);
      if (data.user.user_metadata.username !== username) {
        return toast.error("you can only change your profile pic");
      }

      setProfileImage(URL.createObjectURL(file));

      const filePath = `public/${data.user.id}`;

      await supabase.storage.from("avatars").remove([filePath]);

      const { data: uploadedRes, error: UploadError } = await supabase.storage
        .from("avatars")
        .upload(filePath, file);

      if (UploadError) {
        return toast.error(UploadError.message);
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(filePath);

      setProfileImage(publicUrl);
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
        <input
          type="file"
          name="user-avatar"
          id="user-avatar"
          className="invisible absolute"
          accept="image/jpeg,image/png,image/jpg,image/gif"
          onChange={(e) => uploadAvatar(e.target.files && e.target.files[0])}
        />
        <label htmlFor="user-avatar" className="cursor-pointer">
          <Avatar>
            {profileImage !== "" ? (
              <AvatarImage
                src={profileImage}
                alt={`@${username}`}
                className="object-cover bg-center"
              />
            ) : (
              <AvatarImage
                src={""}
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
