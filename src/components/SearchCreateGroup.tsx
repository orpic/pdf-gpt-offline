"use client";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";
import { CornerDownLeft } from "lucide-react";

import { FC, useState } from "react";

interface SearchCreateGroupProps {
  groups:
    | {
        id: string;
        groupname: string;
        createdAt: string;
      }[]
    | undefined;
}

const SearchCreateGroup: FC<SearchCreateGroupProps> = ({ groups }) => {
  const [filteredGroups, setFilteredGroups] = useState(groups ?? []);
  const handleSearch = (searchValue: string) => {
    if (groups === undefined) {
      return;
    }
    setFilteredGroups((prev) => {
      const updatedFilteredGroups = groups.filter((group) =>
        group.groupname.toLowerCase().includes(searchValue.toLowerCase())
      );
      return updatedFilteredGroups;
    });
  };

  return (
    <Command className="w-full bg-transparent outline-none focus:ring-1 focus:ring-zinc-500 p-4 lg:rounded-2xl rounded-xl placeholder:text-zinc-600 placeholder:text-xl text-xl">
      <CommandInput
        autoFocus
        placeholder="Search or create your group"
        className="placeholder:text-xl text-xl"
        onValueChange={(e) => handleSearch(e)}
      />
      <CommandList className="text-xl">
        {filteredGroups.length === 0 && (
          <CommandEmpty
            onClick={() => {
              // create a new group with the name of no search results
            }}
            className={cn(
              "text-base text-center flex items-center justify-center mt-6"
            )}
          >
            Press{" "}
            <span className="flex items-center justify-center mx-1.5 bg-zinc-100 rounded-md px-1.5">
              Enter <CornerDownLeft className="w-5 h-5 " />
            </span>{" "}
            to create a group with above name
          </CommandEmpty>
        )}

        {filteredGroups.length > 0 && (
          <>
            <CommandSeparator />
            <CommandGroup heading="Groups">
              {filteredGroups.map((exactMatch) => (
                <CommandItem key={exactMatch.id}>
                  <div className="flex justify-between items-center w-full">
                    <span>{exactMatch.groupname}</span>
                    <span>{exactMatch.createdAt}</span>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          </>
        )}

        <CommandSeparator />
        {/* <CommandGroup heading="Your groups">
          {groups.map((eachGroup) => (
            <CommandItem key={eachGroup.id}>
              <div className="flex justify-between items-center w-full">
                <span>{eachGroup.groupname}</span>
                <span>{eachGroup.createdAt}</span>
              </div>
            </CommandItem>
          ))}
          <CommandItem>Billing</CommandItem>
          <CommandItem>Settings</CommandItem>
        </CommandGroup> */}
      </CommandList>
    </Command>
  );
};

export default SearchCreateGroup;
