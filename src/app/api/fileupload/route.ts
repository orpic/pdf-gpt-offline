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
  const fileName = pdfFile.name;

  const randomString = Math.random().toString(36).substring(7);
  const uniqueFileName = `${fileName}-${randomString}`;

  if (!pdfFile || !groupId) {
    return NextResponse.json({
      code: "DATA_ERROR" as const,
      message: !pdfFile ? "No PDF file received" : "No groupId received",
    });
  }

  if (pdfFile.type !== "application/pdf") {
    return NextResponse.json({
      code: "DATA_ERROR" as const,
      message: "Please upload a PDF File",
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
            uniqueFileName,
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

  // const presignedUrl = await (async () => {
  //   try {
  //     const presignedUrl = await new Promise((resolve, reject) => {
  //       minioClient.presignedGetObject(
  //         groupId,
  //         uniqueFileName,
  //         365 * 24 * 60 * 60,
  //         function (err, presignedUrl) {
  //           if (err) {
  //             reject(err);
  //           } else {
  //             resolve(presignedUrl);
  //           }
  //         }
  //       );
  //     });

  //     console.log("presignedUrl", presignedUrl);
  //     return presignedUrl;
  //   } catch (error) {
  //     console.error("Error creating presignedUrl:", error);
  //     return {
  //       presignedUrl: "NOT_FOUND" as const,
  //     };
  //   }
  // })();

  // console.log(presignedUrl);

  const fileExists = await db.file.findFirst({
    where: {
      etag: objInfo.etag,
    },
  });

  if (fileExists?.name === uniqueFileName && fileExists.etag === objInfo.etag) {
    return NextResponse.json({
      code: "DATABASE_ERROR" as const,
      message: "Error file already present in database",
    });
  }
  const createdFile = await db.file.create({
    data: {
      etag: objInfo.etag,
      name: uniqueFileName,
      size: pdfFile.size,
      groupId: groupId,
      randomString: randomString,
      uploadStatus: "PENDING",
    },
  });

  const pdfBlob = new Blob([pdfFile], { type: pdfFile.type });
  const loader = new PDFLoader(pdfBlob);
  const pageLevelDocs = await loader.load();

  try {
    await db.file.update({
      where: {
        id: createdFile.id,
      },
      data: {
        uploadStatus: "PROCESSING",
      },
    });
    console.log("OllamaEmbeddings....START");

    const embeddings = new OllamaEmbeddings({
      model: "codellama:13b", // default value is llama2
      baseUrl: "http://localhost:11434", // default value
      requestOptions: {
        useMMap: true,
        numThread: 4,
        numGpu: 1,
      },
    });

    console.log("OllamaEmbeddings....END");
    console.log("Chroma....START");

    const vectorStores = await Chroma.fromDocuments(pageLevelDocs, embeddings, {
      collectionName: createdFile.id,
      url: "http://localhost:8000",
      collectionMetadata: {
        "hnsw:space": "cosine",
      },
    });

    console.log("Chroma....END");
    console.log("vectorStores", vectorStores);

    await db.file.update({
      where: {
        id: createdFile.id,
      },
      data: {
        uploadStatus: "SUCCESS",
      },
    });
  } catch (error) {
    await db.file.update({
      where: {
        id: createdFile.id,
      },
      data: {
        uploadStatus: "FAILED",
      },
    });

    return NextResponse.json({
      code: "EMBEDDING_ERROR" as const,
      message: "Either Ollama or Chroma are not running",
    });
  }

  return NextResponse.json({
    code: "SUCCESS" as const,
    message: "File saved and vectors created",
  });
};
