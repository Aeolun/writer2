import { protectedProcedure } from "../trpc.js";
import z from "zod";
import { chromium } from "playwright";
import { prisma } from "../prisma.js";

export const publishToRoyalRoad = protectedProcedure
  .input(
    z.object({
      username: z.string(),
      password: z.string(),
      chapterId: z.string(),
    }),
  )
  .mutation(async ({ input, ctx }) => {
    try {
      const browser = await chromium.launch();
      const page = await browser.newPage();

      const chapter = await prisma.chapter.findUnique({
        where: {
          id: input.chapterId,
          book: {
            story: {
              ownerId: ctx.authenticatedUser.id,
            },
          },
        },
        select: {
          royalRoadId: true,
          name: true,
          scenes: {
            orderBy: { sortOrder: "asc" },
            include: {
              paragraphs: {
                orderBy: { sortOrder: "asc" },
                include: {
                  paragraphRevisions: {
                    orderBy: { createdAt: "desc" },
                    distinct: ["paragraphId"],
                    select: {
                      id: true,
                      body: true,
                      createdAt: true,
                    },
                  },
                },
              },
            },
          },
        },
      });

      // Navigate to the login page
      await page.goto("https://www.royalroad.com/account/login");
      await page.fill('input[type="email"]', input.username);
      await page.fill('input[type="password"]', input.password);
      await page.click('button[type="submit"]');
      await page.waitForURL("https://www.royalroad.com/home");

      if (!chapter?.royalRoadId) {
        throw new Error("No royal road id found for chapter");
      }
      // Navigate to the chapter edit page
      const response = await page.goto(
        `https://www.royalroad.com/author-dashboard/chapters/edit/${chapter?.royalRoadId}`,
      );
      // check response code
      if (response?.status() !== 200) {
        throw new Error("Failed to login to Royal Road");
      }
      await page.waitForSelector("#Title");

      // Fill in the chapter details
      await page.fill("#Title", chapter.name);

      const content = chapter.scenes.flatMap((scene) =>
        scene.paragraphs.flatMap((paragraph) =>
          paragraph.paragraphRevisions.map(
            (revision) => `<p>${revision.body}</p>`,
          ),
        ),
      );
      // click source code button on chapter content
      //xpath selector

      await page
        .locator(
          'xpath=//div[class="tox tox-tinymce"][2]//button[title="Source Code"]',
        )
        .click();

      await page.waitForTimeout(1000);
      await page.fill(".tox-dialog-wrap .tox-textarea", content.join("\n"));

      // Submit the chapter
      await page.getByLabel("Save").click();
      await page.getByLabel("Save Changes");

      console.log("Chapter published successfully!");
      await browser.close();
      return { success: true };
    } catch (e) {
      console.error("Failed to publish chapter:", e);
      return { success: false, error: e?.toString() };
    }
  });
