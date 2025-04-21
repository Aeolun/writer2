import {
  contentSchemaToText,
  languageSchema,
  type Node,
  persistedSchema,
  storySchema,
  StorySettings,
} from "@writer/shared";
import { protectedProcedure } from "../trpc.js";
import { prisma } from "../prisma.js";
import short from "short-uuid";
import { publishChapterToRoyalRoad } from "./publish-to-royal-road.js";
import {
  PublishingPlatform,
  PublishingStatus,
  type Paragraph,
  type ParagraphRevision,
} from "../generated/prisma/client/index.js";
import type { Prisma } from "../generated/prisma/client/index.js";
import z from "zod";
const translator = short();

// Helper function to build maps for relationships including Arcs
function buildRelationshipMaps(structure: Node[]) {
  const arcToBookMap = new Map<string, string>();
  const chapterToArcMap = new Map<string, string>();
  const sceneToChapterMap = new Map<string, string>();
  const nodeTypes = {
    book: new Map<string, Node["nodeType"]>(),
    arc: new Map<string, Node["nodeType"]>(),
    chapter: new Map<string, Node["nodeType"]>(),
    scene: new Map<string, Node["nodeType"]>(),
  };
  const sortOrders = {
    book: new Map<string, number>(),
    arc: new Map<string, number>(),
    chapter: new Map<string, number>(),
    scene: new Map<string, number>(),
  };

  function traverse(
    node: Node,
    currentBookId: string | null,
    currentArcId: string | null,
    currentChapterId: string | null,
    parentNodeType: Node["nodeType"] = "story",
  ) {
    let bookId = currentBookId;
    let arcId = currentArcId;
    let chapterId = currentChapterId;

    // Determine the node type based on parent or its own setting
    const nodeType = node.nodeType || parentNodeType;

    if (node.type === "book") {
      bookId = node.id;
      nodeTypes.book.set(node.id, nodeType);
      sortOrders.book.set(node.id, sortOrders.book.size);
    } else if (node.type === "arc") {
      arcId = node.id;
      if (bookId) {
        arcToBookMap.set(arcId, bookId);
        const bookNodeType = nodeTypes.book.get(bookId) || "story";
        nodeTypes.arc.set(
          node.id,
          nodeType === "story" ? bookNodeType : nodeType,
        );
      } else {
        nodeTypes.arc.set(node.id, nodeType);
      }
      sortOrders.arc.set(node.id, sortOrders.arc.size);
    } else if (node.type === "chapter") {
      chapterId = node.id;
      if (arcId) {
        chapterToArcMap.set(chapterId, arcId);
        const arcNodeType = nodeTypes.arc.get(arcId) || "story";
        nodeTypes.chapter.set(
          node.id,
          nodeType === "story" ? arcNodeType : nodeType,
        );
      } else {
        // Handle chapters potentially outside arcs if needed, though structure implies they shouldn't be
        nodeTypes.chapter.set(node.id, nodeType);
      }
      sortOrders.chapter.set(node.id, sortOrders.chapter.size);
    } else if (node.type === "scene" && chapterId) {
      sceneToChapterMap.set(node.id, chapterId);
      const chapterNodeType = nodeTypes.chapter.get(chapterId) || "story";
      nodeTypes.scene.set(
        node.id,
        nodeType === "story" ? chapterNodeType : nodeType,
      );
      sortOrders.scene.set(node.id, sortOrders.scene.size);
    }

    if (node.children) {
      for (const child of node.children) {
        traverse(child, bookId, arcId, chapterId, nodeType);
      }
    }
  }

  for (const rootNode of structure) {
    // Assuming structure starts with books
    traverse(rootNode, null, null, null);
  }

  return {
    arcToBookMap,
    chapterToArcMap,
    sceneToChapterMap,
    nodeTypes,
    sortOrders,
  };
}

// Define the Royal Road credentials schema
const royalRoadCredentialsSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Create a new schema that extends the persisted schema
const uploadStorySchema = z.object({
  story: storySchema,
  language: languageSchema,
  royalRoadCredentials: royalRoadCredentialsSchema.optional(),
});

export const uploadStory = protectedProcedure
  .input(uploadStorySchema)
  .mutation(async ({ input, ctx }) => {
    const { story, language, royalRoadCredentials } = input;

    // Create or update the Story
    const upsertedStory = await prisma.story.upsert({
      where: { id: translator.toUUID(story.id) },
      create: {
        id: translator.toUUID(story.id),
        name: story.name,
        ownerId: ctx.authenticatedUser.id,
        coverArtAsset: story.settings?.headerImage || "",
        updatedAt: story.modifiedTime
          ? new Date(story.modifiedTime)
          : undefined,
        // Persist other story settings?
        // royalRoadId: story.settings?.royalRoadId ? parseInt(story.settings.royalRoadId) : undefined,
      },
      update: {
        name: story.name,
        coverArtAsset: story.settings?.headerImage || "",
        updatedAt: story.modifiedTime
          ? new Date(story.modifiedTime)
          : undefined,
        // Persist other story settings?
      },
    });

    // Build the relationship maps including Arcs
    const {
      arcToBookMap,
      chapterToArcMap,
      sceneToChapterMap,
      nodeTypes,
      sortOrders,
    } = buildRelationshipMaps(story.structure);

    const wordsPerBook = new Map<string, number>();
    let totalWords = 0;

    // --- Upsert Books ---
    const existingBooks = new Set<string>();

    for (const bookId in story.book) {
      if (Object.hasOwn(story.book, bookId)) {
        const bookData = story.book[bookId];
        const bookUuid = translator.toUUID(bookId);
        existingBooks.add(bookUuid);
        const sortOrder = sortOrders.book.get(bookId) ?? 0;
        const nodeType = nodeTypes.book.get(bookId) || "story";
        console.log(
          "bookData",
          bookData.modifiedAt,
          bookData.modifiedAt ? new Date(bookData.modifiedAt) : undefined,
        );

        const result = await prisma.book.upsert({
          where: { id: bookUuid },
          create: {
            id: bookUuid,
            name: bookData.title,
            coverArtAsset: bookData.coverImage || "",
            spineArtAsset: "", // Not in shared schema
            sortOrder: sortOrder,
            storyId: upsertedStory.id,
            nodeType: nodeType,
            updatedAt: bookData.modifiedAt
              ? new Date(bookData.modifiedAt)
              : undefined,
          },
          update: {
            name: bookData.title,
            coverArtAsset: bookData.coverImage || "",
            storyId: upsertedStory.id,
            sortOrder: sortOrder,
            nodeType: nodeType,
            updatedAt: bookData.modifiedAt
              ? new Date(bookData.modifiedAt)
              : undefined,
          },
        });
        await prisma.book.update({
          where: { id: bookUuid },
          data: {
            updatedAt: bookData.modifiedAt
              ? new Date(bookData.modifiedAt)
              : undefined,
          },
        });
      }
    }
    await prisma.book.deleteMany({
      where: { storyId: upsertedStory.id, id: { notIn: [...existingBooks] } },
    });

    // --- Upsert Arcs ---
    const existingArcs = new Set<string>();
    for (const arcId in story.arc) {
      if (Object.hasOwn(story.arc, arcId)) {
        const arcData = story.arc[arcId];
        const arcUuid = translator.toUUID(arcId);
        const bookId = arcToBookMap.get(arcId);
        if (!bookId) {
          console.warn(`Arc ${arcId} has no parent book, skipping.`);
          continue;
        }
        const bookUuid = translator.toUUID(bookId);
        existingArcs.add(arcUuid);
        const sortOrder = sortOrders.arc.get(arcId) ?? 0;
        const nodeType = nodeTypes.arc.get(arcId) || "story";

        await prisma.arc.upsert({
          where: { id: arcUuid },
          create: {
            id: arcUuid,
            name: arcData.title,
            bookId: bookUuid,
            sortOrder: sortOrder,
            nodeType: nodeType,
            updatedAt: arcData.modifiedAt
              ? new Date(arcData.modifiedAt)
              : undefined,
          },
          update: {
            name: arcData.title,
            bookId: bookUuid,
            sortOrder: sortOrder,
            nodeType: nodeType,
            updatedAt: arcData.modifiedAt
              ? new Date(arcData.modifiedAt)
              : undefined,
          },
        });
      }
    }
    // Delete orphaned Arcs (consider cascading deletes or handle explicitly)
    // Fetch all arcs for the story to find orphans, as we don't have a direct story->arc link
    const allStoryArcs = await prisma.arc.findMany({
      where: { book: { storyId: upsertedStory.id } },
      select: { id: true },
    });
    const arcsToDelete = allStoryArcs
      .filter((arc) => !existingArcs.has(arc.id))
      .map((arc) => arc.id);
    if (arcsToDelete.length > 0) {
      await prisma.arc.deleteMany({ where: { id: { in: arcsToDelete } } });
    }

    // --- Upsert Chapters ---
    const publishedChapters = new Set<string>();
    const chaptersToPublish = [];
    const existingChapters = new Set<string>();

    for (const chapterId in story.chapter) {
      if (Object.hasOwn(story.chapter, chapterId)) {
        const chapterData = story.chapter[chapterId];
        const chapterUuid = translator.toUUID(chapterId);
        const arcId = chapterToArcMap.get(chapterId);

        if (!arcId) {
          console.warn(`Chapter ${chapterId} has no parent arc, skipping.`);
          continue;
        }
        const arcUuid = translator.toUUID(arcId);
        existingChapters.add(chapterUuid);

        const sortOrder = sortOrders.chapter.get(chapterId) ?? 0;
        const nodeType = nodeTypes.chapter.get(chapterId) || "story";

        const chapter = await prisma.chapter.upsert({
          where: { id: chapterUuid },
          create: {
            id: chapterUuid,
            name: chapterData.title,
            publishedOn: chapterData.visibleFrom
              ? new Date(chapterData.visibleFrom)
              : undefined,
            sortOrder: sortOrder,
            arcId: arcUuid, // Use arcId here
            updatedAt: chapterData.modifiedAt
              ? new Date(chapterData.modifiedAt)
              : undefined,
            nodeType: nodeType,
          },
          update: {
            name: chapterData.title,
            arcId: arcUuid, // Use arcId here
            publishedOn: chapterData.visibleFrom
              ? new Date(chapterData.visibleFrom)
              : undefined,
            sortOrder: sortOrder,
            nodeType: nodeType,
            updatedAt: chapterData.modifiedAt
              ? new Date(chapterData.modifiedAt)
              : undefined,
          },
        });

        // Publishing check (logic remains the same, just uses chapterUuid)
        if (
          chapterData.visibleFrom &&
          new Date(chapterData.visibleFrom) < new Date() &&
          chapterData.royalRoadId &&
          story.settings?.publishToRoyalRoad
        ) {
          const existingPublishing = await prisma.chapterPublishing.findUnique({
            where: {
              chapterId_platform: {
                chapterId: chapterUuid,
                platform: PublishingPlatform.ROYAL_ROAD,
              },
            },
          });
          const lastContentUpdate = chapterData.modifiedAt
            ? new Date(chapterData.modifiedAt)
            : undefined;
          const shouldPublish =
            !existingPublishing ||
            (lastContentUpdate &&
              existingPublishing.lastAttempt &&
              lastContentUpdate.getTime() >
                existingPublishing.lastAttempt.getTime());

          if (shouldPublish) {
            chaptersToPublish.push({
              id: chapterUuid,
              royalRoadId: chapterData.royalRoadId,
              publishDate: chapterData.visibleFrom
                ? new Date(chapterData.visibleFrom)
                : undefined,
            });
            publishedChapters.add(chapterId); // Add original short ID for word count check
          }
        } else if (
          chapterData.visibleFrom &&
          new Date(chapterData.visibleFrom) < new Date()
        ) {
          publishedChapters.add(chapterId); // Add original short ID for word count check
        }
      }
    }
    // Delete orphaned Chapters
    const allStoryChapters = await prisma.chapter.findMany({
      where: { arc: { book: { storyId: upsertedStory.id } } },
      select: { id: true },
    });
    const chaptersToDelete = allStoryChapters
      .filter((chap) => !existingChapters.has(chap.id))
      .map((chap) => chap.id);
    if (chaptersToDelete.length > 0) {
      await prisma.chapter.deleteMany({
        where: { id: { in: chaptersToDelete } },
      });
    }

    // --- Prepare operations for paragraphs and revisions ---
    const paragraphUpsertOps: Prisma.PrismaPromise<Paragraph>[] = [];
    const revisionCreateOps: Prisma.PrismaPromise<ParagraphRevision>[] = [];
    const allParagraphIdsInUpload = new Set<string>();
    const latestRevisionsMap = new Map<
      string,
      { body: string; contentSchema: string | null; version: number }
    >();

    // --- Upsert Scenes & Prepare Paragraph/Revision Ops ---
    const existingScenes = new Set<string>();
    for (const sceneId in story.scene) {
      if (Object.hasOwn(story.scene, sceneId)) {
        const sceneData = story.scene[sceneId];
        const sceneUuid = translator.toUUID(sceneId);
        const chapterId = sceneToChapterMap.get(sceneId);
        if (!chapterId) {
          console.warn(`Scene ${sceneId} has no parent chapter, skipping.`);
          continue;
        }
        const chapterUuid = translator.toUUID(chapterId);
        existingScenes.add(sceneUuid);

        const sortOrder = sortOrders.scene.get(sceneId) ?? 0;
        const nodeType = nodeTypes.scene.get(sceneId) || "story";

        // Word count aggregation - map chapterId to bookId via arcId
        const arcIdForScene = chapterToArcMap.get(chapterId);
        const bookIdForScene = arcIdForScene
          ? arcToBookMap.get(arcIdForScene)
          : undefined;

        if (bookIdForScene && publishedChapters.has(chapterId)) {
          wordsPerBook.set(
            bookIdForScene,
            (wordsPerBook.get(bookIdForScene) || 0) + (sceneData.words ?? 0),
          );
          totalWords += sceneData.words ?? 0;
        }

        const scene = await prisma.scene.upsert({
          where: { id: sceneUuid },
          create: {
            id: sceneUuid,
            name: sceneData.title,
            body: sceneData.text, // Consider if body is still needed if all content is in revisions
            chapterId: chapterUuid,
            sortOrder: sortOrder,
            nodeType: nodeType,
            createdAt: sceneData.modifiedAt
              ? new Date(sceneData.modifiedAt)
              : undefined,
            updatedAt: sceneData.modifiedAt
              ? new Date(sceneData.modifiedAt)
              : undefined,
          },
          update: {
            name: sceneData.title,
            body: sceneData.text,
            chapterId: chapterUuid,
            sortOrder: sortOrder,
            updatedAt: sceneData.modifiedAt
              ? new Date(sceneData.modifiedAt)
              : undefined,
            nodeType: nodeType,
          },
        });

        // Pre-fetch latest revisions for *this scene* to build the map
        const latestRevisionsForScene = await prisma.paragraphRevision.findMany(
          {
            where: { paragraph: { sceneId: sceneUuid } },
            orderBy: { version: "desc" }, // Use version now
            distinct: ["paragraphId"],
            select: {
              paragraphId: true,
              body: true,
              contentSchema: true,
              version: true,
            },
          },
        );
        for (const rev of latestRevisionsForScene) {
          latestRevisionsMap.set(rev.paragraphId, {
            body: rev.body,
            contentSchema: rev.contentSchema,
            version: rev.version,
          });
        }

        // Prepare Paragraph Upserts and Revision Creates for this scene
        // const existingParagraphs = new Set<string>(); // Keep track within the scene for deletion later
        for (const [index, paragraphData] of sceneData.paragraphs.entries()) {
          const paragraphUuid = translator.toUUID(paragraphData.id);
          // existingParagraphs.add(paragraphUuid); // Keep track for deletion
          allParagraphIdsInUpload.add(paragraphUuid); // Keep track for global deletion

          // Prepare Paragraph Upsert Operation
          paragraphUpsertOps.push(
            prisma.paragraph.upsert({
              where: { id: paragraphUuid },
              create: {
                id: paragraphUuid,
                sceneId: sceneUuid,
                sortOrder: index,
                createdAt: paragraphData.modifiedAt
                  ? new Date(paragraphData.modifiedAt)
                  : undefined,
                updatedAt: paragraphData.modifiedAt
                  ? new Date(paragraphData.modifiedAt)
                  : undefined,
              },
              update: {
                sortOrder: index,
                updatedAt: paragraphData.modifiedAt
                  ? new Date(paragraphData.modifiedAt)
                  : undefined,
              },
            }),
          );

          const renderedText =
            typeof paragraphData.text === "string"
              ? paragraphData.text
              : contentSchemaToText(paragraphData.text);
          const newContentSchema =
            typeof paragraphData.text === "string"
              ? null
              : JSON.stringify(paragraphData.text);
          const latestRevision = latestRevisionsMap.get(paragraphUuid);
          const hasChanged =
            !latestRevision ||
            latestRevision.body !== renderedText ||
            latestRevision.contentSchema !== newContentSchema;

          if (hasChanged) {
            // Prepare Revision Create Operation
            revisionCreateOps.push(
              prisma.paragraphRevision.create({
                data: {
                  paragraphId: paragraphUuid,
                  body: renderedText,
                  contentSchema: newContentSchema,
                  createdAt: paragraphData.modifiedAt
                    ? new Date(paragraphData.modifiedAt)
                    : undefined,
                  version: (latestRevision?.version ?? 0) + 1,
                },
              }),
            );
          }
        }
        // Deletion of orphaned paragraphs per scene is tricky with transactions
        // We will handle deletion globally after the transaction
        // await prisma.paragraph.deleteMany({
        //   where: { sceneId: sceneUuid, id: { notIn: [...existingParagraphs] } },
        // });
      }
    }

    // --- Execute Paragraph and Revision Transaction ---
    console.log(
      `Executing transaction for ${paragraphUpsertOps.length} paragraph upserts and ${revisionCreateOps.length} revision creates.`,
    );
    await prisma.$transaction([...paragraphUpsertOps, ...revisionCreateOps]);
    console.log("Transaction complete.");

    // --- Delete Orphaned Paragraphs Globally ---
    // Need to fetch all paragraph IDs for the story *now* after upserts
    // This is less efficient than per-scene but necessary post-transaction
    console.log("Deleting orphaned paragraphs...");
    const allCurrentParagraphIds = await prisma.paragraph
      .findMany({
        where: {
          scene: { chapter: { arc: { book: { storyId: upsertedStory.id } } } },
        },
        select: { id: true },
      })
      .then((paragraphs) => new Set(paragraphs.map((p) => p.id)));

    const paragraphsToDelete = [...allCurrentParagraphIds].filter(
      (id) => !allParagraphIdsInUpload.has(id),
    );

    if (paragraphsToDelete.length > 0) {
      console.log(`Deleting ${paragraphsToDelete.length} orphaned paragraphs.`);
      await prisma.paragraph.deleteMany({
        where: { id: { in: paragraphsToDelete } },
      });
    } else {
      console.log("No orphaned paragraphs to delete.");
    }

    // Delete orphaned Scenes
    const allStoryScenes = await prisma.scene.findMany({
      where: { chapter: { arc: { book: { storyId: upsertedStory.id } } } },
      select: { id: true },
    });
    const scenesToDelete = allStoryScenes
      .filter((scene) => !existingScenes.has(scene.id))
      .map((scene) => scene.id);
    if (scenesToDelete.length > 0) {
      await prisma.scene.deleteMany({ where: { id: { in: scenesToDelete } } });
    }

    // --- Final Updates & Publishing ---
    // Update story word count
    await prisma.story.update({
      where: { id: upsertedStory.id },
      data: {
        pages: Math.ceil(totalWords / 250),
        updatedAt: new Date(), // Explicitly update story timestamp
      },
    });

    // Update book word counts
    for (const [bookId, words] of wordsPerBook.entries()) {
      await prisma.book.update({
        where: { id: translator.toUUID(bookId) },
        data: {
          pages: Math.ceil(words / 250),
        },
      });
    }

    // Publish chapters if needed
    if (chaptersToPublish.length > 0 && story.settings?.publishToRoyalRoad) {
      // ... (publishing logic remains the same, uses chapter Uuid)
      if (!royalRoadCredentials) {
        console.warn(
          "Royal Road credentials not provided but publishing is enabled",
        );
        return {
          success: false,
          error: "Royal Road credentials are required for publishing",
          updatedAt: upsertedStory.updatedAt,
        };
      }

      console.log("chaptersToPublish", chaptersToPublish);

      for (const chapter of chaptersToPublish) {
        try {
          await publishChapterToRoyalRoad(
            chapter.id,
            royalRoadCredentials.username,
            royalRoadCredentials.password,
            ctx.authenticatedUser.id,
            chapter.royalRoadId,
            chapter.publishDate,
          );
        } catch (error) {
          console.error(
            `Failed to publish chapter ${chapter.id} to Royal Road:`,
            error,
          );
        }
      }
    } else {
      console.log("No chapters to publish");
    }

    // Fetch the final updated story to get the accurate updatedAt time
    const finalStory = await prisma.story.findUnique({
      where: { id: upsertedStory.id },
    });

    return {
      success: true,
      updatedAt: finalStory?.updatedAt ?? upsertedStory.updatedAt, // Return the timestamp from the DB
    };
  });
