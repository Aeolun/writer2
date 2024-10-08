import { Node, persistedSchema } from "@writer/shared";
import { protectedProcedure } from "../trpc";
import { prisma } from "../prisma";

// Helper function to build maps for scene-to-chapter, chapter-to-book, and book-to-story relationships
function buildRelationshipMaps(structure: Node[]) {
  const sceneToChapterMap = new Map<string, string>();
  const chapterToBookMap = new Map<string, string>();
  const sortOrders = {
    book: new Map<string, number>(),
    chapter: new Map<string, number>(),
    scene: new Map<string, number>(),
  };

  function traverse(
    node: Node,
    currentBookId: string | null,
    currentChapterId: string | null,
  ) {
    let bookId = currentBookId;
    let chapterId = currentChapterId;
    if (node.type === "book") {
      bookId = node.id;
      sortOrders.book.set(node.id, sortOrders.book.size);
    } else if (node.type === "chapter") {
      chapterId = node.id;
      if (currentBookId) {
        chapterToBookMap.set(chapterId, currentBookId);
      }
      sortOrders.chapter.set(node.id, sortOrders.chapter.size);
    } else if (node.type === "scene" && currentChapterId) {
      sceneToChapterMap.set(node.id, currentChapterId);
      sortOrders.scene.set(node.id, sortOrders.scene.size);
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child, bookId, chapterId);
      }
    }
  }

  for (const book of structure) {
    traverse(book, null, null);
  }

  return { sceneToChapterMap, chapterToBookMap, sortOrders };
}

export const uploadStory = protectedProcedure
  .input(persistedSchema)
  .mutation(async ({ input, ctx }) => {
    const { story, language } = input;

    // Create or update the Story
    const upsertedStory = await prisma.story.upsert({
      where: { id: story.id },
      create: {
        id: story.id,
        name: story.name,
        ownerId: ctx.accessKey.ownerId,
        coverArtAsset: story.uploadedFiles?.coverArt?.publicUrl || "",
      },
      update: {
        name: story.name,
        coverArtAsset: story.uploadedFiles?.coverArt?.publicUrl || "",
      },
    });

    // Build the relationship maps
    const { sceneToChapterMap, chapterToBookMap, sortOrders } =
      buildRelationshipMaps(story.structure);

    const wordsPerBook = new Map<string, number>();
    let totalWords = 0;

    // Create or update Books
    const existingBooks = [];
    for (const [bookId, bookData] of Object.entries(story.book)) {
      const sortOrder = sortOrders.book.get(bookId) ?? 0;
      if (sortOrders.book.has(bookId)) {
        existingBooks.push(bookId);
      }
      await prisma.book.upsert({
        where: { id: bookId },
        create: {
          id: bookId,
          name: bookData.title,
          coverArtAsset: "",
          spineArtAsset: "",
          sortOrder: sortOrder,
          storyId: upsertedStory.id,
        },
        update: {
          name: bookData.title,
          storyId: upsertedStory.id,
          sortOrder: sortOrder,
        },
      });
    }
    // remove books that are no longer in the structure of the book
    await prisma.book.deleteMany({
      where: {
        storyId: upsertedStory.id,
        id: {
          notIn: existingBooks,
        },
      },
    });

    // Create or update Chapters
    for (const [chapterId, chapterData] of Object.entries(story.chapter)) {
      const bookId = chapterToBookMap.get(chapterId) || "";
      // ignore chapters that don't belong to a book
      if (bookId) {
        const sortOrder = sortOrders.chapter.get(chapterId) ?? 0;
        await prisma.chapter.upsert({
          where: { id: chapterId },
          create: {
            id: chapterId,
            name: chapterData.title,
            sortOrder: sortOrder,
            bookId: bookId,
          },
          update: {
            name: chapterData.title,
            bookId: bookId,
            sortOrder: sortOrder,
          },
        });
      }
    }

    // Create or update Scenes
    for (const [sceneId, sceneData] of Object.entries(story.scene)) {
      const chapterId = sceneToChapterMap.get(sceneId) || "";

      // add words to book
      const bookId = chapterToBookMap.get(chapterId) || "";
      if (bookId) {
        wordsPerBook.set(
          bookId,
          (wordsPerBook.get(bookId) || 0) + (sceneData.words ?? 0),
        );
        totalWords += sceneData.words ?? 0;
      }

      // ignore scenes that do not belong to a chapter
      if (chapterId) {
        const sortOrder = sortOrders.scene.get(sceneId) ?? 0;
        const scene = await prisma.scene.upsert({
          where: { id: sceneId },
          create: {
            id: sceneId,
            name: sceneData.title,
            body: sceneData.text,
            chapterId: chapterId,
            sortOrder: sortOrder,
          },
          update: {
            name: sceneData.title,
            body: sceneData.text,
            chapterId: chapterId,
            sortOrder: sortOrder,
          },
        });

        // Fetch all latest revisions for paragraphs in this scene
        const latestRevisions = await prisma.paragraphRevision.findMany({
          where: {
            paragraph: {
              sceneId: scene.id,
            },
          },
          orderBy: {
            createdAt: "desc",
          },
          distinct: ["paragraphId"],
          select: {
            paragraphId: true,
            body: true,
          },
        });

        // Create a map for quick lookup
        const latestRevisionMap = new Map(
          latestRevisions.map((rev) => [rev.paragraphId, rev.body]),
        );

        // Create or update Paragraphs and ParagraphRevisions
        for (const [index, paragraphData] of sceneData.paragraphs.entries()) {
          const paragraph = await prisma.paragraph.upsert({
            where: { id: paragraphData.id },
            create: {
              id: paragraphData.id,
              sceneId: scene.id,
              sortOrder: index,
            },
            update: {
              sortOrder: index,
            },
          });

          // Check if the paragraph content has changed
          const latestRevisionBody = latestRevisionMap.get(paragraph.id);
          if (latestRevisionBody !== paragraphData.text) {
            await prisma.paragraphRevision.create({
              data: {
                paragraphId: paragraph.id,
                body: paragraphData.text,
              },
            });
          }
        }
      }
    }

    // Update the story with the total words
    await prisma.story.update({
      where: { id: upsertedStory.id },
      data: {
        pages: Math.ceil(totalWords / 250),
      },
    });

    // Update the books with the total words
    for (const [bookId, words] of wordsPerBook.entries()) {
      await prisma.book.update({
        where: { id: bookId },
        data: {
          pages: Math.ceil(words / 250),
        },
      });
    }

    return upsertedStory.updatedAt;
  });
