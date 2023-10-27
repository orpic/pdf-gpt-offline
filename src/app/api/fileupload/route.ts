import { minioClient } from "@/lib/minio";
import { NextRequest, NextResponse } from "next/server";
import { Readable } from "stream";

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
  const objInfo = await (async () => {
    try {
      const objInfo = await new Promise((resolve, reject) => {
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
      return NextResponse.json({
        code: "MINIO_ERROR" as const,
        message: "Error uploading the file to Minio",
      });
    }
  })();

  console.log("Uploaded to Minio:", objInfo);
  // then create text embeddings

  // save it to a vector db chroma

  //

  return NextResponse.json({ file: "upload test 1" });
};
