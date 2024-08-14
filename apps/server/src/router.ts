import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "util";
import * as sharp from "sharp";
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
    .input(z.object({ dataBase64: z.string() }))
    .mutation(async ({ input, ctx }) => {
      const data = Buffer.from(input.dataBase64, "base64");

      // Save the image to a database
      const meta = await sharp(data).metadata();
      const imageType = meta.format;
      if (!["png", "jpeg", "webp"].includes(imageType)) {
        throw new Error("Invalid image type");
      }

      const storagePath = `upload/${ctx.accessKey.ownerId}/${randomBytes(16).toString("hex")}.${imageType}`;
      await uploadFile(data, storagePath);
      return prisma.file.create({
        data: {
          ownerId: ctx.accessKey.ownerId,
          path: storagePath,
          mimeType: `image/${imageType}`,
          width: meta.width,
          height: meta.height,
          bytes: meta.size,
        },
      });
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
