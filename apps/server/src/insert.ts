import { prisma } from "./prisma";
import { createHash } from "crypto";
import fs from "fs";
import { uploadFile } from "./util/file-storage";
import sharp from "sharp";
import { join } from "node:path";
interface Chapter {
  id: string;
  title: string;
  url: string;
  volumeId: string | null;
  slug: string;
  date: string;
  order: number;
  visible: number;
  subscriptionTiers: string | null;
  doesNotRollOver: boolean;
  isUnlocked: boolean;
}

interface Volume {
  id: string;
  title: string;
  cover: string;
  order: number;
}

interface Story {
  id: string;
  category: string;
  slug: string;
  title: string;
  description: string;
  wordsPerDay?: number;
  url: string;
  author: string;
  isFanfiction: boolean;
  isCompleted: boolean;
  tags: string[];
  color: string;
  textColor: string;
  pages: number;
  cover?: string;
  chapters: Chapter[];
  volumes: Volume[];
}

const cliProgress = require("cli-progress");

// create a new progress bar instance and use shades_classic theme
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const royalroadData: Record<
  string,
  string
> = require("../../reader/royalroad.json");

const cacheFolder = join(__dirname, "..", "..", "reader", "cache", "royalroad");
// start the progress bar with a total value of 200 and start value of 0
bar1.start(Object.keys(royalroadData).length, 0);

const insert = async () => {
  const tags = await prisma.tag.findMany();
  const tagMap = new Map(tags.map((tag) => [tag.name, tag.id]));

  for (const storyFile of Object.values(royalroadData)) {
    const story: Story = JSON.parse(
      fs.readFileSync(join(cacheFolder, "stories", storyFile), "utf-8"),
    );
    for (const tag of story.tags) {
      if (!tagMap.has(tag)) {
        const newTag = await prisma.tag.create({
          data: { name: tag },
        });
        tagMap.set(tag, newTag.id);
      }
    }
  }

  for (const storyFile of Object.values(royalroadData)) {
    const story: Story = JSON.parse(
      fs.readFileSync(join(cacheFolder, "stories", storyFile), "utf-8"),
    );
    if (!story.author) {
      console.error("Story has no author", story.author);
      continue;
    }
    const createdAuthor = await prisma.user.upsert({
      where: { name: story.author },
      update: {},
      create: { email: story.author, name: story.author, password: "password" },
    });

    const fixedSummary = story.description
      .replaceAll("&nbsp;", "")
      .replace(/\n+/g, "\n\n")
      .substring(0, 65000);

    const storyData = await prisma.story.upsert({
      where: { royalRoadId: Number.parseInt(story.id) },
      update: {
        wordsPerWeek: story.isCompleted
          ? 0
          : story.wordsPerDay && story.chapters.length > 5
            ? story.wordsPerDay * 7
            : 0,
        coverArtAsset: story.cover?.includes("nocover") ? "" : "/cover.jpg",
        summary: fixedSummary,
        coverColor: story.color,
        coverTextColor: story.textColor,
        status: story.isCompleted ? "COMPLETED" : "ONGOING",
        type: story.isFanfiction ? "FANFICTION" : "ORIGINAL",
        pages: story.pages,
        royalRoadId: Number.parseInt(story.id),
      },
      create: {
        summary: fixedSummary,
        ownerId: createdAuthor.id,
        name: story.title,
        royalRoadId: Number.parseInt(story.id),
        wordsPerWeek: story.isCompleted
          ? 0
          : story.wordsPerDay && story.chapters.length > 5
            ? story.wordsPerDay * 7
            : 0,
        status: story.isCompleted ? "COMPLETED" : "ONGOING",
        type: story.isFanfiction ? "FANFICTION" : "ORIGINAL",
        published: true,
        pages: story.pages,
        coverArtAsset: story.cover?.includes("nocover") ? "" : "/cover.jpg",
        coverColor: story.color,
        coverTextColor: story.textColor,
      },
      include: { storyTags: true },
    });
    const storyTags: { tagId: string; storyId: string }[] = [];
    for (const tag of story.tags) {
      const tagId = tagMap.get(tag);
      if (!tagId) {
        console.error("Tag not found", tag);
        continue;
      }
      storyTags.push({
        tagId,
        storyId: storyData.id,
      });
    }

    const existingStoryTags = storyData.storyTags.map((tag) => tag.tagId);
    const newStoryTags = storyTags.filter(
      (tag) => !existingStoryTags.includes(tag.tagId),
    );
    await prisma.storyTag.createMany({
      data: newStoryTags,
    });

    try {
      if (story.cover && !story.cover.includes("nocover")) {
        const coverData = fs.readFileSync(
          `../reader/cache/royalroad/covers/${story.id}-${story.slug}.jpg`,
        );
        const sharpData = await sharp(coverData).metadata();
        const coverHash = createHash("sha256").update(coverData).digest("hex");
        const pathHash = createHash("sha256")
          .update("/cover.jpg")
          .digest("hex");
        const storagePath = `upload/${createdAuthor.id}/${storyData.id}/${pathHash}.jpg`;

        const existingFile = await prisma.file.findFirst({
          where: {
            ownerId: createdAuthor.id,
            storyId: storyData.id,
            path: storagePath,
          },
        });

        if (!existingFile || existingFile.sha256 !== coverHash) {
          await uploadFile(coverData, storagePath, "image/jpeg");
        }
        const result = await prisma.file.upsert({
          where: {
            path: storagePath,
            storyId: storyData.id,
          },
          create: {
            ownerId: createdAuthor.id,
            storyId: storyData.id,
            path: storagePath,
            localPath: "/cover.jpg",
            mimeType: "image/jpeg",
            width: sharpData.width,
            height: sharpData.height,
            bytes: sharpData.size,
            sha256: coverHash,
          },
          update: {
            mimeType: "image/jpeg",
            localPath: "/cover.jpg",
            width: sharpData.width,
            height: sharpData.height,
            bytes: sharpData.size,
            sha256: coverHash,
          },
        });
      }
    } catch (e) {
      console.error("Cover image does not exist", e.message);
    }
    bar1.increment();
  }
  bar1.stop();
};

insert();
