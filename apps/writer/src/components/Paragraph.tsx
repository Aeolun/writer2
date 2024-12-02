import { AiOutlineCheck, AiOutlineDelete } from "solid-icons/ai";
import type { SceneParagraph } from "../../../shared/src/schema.ts";
import { currentScene } from "../lib/stores/retrieval/current-scene.ts";
import {
  createSceneParagraph,
  moveParagraphDown,
  moveParagraphUp,
  scenesState,
  updateSceneParagraphData,
  updateSceneSelectedParagraph,
} from "../lib/stores/scenes.ts";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { Row } from "./Row";
import { StoryParagraphButtons } from "./StoryParagraphButtons";
import { ParagraphDetails } from "./ParagraphDetails.tsx";
import { findPathToNode } from "../lib/stores/tree.ts";
import { Editor } from "./editor/Editor.tsx";
import shortUUID from "short-uuid";
import { FiArrowDown, FiArrowUp, FiPlus } from "solid-icons/fi";

const statusColor: Record<SceneParagraph["state"], string> = {
  draft: "border-yellow-500",
  revise: "border-red-500",
  sdt: "border-blue-500",
  final: "border-green-500",
  ai: "border-purple-500",
};

export const Paragraph = (props: {
  sceneId: string;
  paragraph: SceneParagraph;
  identifyLocation?: boolean;
}) => (
  <>
    {props.identifyLocation ? (
      <div class="px-4 w-full breadcrumbs">
        <ul>
          {findPathToNode(props.sceneId).map((n) => (
            <li>{n.name}</li>
          ))}
          <li>
            Paragraph{" "}
            {scenesState.scenes[props.sceneId].paragraphs.findIndex(
              (p) => p.id === props.paragraph.id,
            ) + 1}
          </li>
        </ul>
      </div>
    ) : null}
    <Row
      selected={currentScene()?.selectedParagraph === props.paragraph.id}
      onMouseDown={() => {
        updateSceneSelectedParagraph(props.sceneId, props.paragraph.id);
      }}
      borderColor={statusColor[props.paragraph.state] ?? undefined}
      main={
        <>
          {currentScene()?.selectedParagraph === props.paragraph.id ? (
            <>
              <div class="absolute top-[-0.5em] right-0">
                <button
                  type="button"
                  class="btn btn-xs py-0 px-1"
                  onClick={() => {
                    createSceneParagraph(
                      props.sceneId,
                      {
                        id: shortUUID.generate(),
                        text: "",
                        state: "draft",
                        comments: [],
                      },
                      props.paragraph.id,
                    );
                  }}
                >
                  <FiPlus />
                </button>
                <button
                  type="button"
                  class="btn btn-xs py-0 px-1"
                  onClick={() => {
                    moveParagraphUp(props.sceneId, props.paragraph.id);
                  }}
                >
                  <FiArrowUp />
                </button>
              </div>
              <div class="absolute bottom-[-0.5em] right-0 z-10">
                <button
                  type="button"
                  class="btn btn-xs py-0 px-1"
                  onClick={() => {
                    moveParagraphDown(props.sceneId, props.paragraph.id);
                  }}
                >
                  <FiArrowDown />
                </button>
                <button
                  type="button"
                  class="btn btn-xs py-0 px-1"
                  onClick={() => {
                    createSceneParagraph(
                      props.sceneId,
                      {
                        id: shortUUID.generate(),
                        text: "",
                        state: "draft",
                        comments: [],
                      },
                      props.paragraph.id,
                    );
                  }}
                >
                  <FiPlus />
                </button>
              </div>
            </>
          ) : null}
          <Editor
            onChange={(data) => {
              updateSceneParagraphData(props.sceneId, props.paragraph.id, {
                text: data,
              });
            }}
            defaultValue={props.paragraph.text}
          />
          {/* <AutoResizeTextarea
                  id={`p_${props.paragraph.id}`}
                  value={props.paragraph.text}
                  onMouseUp={(e) => {
                    updateSceneCursor(
                      props.sceneId,
                      (e.target as HTMLTextAreaElement).selectionStart,
                    );
                  }}
                  onInput={(e, selectionStart) => {
                    console.log("input", e.target?.value);
                    updateSceneParagraphData(props.sceneId, props.paragraph.id, {
                      text: e.target?.value ?? "",
                    });
                    updateSceneCursor(props.sceneId, selectionStart);
                    console.log("input", selectionStart);
                  }}
                  onFocus={(e) => {
                    updateSceneSelectedParagraph(props.sceneId, props.paragraph.id);
                    setTimeout(() => {
                      console.log(
                        "focus",
                        e.target.selectionStart,
                        props.paragraph.id,
                      );
                      updateSceneCursor(
                        props.sceneId,
                        (e.target as HTMLTextAreaElement).selectionStart,
                      );
                    }, 0);
                  }}
                  onKeyDown={(e) => {
                    const pe = document.getElementById(
                      `p_${props.paragraph.id}`,
                    ) as HTMLTextAreaElement;
                    if (e.key === "Enter" && e.ctrlKey) {
                      const newId = splitParagraphFromCursor(props.sceneId);
    
                      setTimeout(() => {
                        const newElement = document.getElementById(
                          `p_${newId}`,
                        ) as HTMLTextAreaElement;
                        newElement?.focus();
                      }, 0);
                      e.preventDefault();
                    } else if (e.key === "Backspace" && e.altKey) {
                      //focus previous paragraph
                      const previousParagraph =
                        scenesState.scenes[props.sceneId].paragraphs[
                          scenesState.scenes[props.sceneId].paragraphs.findIndex(
                            (p) => p.id === props.paragraph.id,
                          ) - 1
                        ];
                      if (previousParagraph) {
                        const previousElement = document.getElementById(
                          `p_${previousParagraph.id}`,
                        ) as HTMLTextAreaElement;
    
                        previousElement.scrollIntoView({
                          behavior: "instant",
                          block: "center",
                        });
                        previousElement?.focus();
                      }
                      removeSceneParagraph(props.sceneId, props.paragraph.id);
    
                      e.preventDefault();
                      e.stopPropagation();
                    } else if (e.key === "Backspace" && e.ctrlKey) {
                      console.log("join backwards");
                      //focus previous paragraph
                      const previousParagraph =
                        scenesState.scenes[props.sceneId].paragraphs[
                          scenesState.scenes[props.sceneId].paragraphs.findIndex(
                            (p) => p.id === props.paragraph.id,
                          ) - 1
                        ];
                      joinBackwards(props.sceneId);
                      if (previousParagraph) {
                        const previousElement = document.getElementById(
                          `p_${previousParagraph.id}`,
                        ) as HTMLTextAreaElement;
                        previousElement?.focus();
                        previousElement.scrollIntoView({
                          behavior: "instant",
                          block: "center",
                        });
                      }
                      e.preventDefault();
                      e.stopPropagation();
                    } else if (e.key === "ArrowUp" && e.shiftKey && e.ctrlKey) {
                      moveParagraphUp(props.sceneId, props.paragraph.id);
                      e.preventDefault();
                      e.stopPropagation();
                    } else if (e.key === "ArrowDown" && e.shiftKey && e.ctrlKey) {
                      moveParagraphDown(props.sceneId, props.paragraph.id);
                      e.preventDefault();
                      e.stopPropagation();
                    } else if (
                      e.key === "ArrowDown" &&
                      pe.selectionStart === pe.value.length
                    ) {
                      const currentParagraphIndex = scenesState.scenes[
                        props.sceneId
                      ].paragraphs.findIndex((p) => p.id === props.paragraph.id);
                      const nextParagraph =
                        scenesState.scenes[props.sceneId].paragraphs[
                          currentParagraphIndex + 1
                        ];
                      if (nextParagraph) {
                        const nextElement = document.getElementById(
                          `p_${nextParagraph.id}`,
                        ) as HTMLTextAreaElement;
                        if (nextElement) {
                          nextElement.setSelectionRange(0, 0);
                          nextElement.focus();
                        }
                      }
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle ArrowDown logic
                    } else if (e.key === "ArrowUp" && pe.selectionStart === 0) {
                      const currentParagraphIndex = scenesState.scenes[
                        props.sceneId
                      ].paragraphs.findIndex((p) => p.id === props.paragraph.id);
                      const previousParagraph =
                        scenesState.scenes[props.sceneId].paragraphs[
                          currentParagraphIndex - 1
                        ];
                      if (previousParagraph) {
                        const previousElement = document.getElementById(
                          `p_${previousParagraph.id}`,
                        ) as HTMLTextAreaElement;
                        if (previousElement) {
                          previousElement.setSelectionRange(
                            previousElement.value.length,
                            previousElement.value.length,
                          );
                          previousElement.focus();
                        }
                      }
                      e.preventDefault();
                      e.stopPropagation();
                      // Handle ArrowUp logic
                    }
                  }}
                /> */}
          {props.paragraph.translation ? (
            <div class="px-8 text-indent-1em font-noteworthy">
              {props.paragraph.translation}
            </div>
          ) : null}
        </>
      }
      buttons={
        props.paragraph.id === currentScene()?.selectedParagraph ? (
          <StoryParagraphButtons
            paragraphId={props.paragraph.id}
            scene={currentScene()}
          />
        ) : (
          <div class="min-h-18 w-32" />
        )
      }
      extra={
        props.paragraph.extraLoading ? (
          <div class="flex flex-col p-2 gap-2 items-center justify-start h-full">
            <div class="skeleton h-4 w-full" />
            <div class="skeleton h-4 w-full" />
            <div class="skeleton h-4 w-full" />
          </div>
        ) : props.paragraph.extra ? (
          <>
            <div class="absolute top-4 right-2 flex gap-2 bg-opacity-80 border border-gray-200 bg-white p-2 rounded-full">
              <button
                type="button"
                class="hover:text-green-500"
                onClick={() => {
                  updateSceneParagraphData(props.sceneId, props.paragraph.id, {
                    text: props.paragraph.extra,
                    extra: "",
                  });
                }}
              >
                <AiOutlineCheck />
              </button>
              <button
                type="button"
                class="hover:text-red-500"
                onClick={() => {
                  updateSceneParagraphData(props.sceneId, props.paragraph.id, {
                    extra: "",
                  });
                }}
              >
                <AiOutlineDelete />
              </button>
            </div>
            <AutoResizeTextarea
              onInput={(e) => {
                updateSceneParagraphData(props.sceneId, props.paragraph.id, {
                  extra: e.currentTarget.value,
                });
              }}
              value={props.paragraph.extra}
            />
          </>
        ) : null
      }
    />
    <Row
      borderColor={statusColor[props.paragraph.state] ?? undefined}
      selected={currentScene()?.selectedParagraph === props.paragraph.id}
      main={
        <ParagraphDetails sceneId={props.sceneId} paragraph={props.paragraph} />
      }
    />
  </>
);
