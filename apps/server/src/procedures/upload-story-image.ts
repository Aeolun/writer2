import { createHash } from "node:crypto";
import { protectedProcedure } from "../trpc";
import z from "zod";
import sharp from "sharp";
import { prisma } from "../prisma";
import { uploadFile } from "../util/file-storage";

export const uploadStoryImage = protectedProcedure
  .input(
    z.object({
      storyId: z.string(),
      path: z.string(),
      dataBase64: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const data = Buffer.from(input.dataBase64, "base64");
    const sha256 = createHash("sha256").update(data).digest("hex");

    // Save the image to a database
    const meta = await sharp(data).metadata();
    const imageType = meta.format;
    if (!["png", "jpeg", "webp"].includes(imageType ?? "asdf89")) {
      throw new Error("Invalid image type");
    }

    const story = await prisma.story.findFirst({
      where: {
        id: input.storyId,
        ownerId: ctx.authenticatedUser.id,
      },
    });

    if (!story) {
      throw new Error("Story not found");
    }

    const pathHash = createHash("sha256").update(input.path).digest("hex");
    const storagePath = `upload/${ctx.authenticatedUser.id}/${input.storyId}/${pathHash}.${imageType}`;

    const existingFile = await prisma.file.findFirst({
      where: {
        ownerId: ctx.authenticatedUser.id,
        storyId: input.storyId,
        path: storagePath,
      },
    });

    if (!existingFile || existingFile.sha256 !== sha256) {
      await uploadFile(data, storagePath, `image/${imageType}`);
    }
    const result = await prisma.file.upsert({
      where: {
        path: storagePath,
        storyId: input.storyId,
      },
      create: {
        ownerId: ctx.authenticatedUser.id,
        storyId: input.storyId,
        path: storagePath,
        localPath: input.path,
        mimeType: `image/${imageType}`,
        width: meta.width,
        height: meta.height,
        bytes: meta.size,
        sha256,
      },
      update: {
        mimeType: `image/${imageType}`,
        localPath: input.path,
        width: meta.width,
        height: meta.height,
        bytes: meta.size,
        sha256,
      },
    });
    return {
      ...result,
      fullUrl: `https://team.wtf/${storagePath}`,
    };
  });
