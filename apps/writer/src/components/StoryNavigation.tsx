import { setTreeItemOpen, treeState } from "../lib/stores/tree";
import { Node } from "@writer/shared";
import {
  AiOutlineClockCircle,
  AiOutlineCloudUpload,
  AiOutlineMinus,
  AiOutlinePlus,
} from "solid-icons/ai";
import { chaptersState } from "../lib/stores/chapters";
import { scenesState } from "../lib/stores/scenes";
import { Show } from "solid-js";
import { setSelectedEntity, uiState } from "../lib/stores/ui";

const renderNode = (node: Node) => {
  const chapter = chaptersState.chapters[node.id];
  const scene = scenesState.scenes[node.id];

  return (
    <div class="flex flex-col">
      <div
        class="flex flex-row gap-2 items-center cursor-pointer py-0.5 px-2"
        classList={{
          "bg-gray-100":
            uiState.selectedEntity === node.type &&
            uiState.currentId === node.id,
          "pl-6": node.type === "arc",
          "pl-12": node.type === "chapter",
          "pl-18": node.type === "scene",
        }}
        onClick={() => {
          setSelectedEntity(node.type, node.id);
        }}
      >
        {node.type !== "scene" ? (
          <div
            class="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setTreeItemOpen(node.id, !node.isOpen);
            }}
          >
            {node.isOpen ? <AiOutlineMinus /> : <AiOutlinePlus />}
          </div>
        ) : null}
        <span class="font-bold">
          {node.type === "book"
            ? "📚"
            : node.type === "arc"
              ? "🏹"
              : node.type === "chapter"
                ? "📖"
                : node.type === "scene"
                  ? "📝"
                  : ""}
        </span>
        <span>{node.name}</span>
        {node.type === "chapter" ? (
          <>
            {chapter?.visibleFrom ? (
              <div class="ml-auto">
                {new Date(chapter.visibleFrom) < new Date() ? (
                  <AiOutlineCloudUpload />
                ) : (
                  <AiOutlineClockCircle />
                )}
              </div>
            ) : null}
          </>
        ) : null}
        {node.type === "scene" ? (
          <>
            <span class="ml-auto text-xs">{scene?.words}w</span>
            <span class="flex">
              <div>{scene?.hasAI ? "🤖" : "🧑"}</div>
            </span>
          </>
        ) : null}
      </div>
      <Show when={node.isOpen}>
        <div class="flex flex-col">{node.children?.map(renderNode)}</div>
      </Show>
    </div>
  );
};

export const StoryNavigation = () => {
  const structure = treeState.structure;

  return (
    <div class="w-1/5 min-w-[350px] flex flex-col z-40 overflow-y-auto border-r border-gray-200">
      {structure.map(renderNode)}
    </div>
  );
};
