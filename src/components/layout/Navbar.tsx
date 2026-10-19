"use client";

import { AnimatePresence, motion } from "motion/react";
import { Menu, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { buttonClass } from "@/components/ui/buttonStyles";
import { Logo } from "@/components/ui/Logo";
import { cn } from "@/lib/cn";

const links = [
  { href: "/#collection", label: "Gift boxes" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/customize", label: "Gift studio" },
  { href: "/#order", label: "Ordering" },
];

export function Navbar() {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isStudio = pathname.startsWith("/customize");
  const [scroll, setScroll] = useState<"top" | "hero" | "page">("top");
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const hero = document.getElementById("hero");
      const heroEnd = hero ? hero.offsetTop + hero.offsetHeight - 64 : 0;
      setScroll(y <= 24 ? "top" : y < heroEnd ? "hero" : "page");
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const overHero = isHome && scroll !== "page";
  const solidDark = isHome && scroll === "hero";

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-[background-color,box-shadow,height] duration-500 ease-[var(--ease-luxe)]",
        !overHero
          ? "glass h-16 shadow-[0_1px_0_rgb(43_25_16/0.08)]"
          : solidDark
            ? "glass-dark h-16 shadow-[0_1px_0_rgb(236_217_174/0.08)]"
            : "h-20 bg-transparent",
      )}
    >
      <nav className="mx-auto flex h-full max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8" aria-label="Main">
        <Link href="/" className="rounded-lg" aria-label="Home">
          <Logo tone={overHero ? "light" : "dark"} />
        </Link>

        <ul className="hidden items-center gap-1 md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className={cn(
                  "relative rounded-full px-4 py-2 text-sm font-medium transition-colors",
                  overHero ? "text-ivory/80 hover:text-ivory" : "text-cocoa-700 hover:text-cocoa-950",
                  link.href === "/customize" && isStudio && "text-cocoa-950",
                )}
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-2">
          {!isStudio && (
            <span className="hidden sm:block">
              <Link href="/customize" className={buttonClass(overHero ? "gold" : "primary", "sm")}>
                Create your box
              </Link>
            </span>
          )}
          <button
            type="button"
            onClick={() => setOpen(true)}
            className={cn(
              "grid h-10 w-10 place-items-center rounded-full md:hidden",
              overHero ? "text-ivory hover:bg-white/10" : "text-cocoa-900 hover:bg-cocoa-900/5",
            )}
            aria-label="Open menu"
            aria-expanded={open}
          >
            <Menu className="h-5 w-5" />
          </button>
        </div>
      </nav>

      <AnimatePresence>
        {open && (
          <motion.div
            className="fixed inset-0 z-[60] flex flex-col bg-cocoa-950 px-6 pb-10 pt-5 text-ivory md:hidden"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            role="dialog"
            aria-modal="true"
            aria-label="Menu"
          >
            <div className="flex items-center justify-between">
              <Logo tone="light" />
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="grid h-10 w-10 place-items-center rounded-full hover:bg-white/10"
                aria-label="Close menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <ul className="mt-14 flex flex-col gap-2">
              {links.map((link, index) => (
                <motion.li
                  key={link.href}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * index + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="font-display block py-2 text-4xl text-ivory/90 hover:text-champagne"
                  >
                    {link.label}
                  </Link>
                </motion.li>
              ))}
            </ul>
            <Link href="/customize" onClick={() => setOpen(false)} className={buttonClass("gold", "lg", "mt-auto w-full")}>
              Create your gift box
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
