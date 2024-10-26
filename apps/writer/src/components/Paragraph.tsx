import { AiOutlineCheck, AiOutlineDelete } from "solid-icons/ai";
import type { SceneParagraph } from "../../../shared/src/schema.ts";
import { currentScene } from "../lib/stores/retrieval/current-scene.ts";
import {
  scenesState,
  updateSceneCursor,
  updateSceneData,
  updateSceneParagraphData,
  updateSceneSelectedParagraph,
} from "../lib/stores/scenes.ts";
import { AutoResizeTextarea } from "./AutoResizeTextarea";
import { Row } from "./Row";
import { StoryParagraphButtons } from "./StoryParagraphButtons";
import { ParagraphDetails } from "./ParagraphDetails.tsx";
import { findPathToNode } from "../lib/stores/tree.ts";

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
}) => {
  return (
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
        onClick={() => {
          updateSceneSelectedParagraph(props.sceneId, props.paragraph.id);
        }}
        selected={currentScene()?.selectedParagraph === props.paragraph.id}
        borderColor={statusColor[props.paragraph.state] ?? undefined}
        main={
          <>
            <AutoResizeTextarea
              id={`p_${props.paragraph.id}`}
              value={props.paragraph.text}
              onInput={(e) => {
                updateSceneParagraphData(props.sceneId, props.paragraph.id, {
                  text: e.currentTarget.value,
                });
              }}
              onFocus={(e) => {
                console.log("selectionstart on focus", e.target.selectionStart);
                updateSceneCursor(props.sceneId, e.target.selectionStart);
              }}
              onKeyDown={(e) => {
                const pe = document.getElementById(
                  `p_${props.paragraph.id}`,
                ) as HTMLTextAreaElement;
                if (e.key === "Enter" && e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "Backspace" && e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowUp" && e.shiftKey && e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                } else if (e.key === "ArrowDown" && e.shiftKey && e.ctrlKey) {
                  e.preventDefault();
                  e.stopPropagation();
                } else if (
                  e.key === "ArrowDown" &&
                  pe.selectionStart === pe.value.length
                ) {
                  // Handle ArrowDown logic
                } else if (e.key === "ArrowUp" && pe.selectionStart === 0) {
                  // Handle ArrowUp logic
                } else {
                  updateSceneCursor(props.sceneId, pe.selectionStart);
                  console.log(e.key);
                }
              }}
            />
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
                    updateSceneParagraphData(
                      props.sceneId,
                      props.paragraph.id,
                      {
                        text: props.paragraph.extra,
                        extra: "",
                      },
                    );
                  }}
                >
                  <AiOutlineCheck />
                </button>
                <button
                  type="button"
                  class="hover:text-red-500"
                  onClick={() => {
                    updateSceneParagraphData(
                      props.sceneId,
                      props.paragraph.id,
                      {
                        extra: "",
                      },
                    );
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
          <ParagraphDetails
            sceneId={props.sceneId}
            paragraph={props.paragraph}
          />
        }
      />
    </>
  );
};
