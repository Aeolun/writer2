import {
  GetObjectCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";

let s3Api: S3Client | undefined;
const getClient = () => {
  if (s3Api) {
    return s3Api;
  }
  s3Api = new S3Client({
    credentials: {
      accessKeyId: "Writer2",
      secretAccessKey: process.env.CLOUDFLARE_API_TOKEN,
    },
    region: "auto",
    endpoint:
      "https://56fb8981aa9ab6006da6d34943c59f88.r2.cloudflarestorage.com",
  });
  return s3Api;
};

export const uploadFile = async (data: Buffer, path: string): Promise<void> => {
  const client = getClient();
  await client.send(
    new PutObjectCommand({
      Bucket: "writer2",
      Key: path,
      Body: data,
    }),
  );
};

export const downloadFile = async (path: string): Promise<Buffer> => {
  const client = getClient();
  const response = await client.send(
    new GetObjectCommand({
      Bucket: "writer2",
      Key: path,
    }),
  );
  return Buffer.from(await response.Body.transformToByteArray());
};
