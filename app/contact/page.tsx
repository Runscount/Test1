"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function ContactPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] bg-gradient-hero px-4 py-12">
      <div className="container mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
            Contact us
          </h1>
          <p className="mt-3 text-base text-muted-foreground">
            Have a question or feedback? Send us a note and we&apos;ll follow up
            soon.
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Send a message</CardTitle>
            <CardDescription>
              We read every message and respond within 1-2 business days.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form
              className="space-y-4"
              onSubmit={(event) => {
                event.preventDefault();
                alert("Thanks, we\u2019ll get back to you.");
              }}
            >
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="name">
                  Name
                </label>
                <Input id="name" name="name" placeholder="Your name" required />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="email">
                  Email
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-foreground" htmlFor="message">
                  Message
                </label>
                <textarea
                  id="message"
                  name="message"
                  rows={5}
                  required
                  className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm text-foreground shadow-soft transition-colors placeholder:text-muted-foreground focus-visible:border-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40"
                  placeholder="How can we help?"
                />
              </div>
              <Button type="submit" className="w-full">
                Submit
              </Button>
              <p className="text-xs text-muted-foreground">
                We respect your privacy and will only use your message to reply.
              </p>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
