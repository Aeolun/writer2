import { prisma } from "../prisma";
import { publicProcedure } from "../trpc";

export const authorList = publicProcedure.query(async () => {
  // Retrieve users who have published stories
  const authors = await prisma.user.findMany({
    where: {
      ownedStories: {
        some: {
          published: true, // Assuming there's a 'published' field in the story table
        },
      },
    },
    select: {
      id: true,
      name: true,
      _count: {
        select: {
          ownedStories: true,
        },
      },
    },
  });

  return authors;
});