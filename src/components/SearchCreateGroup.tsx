"use client";

import { trpc } from "@/app/_trpc/client";
import { groupId, groupName } from "@/constants/queryParams";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { CornerDownLeft, Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { FC, KeyboardEvent, useState } from "react";

const CREATE_NEW_GROUP_TAB_INDEX = -2;
const UNUSED_TAB_INDEX = -10;

interface SearchCreateGroupProps {}

const SearchCreateGroup: FC<SearchCreateGroupProps> = () => {
  const router = useRouter();
  const utils = trpc.useContext();
  const { data: groups, isLoading } = trpc.getGroups.useQuery();
  const { mutate: createGroup, isLoading: isCreateGroupLoading } =
    trpc.createGroup.useMutation({
      onSuccess(data, variables, context) {
        // no need to invalidate, since we are moving to a new page anyways
        // utils.getGroups.invalidate();
        router.push(
          `/dashboard?${groupId}=${data.id}&${groupName}=${data.groupname}`
        );
      },
    });

  // database call
  // const groups = [
  //   {
  //     id: "tailwind",
  //     groupname: "Group tailwind ",
  //     createdAt: "23-12-2023",
  //   },
  //   {
  //     id: "next",
  //     groupname: "Group next",
  //     createdAt: "23-12-2023",
  //   },
  //   {
  //     id: "tailwindnext",
  //     groupname: "Group tailwind next ",
  //     createdAt: "23-12-2023",
  //   },
  //   {
  //     id: "vite",
  //     groupname: "Group vite ",
  //     createdAt: "23-12-2023",
  //   },
  // ];
  const [filteredGroups, setFilteredGroups] = useState(groups ?? []);
  const [searchString, setSearchString] = useState("");
  const [keyboardFocusIndex, setKeyboardFocusIndex] = useState(0);

  const handleSearch = (searchValue: string) => {
    if (isCreateGroupLoading) return;
    if (searchValue.length > 52) return;

    setSearchString(searchValue);

    if (groups === undefined) {
      return;
    }
    const updatedFilteredGroups = groups.filter((group) =>
      group.groupname.toLowerCase().includes(searchValue.toLowerCase())
    );

    if (updatedFilteredGroups.length === 0) {
      setKeyboardFocusIndex(CREATE_NEW_GROUP_TAB_INDEX);
    } else {
      setKeyboardFocusIndex((prev) => {
        if (prev >= 0) {
          return prev;
        } else {
          return 0;
        }
      });
    }
    setFilteredGroups(updatedFilteredGroups);

    console.log("fe", filteredGroups);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setKeyboardFocusIndex((prevIndex) =>
        prevIndex < filteredGroups.length - 1 ? prevIndex + 1 : prevIndex
      );
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setKeyboardFocusIndex((prevIndex) =>
        prevIndex > 0 ? prevIndex - 1 : prevIndex
      );
    } else if (event.key === "Enter") {
      if (
        keyboardFocusIndex === CREATE_NEW_GROUP_TAB_INDEX &&
        filteredGroups.length === 0
      ) {
        createGroup({ groupName: searchString });
      } else if (keyboardFocusIndex >= 0) {
        router.push(
          `/dashboard?${groupId}=${filteredGroups[keyboardFocusIndex].id}`
        );
      }
    }
  };

  return (
    <div className="w-full bg-neutral-800 outline-none focus:ring-1 focus:ring-zinc-500 p-4 lg:rounded-2xl rounded-xl placeholder:text-zinc-600 placeholder:text-xl text-xl">
      <input
        autoFocus
        placeholder="Search or create your group"
        className="placeholder:text-xl text-xl w-full bg-transparent outline-none px-1.5"
        onChange={(e) => handleSearch(e.target.value)}
        onKeyDown={(e) => handleKeyDown(e)}
        value={searchString}
      />
      {isCreateGroupLoading && (
        <div
          tabIndex={UNUSED_TAB_INDEX}
          className={cn(
            `text-base text-center flex items-center justify-center mt-6 ${"bg-zinc-700"} px-2 rounded-md py-1.5`
          )}
        >
          Creating your group:{" "}
          <span className="flex items-center justify-center mx-1.5 bg-zinc-200 rounded-md px-1.5">
            {searchString}
          </span>
        </div>
      )}

      {searchString === "" && Array.isArray(groups) && groups.length === 0 && (
        <div
          tabIndex={UNUSED_TAB_INDEX}
          className={cn(
            `text-base text-center flex items-center justify-center mt-6 ${"bg-zinc-700"} px-2 rounded-md py-1.5`
          )}
        >
          You have no groups, type to create a group
        </div>
      )}
      {!isCreateGroupLoading && searchString && filteredGroups.length === 0 && (
        <div
          tabIndex={CREATE_NEW_GROUP_TAB_INDEX}
          onClick={() => {
            // create a new group with the name of no search results
            alert("clicked");
          }}
          className={cn(
            `text-base text-center flex items-center justify-center mt-6 ${
              keyboardFocusIndex === CREATE_NEW_GROUP_TAB_INDEX
                ? "bg-zinc-700"
                : ""
            } px-2 rounded-md py-1.5`
          )}
        >
          Press{" "}
          <span className="flex items-center justify-center mx-1.5 bg-zinc-900 rounded-md px-1.5">
            Enter <CornerDownLeft className="w-5 h-5 " />
          </span>{" "}
          to create a group with name:{" "}
          <span className="flex items-center justify-center mx-1.5 bg-zinc-900 rounded-md px-1.5">
            {searchString}
          </span>
        </div>
      )}

      {
        <>
          <ul className="mt-3">
            {isLoading && searchString === "" && (
              <li tabIndex={UNUSED_TAB_INDEX}>
                <div
                  className={`flex justify-center items-center w-full text-base px-1.5 py-1 rounded-md my-1.5   
                    `}
                >
                  <span>
                    <Loader2 className="h-4 w-4 animate-spin" />
                  </span>

                  <span className="ml-1.5">Loading your groups</span>
                </div>
              </li>
            )}
            {!isLoading &&
              searchString === "" &&
              Array.isArray(groups) &&
              groups.map((eachGroup, index) => (
                <li key={eachGroup.id}>
                  <div
                    className={`flex justify-between items-center w-full text-base px-1.5 py-1 rounded-md my-1.5 ${
                      keyboardFocusIndex === index ? "bg-zinc-700" : ""
                    }`}
                  >
                    <span>{eachGroup.groupname}</span>
                    <span>
                      {format(
                        new Date(eachGroup.createdAt),
                        "hh:mm a, dd MMMM yyyy"
                      )}
                    </span>
                  </div>
                </li>
              ))}
            {searchString !== "" &&
              filteredGroups.map((eachGroup, index) => (
                <li key={eachGroup.id}>
                  <div
                    className={`flex justify-between items-center w-full text-base px-1.5 py-1 rounded-md my-1.5 ${
                      keyboardFocusIndex === index ? "bg-zinc-700" : ""
                    }`}
                  >
                    <span>{eachGroup.groupname}</span>
                    <span>
                      {format(
                        new Date(eachGroup.createdAt),
                        "hh:mm a, dd MMMM yyyy"
                      )}
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        </>
      }
    </div>
  );
};

export default SearchCreateGroup;
