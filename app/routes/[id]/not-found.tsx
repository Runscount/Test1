import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] flex-col items-center justify-center px-4">
      <div className="text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">Route Not Found</h1>
        <p className="mb-8 text-gray-600">
          The route you're looking for doesn't exist.
        </p>
        <Link href="/routes">
          <Button>Browse All Routes</Button>
        </Link>
      </div>
    </div>
  );
}

