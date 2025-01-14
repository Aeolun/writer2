import axios from "axios";
import { DOMParser } from "@xmldom/xmldom";
import xpath, { select } from "xpath";
import fs from "fs";
import { createHash } from "crypto";
import sharp from "sharp";
import { join, parse } from "path";
import { colord } from "colord";
import { prisma } from "@writer/server/src/prisma";

const royalRoadUrl = "https://www.royalroad.com";
const pages = 4016;
const cacheFolder = "cache/royalroad/";

fs.mkdirSync(cacheFolder, {
  recursive: true,
});
fs.mkdirSync(join(cacheFolder, "covers"), {
  recursive: true,
});
fs.mkdirSync(join(cacheFolder, "stories"), {
  recursive: true,
});

const rgbToHex = (r: number, g: number, b: number) =>
  `#${[r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? `0${hex}` : hex;
    })
    .join("")}`;

const clearCacheCategory = (category: string) => {
  fs.rmSync(join(cacheFolder, category), { recursive: true, force: true });
};

const getPage = async (url: string, category: string, extension?: string) => {
  // create hash of url
  const hash = createHash("sha256").update(url).digest("hex");

  fs.mkdirSync(join(cacheFolder, category), { recursive: true });
  if (
    extension &&
    fs.existsSync(join(cacheFolder, category, `${hash}.${extension}`))
  ) {
    console.log(`Cache hit for ${url}`);
    return fs.readFileSync(
      join(cacheFolder, category, `${hash}.${extension}`),
      extension === "jpg" ? undefined : "utf-8",
    );
  }
  if (fs.existsSync(join(cacheFolder, category, hash))) {
    console.log(`Cache hit for ${url}`);
    return fs.readFileSync(
      join(cacheFolder, category, hash),
      extension === "jpg" ? undefined : "utf-8",
    );
  }
  console.log(`Cache miss for ${url}`);
  const response = await axios.get(url, {
    responseType: extension === "jpg" ? "arraybuffer" : undefined,
  });
  if (response.data) {
    console.log(`Writing ${url} to cache`);
    fs.writeFileSync(
      join(cacheFolder, category, extension ? `${hash}.${extension}` : hash),
      response.data instanceof Buffer ? response.data : response.data,
    );
  }
  return response.data;
};

const selectNodes = (xpathString: string, node: Node) => {
  return xpath.select(xpathString, node) as Node[];
};

const selectString = (xpathString: string, node: Node) => {
  return xpath.select1(xpathString, node)?.nodeValue as string | undefined;
};

const retrieve = async () => {
  // get existing result first
  const existingResult = fs.existsSync("royalroad.json")
    ? JSON.parse(fs.readFileSync("royalroad.json", "utf-8"))
    : {};

  //await clearCacheCategory("list");

  const result: Record<string, object | string> = existingResult;

  label: for (let i = 1; i < pages; i++) {
    console.log(`Page ${i}`);
    const page = await getPage(
      `${royalRoadUrl}/fictions/search?orderBy=release_date&page=${i}`,
      "list",
    );
    const doc = new DOMParser({
      errorHandler: () => {
        // ignore errors
      },
    }).parseFromString(page);
    console.log("Got index page");
    const nodes = selectNodes("//div[@class='row fiction-list-item']", doc);

    for (const node of nodes) {
      try {
        const title = selectString(
          ".//h2[@class='fiction-title']/a/text()",
          node,
        );
        const url = selectString(".//h2[@class='fiction-title']/a/@href", node);
        const fictionId = url?.split("/")?.[2];
        const exists = await prisma.story.findUnique({
          where: {
            id: fictionId,
          },
        });
        if (exists) {
          console.log(`Imported new stories up to ${fictionId}`);
          break label;
        }
        const bookPage = await getPage(`${royalRoadUrl}${url}`, "fiction");
        const bookDoc = new DOMParser({
          errorHandler: () => {
            // ignore errors
          },
        }).parseFromString(bookPage);
        console.log(`Got book page for ${title}`);
        const author = selectString(
          ".//h4[@class='font-white']/span/a/text()",
          bookDoc,
        );

        const descriptionParagraphs = selectNodes(
          ".//div[@class='description']//p",
          bookDoc,
        );
        const description = descriptionParagraphs
          .filter(
            (p) =>
              p.textContent?.trim() !== "" &&
              p.textContent?.trim() !== "&nbsp;",
          )
          .map((p) => p.toString()) // Use toString() to get HTML content
          .join("\n");

        const defaultLabels = selectNodes(
          "//span[contains(@class, 'label-default')]/text()",
          bookDoc,
        );

        const isFanfiction = defaultLabels.some((label) =>
          label.textContent?.includes("Fan Fiction"),
        );
        const isCompleted = defaultLabels.some((label) =>
          label.textContent?.includes("COMPLETED"),
        );

        const tags: string[] = [];
        const tagsNodes = selectNodes(
          ".//a[contains(@class, 'fiction-tag')]",
          bookDoc,
        );
        for (const tagNode of tagsNodes) {
          tags.push(tagNode.textContent?.trim() ?? "");
        }

        let cover = selectString(".//img[@data-type='cover']/@src", bookDoc);
        let color = "#000000";
        let textColor = "#FFFFFF";
        if (!url) {
          continue;
        }
        const fictionSlug = url.replace("/fiction/", "").replaceAll("/", "-");
        console.log({
          cover,
          url,
          nocover: cover?.includes("nocover"),
        });
        if (cover && url && !cover.includes("nocover")) {
          let coverData: Buffer;
          try {
            coverData = await getPage(
              cover.replace("covers-full", "covers-large"),
              "cover",
              "jpg",
            );
          } catch (e) {
            coverData = await getPage(cover, "cover", "jpg");
          }

          fs.writeFileSync(
            join(cacheFolder, "covers", `${fictionSlug}.jpg`),
            coverData,
          );

          const { dominant } = await sharp(coverData).stats();
          const { r, g, b } = dominant;
          textColor = colord(`rgb(${r}, ${g}, ${b})`).isDark()
            ? "#FFFFFF"
            : "#000000";
          color = rgbToHex(r, g, b);
        } else {
          cover = undefined;
        }
        // const author = selectNodes(
        //   "//div[@class='fiction-list-item__author']/a",
        //   node,
        // )[0]?.textContent;

        const pagesNode = selectNodes(
          ".//div[@class='col-sm-6 uppercase bold font-blue-dark']",
          node,
        )[2];

        const pages = Number.parseInt(
          pagesNode?.textContent
            ?.trim()
            .replace(" Pages", "")
            .replaceAll(",", "") ?? "0",
        );

        let chapters: {
          id: number;
          title: string;
          date: string;
        }[] = [];
        let volumes: {
          id: number;
          cover: string;
          title: string;
          order: number;
        }[] = [];
        const scriptTags = selectNodes("//script", bookDoc);
        for (const scriptTag of scriptTags) {
          const scriptContent = scriptTag.textContent;
          if (scriptContent?.includes("window.fictionCover =")) {
            const [before, after] = scriptContent.split("window.chapters = ");

            const chapterString = after.split(/;\s+window.volumes/);
            if (chapterString.length > 1) {
              chapters = JSON.parse(chapterString[0]);
            } else {
              throw new Error("Failed to split chapters");
            }

            const [beforeVolumes, afterVolumes] =
              after.split("window.volumes = ");
            const volumeString = afterVolumes.split(
              /;\s+window.readingProgress/,
            );
            if (volumeString.length > 1) {
              volumes = JSON.parse(volumeString[0]);

              if (volumes.length > 0) {
                for (const volume of volumes) {
                  // get cover for each volume
                  const coverUrl = volume.cover;
                  if (coverUrl.includes("nocover")) {
                    continue;
                  }
                  const coverData = await getPage(coverUrl, "cover", "jpg");
                  fs.writeFileSync(
                    join(
                      cacheFolder,
                      "covers",
                      `${fictionSlug}-volume-${volume.id}.jpg`,
                    ),
                    coverData,
                  );
                }
              }
            }
          }
        }

        const words = pages * 275;
        const firstChapter = chapters[0];
        const lastChapter = chapters[chapters.length - 1];
        const daysBetweenFirstAndLastChapter =
          firstChapter && lastChapter
            ? Math.max(
                (new Date(lastChapter.date).getTime() -
                  new Date(firstChapter.date).getTime()) /
                  (1000 * 60 * 60 * 24),
                7,
              )
            : 0;
        const wordsPerDay =
          daysBetweenFirstAndLastChapter > 7
            ? words / daysBetweenFirstAndLastChapter
            : words / 7; // assume one chapter per week if only single one

        // console.log({
        //   wordsPerDay,
        //   daysBetweenFirstAndLastChapter,
        //   chapters: chapters.length,
        //   words,
        //   firstChapterDate: firstChapter.date,
        //   lastChapterDate: lastChapter.date,
        // });

        const [, category, id, slug] = url?.split("/") ?? [];

        const story = {
          id,
          category,
          isFanfiction,
          isCompleted,
          tags,
          slug,
          title,
          description,
          wordsPerDay,
          url,
          author,
          color,
          textColor,
          pages,
          cover,
          chapters,
          volumes,
        };
        fs.writeFileSync(
          join(cacheFolder, "stories", `${id}-${fictionSlug}.json`),
          JSON.stringify(story, null, 2),
        );
        result[id] = `${id}-${fictionSlug}.json`;
      } catch (e) {
        console.error(e);
      }
    }
    fs.writeFileSync("royalroad.json", JSON.stringify(result, null, 2));
    console.log(`Persisted ${Object.keys(result).length} stories`);
  }
};
retrieve();
