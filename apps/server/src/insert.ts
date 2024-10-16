import { prisma } from "./prisma";
import { createHash } from "crypto";
import fs from "fs";
import { uploadFile } from "./util/file-storage";
import sharp from "sharp";
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
  url: string;
  author: string;
  color: string;
  textColor: string;
  pages: number;
  cover: string;
  chapters: Chapter[];
  volumes: Volume[];
}

const cliProgress = require("cli-progress");

// create a new progress bar instance and use shades_classic theme
const bar1 = new cliProgress.SingleBar({}, cliProgress.Presets.shades_classic);

const royalroadData: Story[] = require("../../reader/royalroad.json");

// start the progress bar with a total value of 200 and start value of 0
bar1.start(royalroadData.length, 0);

const insert = async () => {
  for (const story of royalroadData) {
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
      where: { royalRoadId: parseInt(story.id) },
      update: {
        coverArtAsset: "/cover.jpg",
        summary: fixedSummary,
        coverColor: story.color,
        pages: story.pages,
        royalRoadId: parseInt(story.id),
        coverTextColor: story.textColor,
      },
      create: {
        summary: fixedSummary,
        ownerId: createdAuthor.id,
        name: story.title,
        royalRoadId: parseInt(story.id),
        published: true,
        pages: story.pages,
        coverArtAsset: "/cover.jpg",
        coverColor: story.color,
        coverTextColor: story.textColor,
      },
    });

    try {
      const coverData = fs.readFileSync(
        `../reader/cache/royalroad/covers/${story.id}-${story.slug}.jpg`,
      );
      const sharpData = await sharp(coverData).metadata();
      const coverHash = createHash("sha256").update(coverData).digest("hex");
      const pathHash = createHash("sha256").update("/cover.jpg").digest("hex");
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
    } catch (e) {
      console.error("Cover image does not exist", e.message);
    }
    bar1.increment();
  }
  bar1.stop();
};

insert();
