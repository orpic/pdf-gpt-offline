import * as Minio from "minio";

export const minioClient = new Minio.Client({
  endPoint: "localhost",
  port: parseInt("9000"),
  accessKey: "root",
  secretKey: "password",
  useSSL: false,
});
