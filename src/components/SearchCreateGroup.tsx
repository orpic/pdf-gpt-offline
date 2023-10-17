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

import { FC } from "react";

interface SearchCreateGroupProps {}

const SearchCreateGroup: FC<SearchCreateGroupProps> = ({}) => {
  const groups = [
    {
      id: "tailwind",
      groupname: "Group tailwind ",
      createdAt: "23-12-2023",
    },
    {
      id: "next",
      groupname: "Group next",
      createdAt: "23-12-2023",
    },
    {
      id: "tailwindnext",
      groupname: "Group tailwind next ",
      createdAt: "23-12-2023",
    },
    {
      id: "vite",
      groupname: "Group vite ",
      createdAt: "23-12-2023",
    },
  ];
  return (
    <Command className="w-full bg-transparent outline-none focus:ring-1 focus:ring-zinc-500 p-4 lg:rounded-2xl rounded-xl placeholder:text-zinc-600 placeholder:text-xl text-xl">
      <CommandInput
        autoFocus
        placeholder="Search or create your group"
        className="placeholder:text-xl text-xl"
      />
      <CommandList className="text-xl">
        <CommandEmpty
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
        <CommandGroup heading="Suggestions">
          <CommandItem>test group 1</CommandItem>
        </CommandGroup>
        <CommandSeparator />
        <CommandGroup heading="Your groups">
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
        </CommandGroup>
      </CommandList>
    </Command>
  );
};

export default SearchCreateGroup;
