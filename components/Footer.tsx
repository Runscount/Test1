export function Footer() {
  return (
    <footer className="border-t border-border bg-background/90 py-12 backdrop-blur">
      <div className="container mx-auto px-4">
        <div className="grid gap-8 md:grid-cols-4">
          <div className="space-y-3">
            <h3 className="text-lg font-semibold text-foreground">RunScout</h3>
            <p className="text-sm text-muted-foreground">
              Discover safer, smarter running routes tailored to your goals.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Explore</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="transition hover:text-foreground" href="/find">
                  Find routes
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="/routes">
                  Browse routes
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="/profile">
                  Profile
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Product</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="transition hover:text-foreground" href="#features">
                  Features
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="#how-it-works">
                  How it works
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="#faq">
                  FAQ
                </a>
              </li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-foreground">Company</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <a className="transition hover:text-foreground" href="#testimonials">
                  Stories
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="/auth/signup">
                  Join free
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="/auth/login">
                  Log in
                </a>
              </li>
              <li>
                <a className="transition hover:text-foreground" href="/contact">
                  Contact us
                </a>
              </li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} RunScout. Discover safe running routes in
          Chicago.
        </div>
      </div>
    </footer>
  );
}

