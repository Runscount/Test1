export function Footer() {
  return (
    <footer className="border-t bg-white py-8">
      <div className="container mx-auto px-4">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-gray-600">
            © {new Date().getFullYear()} RunScout. Discover safe running routes
            in Chicago.
          </p>
          <div className="flex gap-4 text-sm text-gray-600">
            <a href="/routes" className="hover:text-gray-900">
              Routes
            </a>
            <a href="/profile" className="hover:text-gray-900">
              Profile
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

