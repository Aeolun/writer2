import { publicProcedure } from "../trpc.js";
import z from "zod";
import { randomBytes, scrypt } from "node:crypto";
import { promisify } from "node:util";
import { prisma } from "../prisma.js";

const scryptAsync = promisify(scrypt);

export const register = publicProcedure
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
  });
