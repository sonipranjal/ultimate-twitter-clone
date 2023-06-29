"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { createBrowserSupabaseClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

import type { SupabaseClient, User } from "@supabase/auth-helpers-nextjs";
import type { Database } from "@/lib/supabase.types";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Toaster, toast } from "sonner";

type SupabaseContext = {
  supabase: SupabaseClient<Database>;
};

export const Context = createContext<SupabaseContext | undefined>(undefined);

export default function SupabaseProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [user, setUser] = useState<User | null>(null);
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);

  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [fullName, setFullName] = useState("");

  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(() => {
      router.refresh();
    });

    supabase.auth.getSession().then((res) => {
      if (!res.data.session) {
        setIsOpen(true);
        return;
      }
      setUser(res.data.session.user);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [router, supabase]);

  return (
    <Context.Provider value={{ supabase }}>
      <>
        <Toaster />
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogContent className="p-6">
            <h3 className="text-lg my-1">Please sign in to continue</h3>
            <form
              onSubmit={async (e) => {
                e.preventDefault();

                setIsLoading(true);

                // first check if the username exists or not
                const { data, error } = await supabase
                  .from("profiles")
                  .select()
                  .eq("username", username.trim());

                if (data && data?.length > 0) {
                  return toast.error(
                    "username already exists, please use another"
                  );
                }

                const { data: signUpData, error: signUpError } =
                  await supabase.auth.signInWithOtp({
                    email: email.trim(),
                    options: {
                      data: {
                        username,
                        full_name: fullName,
                      },
                    },
                  });

                if (signUpError) {
                  return toast.error(signUpError.message);
                }
                toast.success("magic link sent successfully");
                setIsLoading(false);
              }}
            >
              <Input
                type="email"
                placeholder="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Input
                type="text"
                placeholder="username"
                min={3}
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="my-2"
              />
              <Input
                type="text"
                placeholder="your name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="my-2"
              />
              <p className="text-sm text-gray-900 my-2">
                you will receive a login magic link!
              </p>
              <div className="flex w-full justify-end">
                <Button disabled={isLoading}>Login</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
        {children}
      </>
    </Context.Provider>
  );
}

export const useSupabase = () => {
  const context = useContext(Context);

  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider");
  }

  return context;
};
