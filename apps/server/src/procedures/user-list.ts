import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";

export const userList = publicProcedure.query(async () => {
  // Retrieve users from a datasource, this is an imaginary database
  const users = await prisma.user.findMany();

  return users;
});
