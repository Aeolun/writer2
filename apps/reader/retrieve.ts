import axios from "axios";
import { DOMParser } from "@xmldom/xmldom";
import xpath from "xpath";
import fs from "fs";
import { createHash } from "crypto";
import sharp from "sharp";
import { join, parse } from "path";
import { colord } from "colord";

const royalRoadUrl = "https://www.royalroad.com";
const pages = 16;
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
  const result: object[] = [];

  for (let i = 1; i < pages; i++) {
    console.log(`Page ${i}`);
    const page = await getPage(`${royalRoadUrl}/fictions/best-rated?page=${i}`);
    const doc = new DOMParser({
      errorHandler: () => {
        // ignore errors
      },
    }).parseFromString(page);
    console.log("still finished");
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
      const author = selectString(
        ".//h4[@class='font-white']/span/a/text()",
        bookDoc,
      );

      const cover = selectString(".//img[@class='img-responsive']/@src", node);
      let color = "#000000";
      let textColor = "#FFFFFF";
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
          join(
            cacheFolder,
            "covers",
            `${url.replace("/fiction/", "").replaceAll("/", "-")}.jpg`,
          ),
          coverData,
        );

        const { dominant } = await sharp(coverData).stats();
        const { r, g, b } = dominant;
        textColor = colord(`rgb(${r}, ${g}, ${b})`).isDark()
          ? "#FFFFFF"
          : "#000000";
        color = rgbToHex(r, g, b);
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

      const [, category, id, slug] = url?.split("/") ?? [];

      result.push({
        id,
        category,
        slug,
        title,
        url,
        author,
        color,
        textColor,
        pages,
        cover,
      });
    }
  }

  fs.writeFileSync("royalroad.json", JSON.stringify(result, null, 2));
};
retrieve();
