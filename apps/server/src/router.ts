import { prisma } from "./prisma";
import z from "zod";
import { protectedProcedure, publicProcedure, router } from "./trpc";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "util";

const scryptAsync = promisify(scrypt);

export const appRouter = router({
  userList: publicProcedure.query(async () => {
    // Retrieve users from a datasource, this is an imaginary database
    const users = await prisma.user.findMany();

    return users;
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
