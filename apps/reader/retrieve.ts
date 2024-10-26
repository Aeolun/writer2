import axios from "axios";
import { DOMParser } from "@xmldom/xmldom";
import xpath, { select } from "xpath";
import fs from "fs";
import { createHash } from "crypto";
import sharp from "sharp";
import { join, parse } from "path";
import { colord } from "colord";

const royalRoadUrl = "https://www.royalroad.com";
const pages = 446;
const cacheFolder = "cache/royalroad/";

fs.mkdirSync(cacheFolder, {
  recursive: true,
});
fs.mkdirSync(join(cacheFolder, "covers"), {
  recursive: true,
});

const rgbToHex = (r: number, g: number, b: number) =>
  "#" +
  [r, g, b]
    .map((x) => {
      const hex = x.toString(16);
      return hex.length === 1 ? "0" + hex : hex;
    })
    .join("");

const getPage = async (url: string, extension?: string) => {
  // create hash of url
  const hash = createHash("sha256").update(url).digest("hex");

  if (extension && fs.existsSync(join(cacheFolder, hash + "." + extension))) {
    return fs.readFileSync(
      join(cacheFolder, hash + "." + extension),
      extension === "jpg" ? undefined : "utf-8",
    );
  } else if (fs.existsSync(join(cacheFolder, hash))) {
    return fs.readFileSync(
      join(cacheFolder, hash),
      extension === "jpg" ? undefined : "utf-8",
    );
  }

  const response = await axios.get(url, {
    responseType: extension === "jpg" ? "arraybuffer" : undefined,
  });
  fs.writeFileSync(
    join(cacheFolder, extension ? hash + "." + extension : hash),
    response.data,
  );
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
    : [];

  const result: object[] = existingResult;

  for (let i = 1; i < pages; i++) {
    console.log(`Page ${i}`);
    const page = await getPage(
      `${royalRoadUrl}/fictions/weekly-popular?page=${i}`,
    );
    const doc = new DOMParser({
      errorHandler: () => {
        // ignore errors
      },
    }).parseFromString(page);
    console.log("Got index page");
    const nodes = selectNodes("//div[@class='fiction-list-item row']", doc);

    for (const node of nodes) {
      const title = selectString(
        ".//h2[@class='fiction-title']/a/text()",
        node,
      );
      const url = selectString(".//h2[@class='fiction-title']/a/@href", node);
      const bookPage = await getPage(`${royalRoadUrl}${url}`);
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
            p.textContent?.trim() !== "" && p.textContent?.trim() !== "&nbsp;",
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

      let cover = selectString(".//img[@class='img-responsive']/@src", node);
      let color = "#000000";
      let textColor = "#FFFFFF";
      if (!url) {
        continue;
      }
      const fictionSlug = url.replace("/fiction/", "").replaceAll("/", "-");
      if (cover && url && !cover.includes("nocover")) {
        let coverData: Buffer;
        try {
          coverData = await getPage(
            cover.replace("covers-full", "covers-large"),
            "jpg",
          );
        } catch (e) {
          coverData = await getPage(cover, "jpg");
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

      const pages = parseInt(
        selectNodes(
          ".//div[@class='col-sm-6 uppercase bold font-blue-dark']",
          node,
        )[2]
          ?.textContent?.trim()
          .replace(" Pages", "")
          .replaceAll(",", "") ?? "0",
      );

      let chapters: object[] = [];
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
          //console.log("scriptContent", scriptContent);
          const [before, after] = scriptContent.split("window.chapters = ");

          const chapterString = after.split(/;\s+window.volumes/);
          if (chapterString.length > 1) {
            chapters = JSON.parse(chapterString[0]);
          } else {
            throw new Error("Failed to split chapters");
          }

          const [beforeVolumes, afterVolumes] =
            after.split("window.volumes = ");
          const volumeString = afterVolumes.split(/;\s+window.readingProgress/);
          if (volumeString.length > 1) {
            volumes = JSON.parse(volumeString[0]);

            if (volumes.length > 0) {
              for (const volume of volumes) {
                // get cover for each volume
                const coverUrl = volume.cover;
                if (coverUrl.includes("nocover")) {
                  continue;
                }
                const coverData = await getPage(coverUrl, "jpg");
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

      const [, category, id, slug] = url?.split("/") ?? [];

      result.push({
        id,
        category,
        isFanfiction,
        isCompleted,
        tags,
        slug,
        title,
        description,
        url,
        author,
        color,
        textColor,
        pages,
        cover,
        chapters,
        volumes,
      });
    }
    fs.writeFileSync("royalroad.json", JSON.stringify(result, null, 2));
    console.log(`Persisted ${result.length} stories`);
  }
};
retrieve();
