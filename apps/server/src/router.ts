import { createHash, randomBytes, scrypt } from "node:crypto";
import { promisify } from "util";
import { persistedSchema } from "@writer/shared";
import sharp from "sharp";
import z from "zod";
import { prisma } from "./prisma";
import { protectedProcedure, publicProcedure, router } from "./trpc";
import { uploadFile } from "./util/file-storage";

const scryptAsync = promisify(scrypt);

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const users = await prisma.user.findMany();

    return users;
  }),
  uploadImage: protectedProcedure
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
          ownerId: ctx.accessKey.ownerId,
        },
      });

      if (!story) {
        throw new Error("Story not found");
      }

      const pathHash = createHash("sha256").update(input.path).digest("hex");
      const storagePath = `upload/${ctx.accessKey.ownerId}/${input.storyId}/${pathHash}.${imageType}`;

      const existingFile = await prisma.file.findFirst({
        where: {
          ownerId: ctx.accessKey.ownerId,
          path: storagePath,
        },
      });

      if (!existingFile || existingFile.sha256 !== sha256) {
        await uploadFile(data, storagePath, `image/${imageType}`);
      }
      const result = await prisma.file.upsert({
        where: {
          path: storagePath,
        },
        create: {
          ownerId: ctx.accessKey.ownerId,
          path: storagePath,
          mimeType: `image/${imageType}`,
          width: meta.width,
          height: meta.height,
          bytes: meta.size,
        },
        update: {
          mimeType: `image/${imageType}`,
          width: meta.width,
          height: meta.height,
          bytes: meta.size,
        },
      });
      return {
        ...result,
        fullUrl: `https://team.wtf/${storagePath}`,
      };
    }),
  publish: protectedProcedure
    .input(persistedSchema)
    .mutation(async ({ input, ctx }) => {
      const story = await prisma.story.findFirst({
        where: {
          id: input.story.id,
          ownerId: ctx.accessKey.ownerId,
        },
      });

      if (!story) {
        const result = await prisma.story.create({
          data: {
            id: input.story.id,
            ownerId: ctx.accessKey.ownerId,
            name: input.story.name,
            coverArtAsset: "",
          },
        });

        return result.updatedAt;
      }

      const result = await prisma.story.update({
        where: {
          id: input.story.id,
        },
        data: {
          name: input.story.name,
        },
      });
      return result.updatedAt;
    }),
  userById: publicProcedure
    .input(z.object({ id: z.number() }))
    .query(async (opts) => {
      const { input } = opts;

      // Retrieve the user with the given ID
      const user = await prisma.user.findFirstOrThrow({
        where: input,
      });
      return user;
    }),
  whoAmI: publicProcedure.query(async (opts) => {
    if (!opts.ctx.token) {
      throw new Error("No token provided");
    }

    const accessToken = await prisma.accessKey.findFirst({
      where: {
        key: opts.ctx.token,
      },
      include: {
        owner: true,
      },
    });

    if (!accessToken) {
      return null;
    }

    return accessToken.owner;
  }),
  register: publicProcedure
    .input(
      z.object({
        email: z.string(),
        name: z.string(),
        password: z.string(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const salt = randomBytes(16).toString("hex");
      const buf = (await scryptAsync(input.password, salt, 64)) as Buffer;
      const storedValue = `${buf.toString("hex")}.${salt}`;

      const hashedPassword = await prisma.user.create({
        data: {
          ...input,
          password: storedValue,
        },
      });

      return true;
    }),
  logout: protectedProcedure.mutation(async ({ ctx }) => {
    await prisma.accessKey.delete({
      where: {
        key: ctx.token,
      },
    });
  }),
  connectedClients: protectedProcedure.query(async ({ ctx }) => {
    const key = prisma.accessKey.findMany({
      where: {
        owner: {
          id: ctx.accessKey.ownerId,
        },
      },
    });
  }),
  login: publicProcedure
    .input(
      z.object({
        email: z.string(),
        password: z.string(),
        description: z.string().optional(),
      }),
    )
    .mutation(async ({ input, ctx }) => {
      const emailUser = await prisma.user.findFirstOrThrow({
        where: {
          email: input.email,
        },
      });

      const [hashedValue, salt] = emailUser.password.split(".");
      const buf = (await scryptAsync(input.password, salt, 64)) as Buffer;

      if (hashedValue === buf.toString("hex")) {
        const newAccessKey = await prisma.accessKey.create({
          data: {
            key: randomBytes(64).toString("hex"),
            owner: {
              connect: emailUser,
            },
          },
        });
        return newAccessKey.key;
      } else {
        return undefined;
      }
    }),
});

// Export type router type signature,
// NOT the router itself.
export type AppRouter = typeof appRouter;
