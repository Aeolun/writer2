import { For, Show } from "solid-js";
import type { Node } from "@writer/shared";
import { AiOutlineClose, AiOutlineRobot } from "solid-icons/ai";
import { RiDesignMagicFill, RiDesignQuillPenFill } from "solid-icons/ri";
import {
  FaSolidUserPlus,
  FaSolidUserGroup,
  FaSolidHeading,
  FaSolidChevronDown,
  FaSolidTimeline,
} from "solid-icons/fa";
import { loadingStates } from "./store";
import {
  CHAPTER_COUNT_OPTIONS,
  LEVEL_DESCRIPTIONS,
  type RefinementLevel,
} from "./constants";
import { findPathToNode, removeNode, treeState } from "../../lib/stores/tree";
import { generateProtagonist } from "./actions/generateProtagonist";
import { refineBookSummary } from "./actions/refineBookSummary";
import { generateFullSummary } from "./actions/generateFullSummary";
import { foreshadowBook } from "./actions/foreshadowBook";
import { extractCharactersFromChapter } from "./actions/extractCharactersFromChapter";
import { generateSceneContent } from "./actions/generateSceneContent";
import { generateTitle } from "./actions/generateTitle";
import { createSignal } from "solid-js";
import { SceneVersions } from "./SceneVersions";
import {
  scenesState,
  updateSceneData,
  createSceneParagraph,
} from "../../lib/stores/scenes";
import shortUUID from "short-uuid";
import { ButtonTooltip } from "./ButtonTooltip";
import { createArc } from "../../lib/stores/arcs";
import { createChapter } from "../../lib/stores/chapters";
import { createScene } from "../../lib/stores/scenes";
import { BiSolidAddToQueue } from "solid-icons/bi";
import { extractCharactersFromScene } from "./actions/extractCharactersFromScene";

type Props = {
  node: Node;
  getExpandStatus: () => "needs-summary" | "needs-expansion" | "ready" | null;
  handleExpand: (node: Node, chapterCount?: number) => void;
};

export const SnowflakeItemActions = (props: Props) => {
  const [showVersions, setShowVersions] = createSignal(false);

  const handleSelectVersion = (content: string) => {
    const paragraphs = content.split("\n\n").filter((p) => p.trim());

    // Clear existing paragraphs
    updateSceneData(props.node.id, {
      paragraphs: [],
      words: 0,
    });

    // Create new paragraphs from selected content
    for (const paragraph of paragraphs) {
      const paragraphId = shortUUID.generate();
      createSceneParagraph(props.node.id, {
        id: paragraphId,
        text: paragraph,
        state: "ai",
        comments: [],
        plot_point_actions: [],
        modifiedAt: Date.now(),
      });
    }

    setShowVersions(false);
  };

  const handleInsertBefore = () => {
    switch (props.node.type) {
      case "arc": {
        const [book, arc] = findPathToNode(props.node.id);
        createArc(book.id, arc.id);
        break;
      }
      case "chapter": {
        const [book, arc, chapter] = findPathToNode(props.node.id);
        createChapter(arc.id, chapter.id);
        break;
      }
      case "scene": {
        const [book, arc, chapter, scene] = findPathToNode(props.node.id);
        createScene(chapter.id, scene.id);
        break;
      }
      default:
        break;
    }
  };

  return (
    <>
      <div class="flex items-center gap-2">
        <Show when={props.node.type !== "book"}>
          <ButtonTooltip
            title={`Insert ${props.node.type} before this one`}
            onClick={handleInsertBefore}
          >
            <BiSolidAddToQueue />
          </ButtonTooltip>
        </Show>

        <div class="dropdown dropdown-end">
          <ButtonTooltip
            title={
              props.node.oneliner
                ? "Expand or refine this summary"
                : "Add a summary first"
            }
            error={!props.node.oneliner}
            disabled={!props.node.oneliner}
          >
            {loadingStates[`${props.node.id}_refine`] ? (
              <span class="loading loading-spinner loading-xs" />
            ) : (
              <RiDesignMagicFill />
            )}
          </ButtonTooltip>
          <ul class="dropdown-content z-[1] menu p-2 shadow bg-base-100 rounded-box w-72">
            <For each={[1, 2, 3]}>
              {(level) => (
                <li class="relative group">
                  <button
                    type="button"
                    onClick={() =>
                      refineBookSummary(props.node, level as RefinementLevel)
                    }
                    disabled={loadingStates[`${props.node.id}_refine`]}
                    class="flex flex-col items-start"
                  >
                    <span class="font-bold">
                      {level === 1
                        ? "Refine One-Liner"
                        : level === 2
                          ? "Expand to Paragraph"
                          : "Expand to Full Page"}
                    </span>
                    <span class="text-xs text-gray-500 whitespace-normal">
                      {
                        LEVEL_DESCRIPTIONS[
                          level as keyof typeof LEVEL_DESCRIPTIONS
                        ]
                      }
                    </span>
                  </button>
                </li>
              )}
            </For>
          </ul>
        </div>

        <Show when={props.node.type === "book"}>
          <ButtonTooltip
            title={
              props.node.oneliner
                ? "Generate a protagonist for this book"
                : "Add a summary first"
            }
            error={!props.node.oneliner}
            disabled={!props.node.oneliner}
            onClick={() => generateProtagonist(props.node)}
          >
            {loadingStates[`${props.node.id}_char`] ? (
              <span class="loading loading-spinner loading-xs" />
            ) : (
              <FaSolidUserPlus />
            )}
          </ButtonTooltip>
        </Show>

        <Show when={props.node.type !== "scene"}>
          <ButtonTooltip
            title={
              props.getExpandStatus() === "needs-summary"
                ? "Add a one-line summary first"
                : props.getExpandStatus() === "needs-expansion"
                  ? "Expand to full page (Level 3) before generating"
                  : `Generate ${props.node.type === "book" ? "arcs" : props.node.type === "arc" ? "chapters" : "scenes"}`
            }
            error={props.getExpandStatus() !== "ready"}
            disabled={props.getExpandStatus() !== "ready"}
            onClick={() => props.handleExpand(props.node)}
          >
            {loadingStates[props.node.id] ? (
              <span class="loading loading-spinner loading-xs" />
            ) : (
              <FaSolidChevronDown />
            )}
          </ButtonTooltip>
        </Show>

        <ButtonTooltip
          title={
            props.node.children?.length
              ? "Generate a summary based on child elements"
              : "Add some child elements first"
          }
          error={!props.node.children?.length}
          disabled={!props.node.children?.length}
          onClick={() => generateFullSummary(props.node)}
        >
          {loadingStates[`${props.node.id}_summary`] ? (
            <span class="loading loading-spinner loading-xs" />
          ) : (
            <AiOutlineRobot />
          )}
        </ButtonTooltip>

        <Show when={props.node.type === "book"}>
          <ButtonTooltip
            title={
              !props.node.summaries?.some((s) => s.level === 3)
                ? "Expand to full page (Level 3) first"
                : props.node.id ===
                    treeState.structure[treeState.structure.length - 1].id
                  ? "This is the last book in the series"
                  : "Add foreshadowing for future books"
            }
            error={
              !props.node.summaries?.some((s) => s.level === 3) ||
              props.node.id ===
                treeState.structure[treeState.structure.length - 1].id
            }
            disabled={
              !props.node.summaries?.some((s) => s.level === 3) ||
              props.node.id ===
                treeState.structure[treeState.structure.length - 1].id
            }
            onClick={() => foreshadowBook(props.node)}
          >
            {loadingStates[`${props.node.id}_foreshadow`] ? (
              <span class="loading loading-spinner loading-xs" />
            ) : (
              <FaSolidTimeline />
            )}
          </ButtonTooltip>
        </Show>

        <Show when={props.node.type === "scene"}>
          <ButtonTooltip
            title={
              props.node.oneliner
                ? "Extract characters from this scene"
                : "Add a summary first"
            }
            error={!props.node.oneliner}
            disabled={!props.node.oneliner}
            onClick={() => extractCharactersFromScene(props.node)}
          >
            {loadingStates[`${props.node.id}_chars`] ? (
              <span class="loading loading-spinner loading-xs" />
            ) : (
              <FaSolidUserGroup />
            )}
          </ButtonTooltip>

          <ButtonTooltip
            title={
              !props.node.oneliner
                ? "Add a summary first"
                : scenesState.scenes[props.node.id]?.generationApproaches
                      ?.length
                  ? "Compare generated versions"
                  : "Generate scene content"
            }
            error={!props.node.oneliner}
            disabled={!props.node.oneliner}
            onClick={() => {
              const scene = scenesState.scenes[props.node.id];
              if (scene?.generationApproaches?.length) {
                setShowVersions(true);
              } else {
                generateSceneContent(props.node);
              }
            }}
          >
            {loadingStates[`${props.node.id}_content`] ? (
              <span class="loading loading-spinner loading-xs" />
            ) : (
              <RiDesignQuillPenFill />
            )}
          </ButtonTooltip>
        </Show>

        <ButtonTooltip
          title="Generate a title based on the content"
          onClick={() => generateTitle(props.node)}
        >
          {loadingStates[`${props.node.id}_title`] ? (
            <span class="loading loading-spinner loading-xs" />
          ) : (
            <FaSolidHeading />
          )}
        </ButtonTooltip>

        <ButtonTooltip
          title={`Remove this ${props.node.type}`}
          onClick={() => removeNode(props.node.id)}
        >
          <AiOutlineClose />
        </ButtonTooltip>
      </div>

      <Show when={showVersions()}>
        <SceneVersions
          node={props.node}
          versions={scenesState.scenes[props.node.id]?.generationApproaches}
          onSelect={handleSelectVersion}
          onClose={() => setShowVersions(false)}
        />
      </Show>
    </>
  );
};
