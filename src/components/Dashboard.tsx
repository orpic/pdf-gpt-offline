"use client";
import { trpc } from "@/app/_trpc/client";
import UploadButton from "./UploadButton";
import { GhostIcon, Loader2, MessageSquare, Plus, Trash } from "lucide-react";
import Skeleton from "react-loading-skeleton";
import Link from "next/link";
import { format } from "date-fns";
import { Button } from "./ui/button";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { groupId, groupName } from "@/constants/queryParams";

const Dashboard = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const groupIdParam = searchParams.get(groupId);
  const groupNameParam = searchParams.get(groupName);

  useEffect(() => {
    if (!groupIdParam || !groupNameParam) {
      router.back();
    }
  }, [groupIdParam, groupNameParam, router]);

  const [currentlyDeletingFile, setCurrentlyDeletingFile] =
    useState<String | null>(null);

  const utils = trpc.useContext();

  const { data: files, isLoading: isFilesLoading } =
    trpc.getGroupFiles.useQuery(
      {
        groupId: groupIdParam!,
      },
      {
        enabled:
          groupIdParam !== null &&
          groupIdParam !== undefined &&
          groupIdParam !== "",
      }
    );

  const { mutate: deleteFile } = trpc.deleteFile.useMutation({
    onSuccess(data, variables, context) {
      utils.getGroupFiles.invalidate();
    },
    onMutate({ id }) {
      setCurrentlyDeletingFile(id);
    },
    onSettled(data, error, variables, context) {
      setCurrentlyDeletingFile(null);
    },
  });

  return (
    <main className="p-4 mx-auto max-w-7xl md:p-10">
      <div className="mt-8 flex flex-col items-start justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center sm:gap-0">
        <h1 className="mb-3 font-bold text-5xl text-gray-100">
          Files in {groupNameParam}
        </h1>
        {groupIdParam && <UploadButton groupIdParam={groupIdParam} />}
      </div>

      {/* display all user files */}
      {files && files?.length !== 0 ? (
        <ul className="mt-8 grid grid-cols-1 gap-6 divide-y divide-zinc-200 md:grid-cols-2 lg:grid-cols-3 ">
          {files
            .sort(
              (a, b) =>
                new Date(b.creadetAt).getTime() -
                new Date(a.creadetAt).getTime()
            )
            .map((file) => (
              <li
                key={file.id}
                className="col-span-1 divide-y divide-white rounded-lg border  border-white  transition shadow-lg "
              >
                <div
                  onClick={() => {
                    //
                    router.push(
                      `/dashboard/${file.id}?${groupId}=${groupIdParam}&${groupName}=${groupNameParam}`
                    );
                  }}
                  // href={`/dashboard/${file.id}`}
                  className="flex flex-col gap-2"
                >
                  <div className="pt-6 px-6 flex w-full items-center justify-between space-x-6">
                    <div className="flex-1 truncate">
                      <div className="flex items-center space-x-3">
                        <h3 className="truncate text-lg font-medium text">
                          {file.name}
                        </h3>
                      </div>
                    </div>
                  </div>
                </div>
                {/*  */}
                <div className="px-6 mt-4 grid grid-cols-3 place-items-center py-2 gap-6 text-xs text-zinc-500">
                  <div className="flex items-center gap-2 col-span-2 text-bas?${groupId}=${groupIdParam}&${groupName}=${groupNameParam}e">
                    {/* <Plus className="h-4 w-4" /> */}
                    {/* {file.creadetAt} */}
                    {format(
                      new Date(file.creadetAt),
                      "dd MMM (MM) - yyyy, hh:mm a"
                    )}
                  </div>
                  {/* <div className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    mocked
                  </div> */}
                  {/* del bt */}
                  <Button
                    onClick={() => {
                      deleteFile({ id: file.id });
                    }}
                    size="sm"
                    className="w-full"
                    variant="destructive"
                  >
                    {currentlyDeletingFile === file.id ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Trash className="h-4 w-4" />
                    )}
                  </Button>
                </div>
                {/*  */}
              </li>
            ))}
        </ul>
      ) : isFilesLoading ? (
        <Skeleton baseColor="black" height={100} className="my-2 " count={3} />
      ) : (
        <div className="mt-16 flex flex-col items-center gap-2 ">
          <GhostIcon className="h-8 w-8 text-zinc-800" />
          <h3 className="font-semibold text-xl">
            It&apos;s kind-a-empty around here
          </h3>
          <p className="">Let&apos;s upload your pdf</p>
        </div>
      )}
    </main>
  );
};

export default Dashboard;
