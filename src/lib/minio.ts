import Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: process.env.MINIO_ENDPOINT || "http://localhost",
  port: parseInt(process.env.MINIO_PORT || "9000"),
  accessKey: process.env.MINIO_ACCESS_KEY || "my_access_key",
  secretKey: process.env.MINIO_SECRET_KEY || "my_secret_key",
});
