import { db } from "@/db";
import { SendMessageValidator } from "@/lib/validators/SendMessageValidator";
import { PineconeStore } from "langchain/vectorstores/pinecone";
import { NextRequest } from "next/server";

import { StreamingTextResponse, AIStream } from "ai";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { Chroma } from "langchain/vectorstores/chroma";
import { ChatOllama } from "langchain/chat_models/ollama";
import { StringOutputParser } from "langchain/schema/output_parser";

export const POST = async (req: NextRequest) => {
  // endpoint for asking questions

  const body = await req.json();

  const { fileId, message } = SendMessageValidator.parse(body);

  const file = await db.file.findFirst({
    where: {
      id: fileId,
    },
  });

  if (!file) return new Response("File not found", { status: 404 });

  await db.message.create({
    data: {
      text: message,
      isUserMessage: true,
      // userId,
      fileId,
    },
  });

  // vectorise the incoming the message
  const embeddings = new OllamaEmbeddings({
    model: "codellama:13b", // default value is llama2
    baseUrl: "http://localhost:11434", // default value
    requestOptions: {
      useMMap: true,
      numThread: 4,
      numGpu: 1,
    },
  });

  const vectorStore = await Chroma.fromExistingCollection(embeddings, {
    collectionName: fileId,
  });

  // now search for the most relevant pdf page for this query
  const results = await vectorStore.similaritySearch(message, 6);

  //prev messages

  const prevMessages = await db.message.findMany({
    where: {
      fileId,
    },
    orderBy: {
      creadetAt: "asc",
    },
    take: 2,
  });

  const formattedPrevMessages = prevMessages.map((msg) => ({
    role: msg.isUserMessage ? ("user" as const) : ("assistant" as const),
    content: msg.text,
  }));

  const model = new ChatOllama({
    baseUrl: "http://localhost:11434", // Default value
    model: "codellama:13b", // default value is llama2
  });

  const stream = await model.pipe(new StringOutputParser()).stream(`
  Use the following pieces of context (or previous conversaton if needed) to answer the users question in markdown format. \nIf you don't know the answer, just say that you don't know, don't try to make up an answer.
  \n----------------\n
  PREVIOUS CONVERSATION:
  ${formattedPrevMessages.map((message) => {
    if (message.role === "user") return `User: ${message.content}\n`;
    return `Assistant: ${message.content}\n`;
  })}
  
  \n----------------\n
  CONTEXT:
        ${results.map((r) => r.pageContent).join("\n\n")}
  
  USER INPUT: ${message}
  `);

  // const streamai = AIStream(

  // );

  // stream, {
  //   async onCompletion(completion) {
  //     await db.message.create({
  //       data: {
  //         text: completion,
  //         isUserMessage: false,
  //         fileId,
  //         userId,
  //       },
  //     });
  //   },
  // }

  return new StreamingTextResponse(stream);
};
