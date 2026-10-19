import Link from "next/link";
import { buttonClass } from "@/components/ui/buttonStyles";

export default function NotFound() {
  return (
    <div className="grid min-h-[100svh] place-items-center bg-cream px-4 pt-16 text-center">
      <div>
        <p className="eyebrow text-gold-deep">Page not found</p>
        <h1 className="font-display mt-4 text-5xl font-medium">This box is empty.</h1>
        <p className="mt-4 text-cocoa-600">The page you were looking for isn&apos;t here.</p>
        <div className="mt-8 flex justify-center gap-3">
          <Link href="/" className={buttonClass("ghost", "md")}>
            Back home
          </Link>
          <Link href="/customize" className={buttonClass("primary", "md")}>
            Open the gift studio
          </Link>
        </div>
      </div>
    </div>
  );
}
