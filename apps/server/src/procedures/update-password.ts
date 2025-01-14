import { protectedProcedure } from "../trpc.js";
import { prisma } from "../prisma.js";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import z from "zod";
import { TRPCError } from "@trpc/server";

const scryptAsync = promisify(scrypt);

export const updatePassword = protectedProcedure
  .input(
    z.object({
      currentPassword: z.string(),
      newPassword: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    const userId = ctx.authenticatedUser.id;

    const user = await prisma.user.findFirstOrThrow({
      where: { id: userId },
    });

    const [hashedValue, salt] = user.password.split(".");
    const buf = (await scryptAsync(input.currentPassword, salt, 64)) as Buffer;

    if (hashedValue !== buf.toString("hex")) {
      throw new TRPCError({
        code: "UNAUTHORIZED",
        message: "Current password is incorrect",
      });
    }

    const newSalt = randomBytes(16).toString("hex");
    const newBuf = (await scryptAsync(
      input.newPassword,
      newSalt,
      64,
    )) as Buffer;
    const newStoredValue = `${newBuf.toString("hex")}.${newSalt}`;

    await prisma.user.update({
      where: { id: userId },
      data: { password: newStoredValue },
    });

    return { success: true };
  });
