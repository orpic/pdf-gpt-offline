import MaxWidthWrapper from "@/components/MaxWidthWrapper";
import SearchCreateGroup from "@/components/SearchCreateGroup";
import { buttonVariants } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import React from "react";

export default function Home() {
  return (
    <React.Fragment>
      <MaxWidthWrapper className="mb-12 mt-20 sm:mt-10 flex flex-col items-center justify-center text-center">
        <h1 className="max-w-4xl text-5xl font-bold md:text-6xl lg:text-7xl">
          Chat with your <span className="text-blue-600">documents</span> in
          seconds.
        </h1>
      </MaxWidthWrapper>
      {/* Feature section */}
      <div className="mx-auto mb-32 mt-6 max-w-5xl sm:mt-8 ">
        {/* steps */}
        <ol className="my-8 space-y-4 pt-4 md:flex md:space-x-12 md:space-y-0">
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0  md:border-t-2  md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 1</span>
              <span className="text-xl font-semibold">Create a group</span>
              <span className="mt-2 text-zinc-700">
                OR you can choose from already created groups.
              </span>
            </div>
          </li>
          {/* Step 2 */}
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2 md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 2</span>
              <span className="text-xl font-semibold">
                Upload your PDF file (local db)
              </span>
              <span className="mt-2 text-zinc-700">
                AI will process your file and make it ready for you to chat
                with.
              </span>
            </div>
          </li>
          {/*  */}
          <li className="md:flex-1">
            <div className="flex flex-col space-y-2 border-l-4 border-zinc-300 py-2 pl-4 md:border-l-0 md:border-t-2  md:pb-0 md:pl-0 md:pt-4">
              <span className="text-sm font-medium text-blue-600">Step 3</span>
              <span className="text-xl font-semibold">
                Start asking questions
              </span>
              <span className="mt-2 text-zinc-700">
                It&apos;s that simple. Try out PDF-GPT today - it really takes
                less than a minute.
              </span>
            </div>
          </li>
          {/*  */}
        </ol>
        {/*  */}
        <div className="mx-auto max-w-6xl px-6 lg:px-8">
          <div className="mt-16 flow-root sm:mt-24">
            <div className=" rounded-xl bg-gray-900/5  ring-1 ring-inset ring-gray-900/10  lg:rounded-2xl ">
              <SearchCreateGroup />
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  );
}
