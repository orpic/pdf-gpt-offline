"use client";

import { ArrowRight, MenuIcon } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

const MobileNav = ({ isAuth }: { isAuth: boolean }) => {
  const [isOpen, setIsOpen] = useState(false);

  const toggleOpen = () => setIsOpen((prev) => !prev);

  const pathname = usePathname();

  useEffect(() => {
    if (isOpen) toggleOpen();
  }, [pathname]);

  const closeOnCurrent = (href: string) => {
    if (pathname === href) {
      toggleOpen();
    }
  };

  return (
    <div className="sm:hidden ">
      <MenuIcon
        onClick={toggleOpen}
        className="relative z-50 h-5 w-5 text-zinc-700"
      />

      {isOpen ? (
        <div className="fixed animate-in slide-in-from-top-5 fade-in-20 inset-0 z-0 w-4">
          <ul className="absolute  bg-purple-300 border-b border-zinc-200 shadow-xl grid gap-3 px-10 pt-20 pb-8">
            {!isAuth ? (
              <>
                <li className="">
                  <Link
                    onClick={() => {
                      closeOnCurrent("/sign-up");
                    }}
                    href="/sign-up"
                    className="flex items-center w-full font-semibold text-green-600"
                  >
                    Get Started
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li className="">
                  <Link
                    onClick={() => {
                      closeOnCurrent("/sign-in");
                    }}
                    href="/sign-in"
                    className="flex items-center w-full font-semibold "
                  >
                    Sign In
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li className="">
                  <Link
                    onClick={() => {
                      closeOnCurrent("/pricing");
                    }}
                    href="/pricing"
                    className="flex items-center w-full font-semibold "
                  >
                    Pricing
                  </Link>
                </li>
              </>
            ) : (
              <>
                <li className="">
                  <Link
                    onClick={() => {
                      closeOnCurrent("/dashboard");
                    }}
                    href="/sign-in"
                    className="flex items-center w-full font-semibold "
                  >
                    Dashboard
                  </Link>
                </li>
                <li className="my-3 h-px w-full bg-gray-300" />
                <li className="">
                  <Link
                    onClick={() => {}}
                    href="/sign-out"
                    className="flex items-center w-full font-semibold "
                  >
                    Sign Out
                  </Link>
                </li>
              </>
            )}
          </ul>
        </div>
      ) : null}
    </div>
  );
};
export default MobileNav;
