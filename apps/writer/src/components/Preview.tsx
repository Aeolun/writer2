import { writeTextFile } from "@tauri-apps/plugin-fs";
import markdownit from "markdown-it";
import { open } from "@tauri-apps/plugin-dialog";
import { sortedObjects } from "../lib/stores/retrieval/sorted-objects";
import { uiState } from "../lib/stores/ui";
import { createEffect, createSignal } from "solid-js";
import { updateSceneParagraphData } from "../lib/stores/scenes";

const md = markdownit({
  html: true,
  typographer: true,
});

export const Preview = () => {
  const text = sortedObjects(uiState.currentId)
    .map((item) => {
      if (item.type === "paragraph") {
        return `${md.render(item.text.trim())}`;
      }
      if (item.type === "chapter_header") {
        return `<h1>${item.text}</h1>`;
      }
      if (item.type === "break") {
        return `<div><img style="margin: 2em auto; display: block;" src="https://pub-43e7e0f137a34d1ca1ce3be7325ba046.r2.dev/Group.png" /></div>`;
      }
      return undefined;
    })
    .filter((i) => i)
    .join("\n");

  const [typstText, setTypstText] = createSignal("");
  createEffect(() => {
    const process = async () => {
      const contentText = await Promise.all(
        sortedObjects(uiState.currentId).map(async (item) => {
          if (item.type === "paragraph") {
            return `${item.text
              .replace("* * *", "#line(length: 100%)")
              .replaceAll("#", "\\#")
              .replaceAll("$", "\\$")
              .replaceAll("@", "\\@")
              .replace(/^\* /gm, "- ")
              .replace(/_{2,}/g, "`--`")}\n`;
          }
          if (item.type === "chapter_header") {
            return `= ${item.text}\n`;
          }
          if (item.type === "break") {
            return `#align(center)[\n  #image("public/Group.png", width: 50%)\n]\n`;
          }
          return undefined;
        }),
      ).then((i) => {
        return i.filter((i) => i).join("\n");
      });
      const newTypstText = `#import "@preview/cmarker:0.1.0"
#set text(
  font: "New Computer Modern",
  size: 10pt
)
#set page(
  paper: "a5",
  margin: (x: 1.8cm, y: 1.5cm),
)
#set heading(numbering: "1.a)")
#set par(
  justify: true,
  leading: 0.52em,
  first-line-indent: 1em,
)\n\n${contentText}`;
      setTypstText(newTypstText);
    };
    process();
  });

  const [tab, setTab] = createSignal(0);

  return (
    <div class="flex flex-col h-full w-full">
      <div class="flex w-full tabs tabs-bordered">
        <button
          class={`tab ${tab() === 0 ? "tab-active" : ""}`}
          type="button"
          onClick={() => setTab(0)}
        >
          HTML Source
        </button>
        <button
          class={`tab ${tab() === 1 ? "tab-active" : ""}`}
          type="button"
          onClick={() => setTab(1)}
        >
          Typst Source
        </button>
        <button
          class={`tab ${tab() === 2 ? "tab-active" : ""}`}
          type="button"
          onClick={() => setTab(2)}
        >
          Rendered
        </button>
      </div>
      <div class="flex-1 overflow-y-auto px-4 py-2">
        {tab() === 0 && (
          <div>
            <p>Designed for easy copying to the place you publish</p>
            <textarea
              class="textarea textarea-bordered"
              id={"preview"}
              rows={10}
              value={text}
              onClick={() => {
                //select all
                setTimeout(() => {
                  const textarea: HTMLTextAreaElement | null =
                    document.querySelector("#preview");
                  if (textarea) {
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    navigator.clipboard.writeText(textarea.value);
                  }
                }, 0);
              }}
            />
          </div>
        )}
        {tab() === 1 && (
          <div>
            <p>Designed for easy rendering to PDF/HTML/Markdown</p>
            <textarea
              class="textarea textarea-bordered"
              id={"preview_typst"}
              rows={10}
              value={typstText()}
              onClick={() => {
                //select all
                setTimeout(() => {
                  const textarea: HTMLTextAreaElement | null =
                    document.querySelector("#preview_typst");
                  if (textarea) {
                    textarea.select();
                    textarea.setSelectionRange(0, 99999);
                    navigator.clipboard.writeText(textarea.value);
                  }
                }, 0);
              }}
            />
            <button
              class="btn btn-primary"
              type="button"
              onClick={async () => {
                const savePath = await open({
                  multiple: false,
                  directory: false,
                });
                if (savePath) {
                  await writeTextFile(savePath.path, typstText());
                }
              }}
            >
              Save
            </button>
          </div>
        )}
        {tab() === 2 && (
          <div>
            <div class="max-w-xl m-auto">
              {sortedObjects(uiState.currentId).map((scene) => {
                if (scene.type === "summary") {
                  return (
                    <div class="p-4 my-2 bg-base-300">
                      Words: {scene.words}, TTS Cost:{" "}
                      {((scene.words * 6) / 1_000_000) * 15} AI Words:{" "}
                      {scene.aiWords}, Books: {scene.books}, Chapters:{" "}
                      {scene.chapters}, Scenes: {scene.scenes}, Reading time:{" "}
                      {Math.round(
                        ((scene.words + scene.aiWords) / 14280) * 100,
                      ) / 100}{" "}
                      hours
                    </div>
                  );
                }
                if (scene.type === "chapter_header") {
                  return (
                    <h1 class="w-full text-center text-xl">{scene.text}</h1>
                  );
                }
                if (scene.type === "break") {
                  return (
                    <div class="my-12 m-auto flex justify-center">
                      <img
                        alt={"break"}
                        src={
                          "https://pub-43e7e0f137a34d1ca1ce3be7325ba046.r2.dev/Group.png"
                        }
                      />
                    </div>
                  );
                }
                if (scene.type === "paragraph") {
                  return (
                    <div
                      class={`relative font-serif font-medium indent-4 my-2 ${
                        scene.state === "sdt"
                          ? "text-purple-500"
                          : scene.state === "revise"
                            ? "text-red-500"
                            : scene.posted
                              ? "text-gray-600"
                              : undefined
                      }`}
                    >
                      {scene.text ? scene.text.replaceAll("--", "—") : null}
                      <div class="absolute flex gap-2 items-center select-none hidden group-hover:flex">
                        <button
                          type="button"
                          class="btn btn-xs"
                          title={"Revise"}
                          onClick={() => {
                            updateSceneParagraphData(
                              scene.sceneId,
                              scene.paragraphId,
                              {
                                state: "revise",
                              },
                            );
                          }}
                        >
                          R
                        </button>
                        <button
                          type="button"
                          class="btn btn-xs"
                          title={"Show don't tell"}
                          onClick={() => {
                            updateSceneParagraphData(
                              scene.sceneId,
                              scene.paragraphId,
                              { state: "sdt" },
                            );
                          }}
                        >
                          SDT
                        </button>
                      </div>
                    </div>
                  );
                }
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
