"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import type { User } from "@supabase/supabase-js";

export function Navbar() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    router.push("/");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
      <div className="container mx-auto flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-xl font-semibold text-foreground">
          RunScout
        </Link>
        <div className="flex items-center gap-3">
          <div className="hidden items-center gap-2 md:flex">
            <a
              href="#features"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              Features
            </a>
            <a
              href="#how-it-works"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              How it works
            </a>
            <a
              href="#testimonials"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              Stories
            </a>
            <a
              href="#faq"
              className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
            >
              FAQ
            </a>
          </div>
          <Link
            href="/find"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            Find
          </Link>
          <Link
            href="/routes"
            className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
          >
            Routes
          </Link>
          {loading ? (
            <div className="h-8 w-20 animate-pulse rounded-full bg-muted" />
          ) : user ? (
            <>
              <Link
                href="/profile"
                className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition hover:bg-muted/60 hover:text-foreground"
              >
                Profile
              </Link>
              <span className="hidden text-sm text-muted-foreground md:inline">
                {user.email}
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                Log out
              </Button>
            </>
          ) : (
            <>
              <Link href="/auth/login">
                <Button variant="ghost" size="sm">
                  Log in
                </Button>
              </Link>
              <Link href="/auth/signup">
                <Button size="sm">Sign up</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}

