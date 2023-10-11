import Dashboard from "@/components/Dashboard";
import { db } from "@/db";
import { redirect } from "next/navigation";

const Page = async () => {
  return <Dashboard />;
};

export default Page;
