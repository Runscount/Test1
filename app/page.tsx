import Link from "next/link";
import {
  ArrowRight,
  MapPin,
  Shield,
  Sparkles,
  Star,
  Target,
  Users,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { sampleRoutes } from "@/data/routes";

const featuredRoutes = sampleRoutes.slice(0, 3);

const categories = [
  {
    title: "Lakefront Loops",
    image: "/landing/hero-chicago-lakefront.jpg",
    tag: "Scenic",
  },
  {
    title: "City Highlights",
    image: "/landing/hero-chicago-route66.jpg",
    tag: "Urban",
  },
  {
    title: "Weekend Escapes",
    image: "/landing/hero-premium-lakeside.jpg",
    tag: "Relaxed",
  },
];

const testimonials = [
  {
    name: "Maya Patel",
    quote:
      "RunScout helped me discover safer routes near my neighborhood. The weather insights are spot on.",
    image: "/landing/hero-woman-runner.png",
  },
  {
    name: "Jordan Wells",
    quote:
      "I love the route scoring. It makes planning long runs feel effortless and confident.",
    image: "/landing/hero-premium-runner.jpg",
  },
  {
    name: "Luis Chen",
    quote:
      "The recommendations feel tailored to my pace and schedule. It’s like having a coach.",
    image: "/landing/hero-silhouette-runner.png",
  },
];

const faqs = [
  {
    question: "How are routes scored?",
    answer:
      "We blend safety, surface, elevation, and scenic quality into a clear score so you can choose with confidence.",
  },
  {
    question: "Does RunScout work for any distance?",
    answer:
      "Yes. Choose a distance that fits your goal and we’ll recommend routes that match your target.",
  },
  {
    question: "Can I use my current location?",
    answer:
      "Absolutely. The Find page supports geolocation and manual search to kick off your route.",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col">
      <section className="relative overflow-hidden bg-gradient-hero px-4 pb-20 pt-24 ambient-light">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full bg-muted px-4 py-2 text-sm text-muted-foreground animate-fade-in">
                <Sparkles className="h-4 w-4 text-primary" />
                Join 10,000+ runners building safer routes
              </div>
              <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl animate-fade-in">
                Find the perfect route
                <span className="block bg-gradient-primary bg-clip-text text-transparent">
                  for every run
                </span>
              </h1>
              <p className="text-base text-muted-foreground sm:text-lg animate-fade-in">
                RunScout turns your preferences into personalized routes with
                safety, terrain, and weather insights built in.
              </p>
              <div className="flex flex-col gap-4 sm:flex-row animate-fade-in">
                <Link href="/find">
                  <Button size="lg">
                    Start with Find
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/routes">
                  <Button variant="outline" size="lg">
                    Explore routes
                  </Button>
                </Link>
              </div>
              <div className="flex items-center gap-8 pt-6">
                <div>
                  <p className="text-2xl font-semibold text-foreground">4.9</p>
                  <p className="text-sm text-muted-foreground">Runner rating</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">500+</p>
                  <p className="text-sm text-muted-foreground">Curated routes</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-foreground">24/7</p>
                  <p className="text-sm text-muted-foreground">Safety scoring</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="glass-card rounded-3xl p-6 shadow-card">
                <img
                  src="/landing/hero-athletic-runner.png"
                  alt="Athletic runner in motion"
                  className="w-full rounded-3xl object-cover"
                />
              </div>
              <div className="absolute -bottom-8 left-6 rounded-3xl bg-gradient-card p-5 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-primary text-white">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      Lakefront Loop
                    </p>
                    <p className="text-xs text-muted-foreground">
                      4.2 mi • Safety 92
                    </p>
                  </div>
                </div>
              </div>
              <div className="absolute -right-6 top-10 hidden w-48 rounded-3xl bg-gradient-card p-4 shadow-card lg:block">
                <p className="text-xs text-muted-foreground">Today</p>
                <p className="text-2xl font-semibold text-foreground">72°F</p>
                <p className="text-xs text-muted-foreground">Clear • 5 mph</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="features" className="px-4 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Why runners choose RunScout
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Discover routes designed with safety, comfort, and scenery in mind.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Shield className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Safety-first scoring</CardTitle>
                <CardDescription>
                  Lighting, foot traffic, and neighborhood safety rolled into a
                  simple score.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Target className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Personalized preferences</CardTitle>
                <CardDescription>
                  Distance, terrain, and elevation tailored to every run.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="text-center hover-lift">
              <CardHeader>
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                  <Users className="h-6 w-6 text-primary" />
                </div>
                <CardTitle>Community insight</CardTitle>
                <CardDescription>
                  Popular routes, local tips, and runner-approved paths.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 pb-20">
        <div className="container mx-auto grid gap-10 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-muted-foreground">
              Replace the Find flow with our own
            </p>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Build your route with Find
            </h2>
            <p className="text-base text-muted-foreground">
              Head to our Find page to enter a starting location, tune your
              preferences, and generate a route instantly.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Link href="/find">
                <Button size="lg">Open Find</Button>
              </Link>
              <Link href="/routes">
                <Button variant="outline" size="lg">
                  Browse curated routes
                </Button>
              </Link>
            </div>
          </div>
          <Card className="overflow-hidden">
            <img
              src="/landing/hero-premium-fitness.jpg"
              alt="Runner overlooking a scenic route"
              className="h-full w-full object-cover"
            />
          </Card>
        </div>
      </section>

      <section id="how-it-works" className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              How it works
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Three simple steps to a confident run.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>1. Set your starting point</CardTitle>
                <CardDescription>
                  Search for a neighborhood or use your current location.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  We’ll map nearby paths and highlight safety, scenery, and
                  surface type.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>2. Tune the vibe</CardTitle>
                <CardDescription>
                  Choose distance, elevation, and surface preferences.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Our scoring system weighs your preferences against the data.
                </p>
              </CardContent>
            </Card>
            <Card className="hover-lift">
              <CardHeader>
                <CardTitle>3. Hit the road</CardTitle>
                <CardDescription>
                  Get a route with weather and safety insights.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Save the route, view it on the map, and run with confidence.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Popular routes near you
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Community favorites with verified safety ratings.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {featuredRoutes.map((route) => (
              <Card key={route.id} className="hover-lift">
                <CardHeader>
                  <CardTitle>{route.name}</CardTitle>
                  <CardDescription>
                    {route.distance} mi • {route.elevationGain} ft elevation
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Safety score</span>
                    <span className="font-semibold text-foreground">
                      {route.safetyScore}/100
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Surface</span>
                    <span className="font-semibold capitalize text-foreground">
                      {route.surfaceType}
                    </span>
                  </div>
                  <Link
                    href={`/routes/${route.id}`}
                    className="inline-flex items-center gap-2 text-sm font-semibold text-primary"
                  >
                    View route
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Explore by category
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Find routes that match your style and schedule.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {categories.map((category) => (
              <Card key={category.title} className="group overflow-hidden hover-lift">
                <div className="relative">
                  <img
                    src={category.image}
                    alt={category.title}
                    className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <p className="text-xs uppercase tracking-widest text-white/70">
                      {category.tag}
                    </p>
                    <p className="text-lg font-semibold text-white">
                      {category.title}
                    </p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="testimonials" className="px-4 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Stories from runners
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Trusted by runners who care about safety and scenery.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {testimonials.map((testimonial) => (
              <Card key={testimonial.name} className="hover-lift">
                <CardHeader className="items-center text-center">
                  <img
                    src={testimonial.image}
                    alt={testimonial.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                  <CardTitle className="mt-4">{testimonial.name}</CardTitle>
                  <CardDescription className="flex items-center gap-1">
                    <Star className="h-4 w-4 text-primary" />
                    5.0 runner rating
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    “{testimonial.quote}”
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section id="faq" className="bg-muted/30 px-4 py-20">
        <div className="container mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Frequently asked questions
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Everything you need to know before your first route.
            </p>
          </div>
          <div className="mt-10 space-y-4">
            {faqs.map((faq) => (
              <details
                key={faq.question}
                className="rounded-3xl bg-background p-6 shadow-soft"
              >
                <summary className="cursor-pointer text-base font-semibold text-foreground">
                  {faq.question}
                </summary>
                <p className="mt-3 text-sm text-muted-foreground">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="glass-card rounded-3xl p-10 text-center shadow-card">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Ready to run smarter?
            </h2>
            <p className="mt-3 text-base text-muted-foreground">
              Join thousands of runners building safer, more scenic routes.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <Link href="/auth/signup">
                <Button size="lg">Get started free</Button>
              </Link>
              <Link href="/find">
                <Button variant="outline" size="lg">
                  Try Find
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
