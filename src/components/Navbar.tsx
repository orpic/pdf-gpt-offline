import Link from "next/link";
import MaxWidthWrapper from "./MaxWidthWrapper";
import React from "react";
import { buttonVariants } from "./ui/button";
import { ArrowUpRightSquareIcon, Github } from "lucide-react";
import MobileNav from "./MobileNav";

const Navbar = () => {
  const user = true;

  return (
    <nav className="sticky h-14 inset-x-0 top-0 z-30 w-full border-b border-gray-200 bg-white/75 backdrop-blur-lg transition-all">
      <MaxWidthWrapper>
        <div className="flex h-14 items-center justify-between border-b border-zinc-200">
          <Link href={"/"} className="flex z-40 font-semibold">
            <span>PDF-GPT</span>
          </Link>
          <MobileNav isAuth={!!user} />
          <div className="hidden items-center space-x-1 sm:flex">
            <>
              <Link
                target="_blank"
                href="https://github.com/orpic/pdf-gpt#readme"
                className={buttonVariants({
                  variant: "ghost",
                  size: "sm",
                })}
              >
                Github Repo
                <Github className="ml-1.5" />
              </Link>
            </>
          </div>
        </div>
      </MaxWidthWrapper>
    </nav>
  );
};

export default Navbar;
