import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";
import { createHash, randomBytes, scrypt } from "node:crypto";
import { promisify } from "util";
import z from "zod";

const scryptAsync = promisify(scrypt);

export const login = publicProcedure
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
          description: input.description,
          owner: {
            connect: emailUser,
          },
        },
      });
      return newAccessKey.key;
    }
    return undefined;
  });
