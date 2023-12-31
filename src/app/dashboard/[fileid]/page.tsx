import PdfRenderer from "@/components/PdfRenderrer";
import ChatWrapper from "@/components/chat/ChatWrapper";
import { db } from "@/db";
import { notFound, redirect } from "next/navigation";

interface PageProps {
  params: {
    fileid: string;
  };
}

const Page = async ({ params }: PageProps) => {
  //retrive file id
  const { fileid } = params;

  const file = await db.file.findFirst({
    where: {
      id: fileid,
    },
  });

  if (!file) notFound();

  return (
    <div className="flex-1 justify-between flex flex-col h-[calc(100vh - 3.5rem)]">
      <div className="mx-auto w-full max-w-8xl grow lg:flex xl:px-2">
        {/* left pdf viewer */}
        <div className="flex-1 xl:flex">
          <div className="px-4 py-6 sm:px-6 lg:pl-8 xl:flex-1 xl:pl-6">
            <PdfRenderer url={file.url} />
          </div>
        </div>
        {/* left pdf viewer */}
        {/* right */}
        <div className="shrink-0 flex-[0.75] border-2 border-neutral-300 lg:w-96  ">
          <ChatWrapper fileId={file.id} />
        </div>
        {/* right */}
      </div>
    </div>
  );
};

export default Page;
