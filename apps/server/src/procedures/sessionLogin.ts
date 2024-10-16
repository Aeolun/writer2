import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";
import { createHash, randomBytes, scrypt } from "node:crypto";
import { promisify } from "util";
import z from "zod";

const scryptAsync = promisify(scrypt);

export const sessionLogin = publicProcedure
  .input(
    z.object({
      email: z.string(),
      password: z.string(),
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
      const newAccessKey = await prisma.session.create({
        data: {
          owner: {
            connect: emailUser,
          },
          validUntil: new Date(Date.now() + 1000 * 60 * 60 * 24),
        },
      });
      return newAccessKey.id;
    }
    return undefined;
  });
