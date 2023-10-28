import { db } from "@/db";
import { minioClient } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { PDFLoader } from "langchain/document_loaders/fs/pdf";
import { OllamaEmbeddings } from "langchain/embeddings/ollama";
import { Chroma } from "langchain/vectorstores/chroma";

export const POST = async (req: NextRequest) => {
  const data = await req.formData();
  const pdfFile: File | null = data.get("pdfFile") as unknown as File;
  const groupId = data.get("groupId") as string;

  if (!pdfFile) {
    return NextResponse.json({
      code: "MISSING_DATA" as const,
      message: "No PDF file recieved",
    });
  }

  if (!groupId) {
    return NextResponse.json({
      code: "MISSING_DATA" as const,
      message: "No groupId recieved",
    });
  }

  if (!pdfFile && !groupId) {
    return NextResponse.json({
      code: "MISSING_DATA" as const,
      message: "No data recieved",
    });
  }

  var buffer = Buffer.from(new Uint8Array(await pdfFile.arrayBuffer()));
  const bucketExists = await (async () => {
    try {
      const exists = await new Promise((resolve, reject) => {
        minioClient.bucketExists(groupId, (err, exists) => {
          if (err) {
            reject(err);
          } else {
            resolve(exists);
          }
        });
      });
      return exists;
    } catch (error) {
      return NextResponse.json({
        code: "MINIO_ERROR" as const,
        message: "Error finding existence of Bucket",
      });
    }
  })();

  if (!bucketExists) {
    await new Promise((resolve, reject) => {
      minioClient.makeBucket(groupId, (err) => {
        if (err) {
          reject(err);
        } else {
          resolve({ success: true });
        }
      });
    });
  }

  const metaData = { "Content-Type": "application/pdf" };
  const objInfo: { etag: string | "NOT_FOUND"; versionId: string | null } =
    await (async () => {
      try {
        const objInfo = await new Promise<{
          etag: string | "NOT_FOUND";
          versionId: string | null;
        }>((resolve, reject) => {
          minioClient.putObject(
            groupId,
            pdfFile.name,
            buffer,
            pdfFile.size,
            metaData,
            (err, objInfo) => {
              if (err) {
                reject(err);
              } else {
                resolve(objInfo);
              }
            }
          );
        });
        return objInfo;
      } catch (error) {
        console.error("Error uploading to Minio:", error);
        return {
          etag: "NOT_FOUND" as const,
          versionId: null,
        };
      }
    })();

  if (objInfo.etag === "NOT_FOUND") {
    return NextResponse.json({
      code: "MINIO_ERROR" as const,
      message: "Error uploading the file to Minio",
    });
  }

  const fileExists = await db.file.findFirst({
    where: {
      etag: objInfo.etag,
    },
  });

  if (fileExists?.name === pdfFile.name && fileExists.etag === objInfo.etag) {
    return NextResponse.json({
      code: "DATABASE_ERROR" as const,
      message: "Error file already present in database",
    });
  }

  const createdFile = await db.file.create({
    data: {
      etag: objInfo.etag,
      name: pdfFile.name,
      size: pdfFile.size,
      groupId: groupId,
      uploadStatus: "PROCESSING",
    },
  });

  const pdfBlob = new Blob([pdfFile], { type: pdfFile.type });
  const loader = new PDFLoader(pdfBlob);
  const pageLevelDocs = await loader.load();

  const embeddings = new OllamaEmbeddings({
    model: "llama2-uncensored", // default value is llama2
    baseUrl: "http://localhost:11434", // default value
    requestOptions: {
      useMMap: true,
      numThread: 4,
      numGpu: 1,
    },
  });

  const vectorStore = await Chroma.fromDocuments(pageLevelDocs, embeddings, {
    collectionName: "a-test-collection",
    url: "http://localhost:8000",
    collectionMetadata: {
      "hnsw:space": "cosine",
    },
  });

  // Optional, can be used to specify the distance method of the embedding space https://docs.trychroma.com/usage-guide#changing-the-distance-function

  return NextResponse.json({ file: "upload test 1" });
};
