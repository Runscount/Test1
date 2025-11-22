import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Hero Section */}
      <section className="flex flex-1 flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white px-4 py-20">
        <div className="container mx-auto max-w-4xl text-center">
          <h1 className="mb-6 text-5xl font-bold tracking-tight text-gray-900 sm:text-6xl">
            RunScout
          </h1>
          <p className="mb-8 text-xl text-gray-600 sm:text-2xl">
            Discover safe & fun running routes in Chicago
          </p>
          <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link href="/routes">
              <Button size="lg">Explore routes</Button>
            </Link>
            <Link href="/auth/login">
              <Button variant="outline" size="lg">
                Log in
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Scoring Dimensions Section */}
      <section className="bg-white px-4 py-16">
        <div className="container mx-auto max-w-6xl">
          <h2 className="mb-8 text-center text-3xl font-bold text-gray-900">
            How We Score Routes
          </h2>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader>
                <CardTitle>Safety</CardTitle>
                <CardDescription>
                  Based on lighting, traffic, and crime statistics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Routes are scored 0-100 based on safety factors including
                  lighting, pedestrian infrastructure, and local safety data.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Weather Comfort</CardTitle>
                <CardDescription>
                  Protection from wind, sun, and elements
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  How well the route protects you from harsh weather conditions
                  like strong winds, direct sun exposure, or heavy rain.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Scenic</CardTitle>
                <CardDescription>
                  Visual appeal and interesting landmarks
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Routes with beautiful views, interesting architecture, parks,
                  or natural features score higher.
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Popularity</CardTitle>
                <CardDescription>
                  How often other runners use this route
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  Popular routes are often safer and more enjoyable, with more
                  people around and better maintenance.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </div>
  );
}
