import { FiArrowDown, FiArrowUp, FiPlus, FiTrash, FiMenu } from "solid-icons/fi";
import { TbBuildingStore, TbTimeline } from "solid-icons/tb";
import { ImMagicWand, ImPlay2 } from "solid-icons/im";
import { BsSpellcheck } from "solid-icons/bs";
import { RiBuildingsAncientGateLine, RiSystemStarFill } from "solid-icons/ri";
import shortUUID from "short-uuid";
import { createSceneParagraph, moveParagraphDown, moveParagraphUp, removeSceneParagraph, splitScene, updateSceneParagraphData } from "../lib/stores/scenes";
import { createSignal } from "solid-js";
import { InventoryActions } from "./InventoryActions";
import { PlotpointActions } from "./PlotPointActions";
import { AudioButton } from "./AudioButton";
import { contentSchemaToText } from "../lib/persistence/content-schema-to-html";
import { useAi } from "../lib/use-ai";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuTrigger,
  DropdownMenuLabel,
} from "../solid-ui/dropdown-menu";
import type { Scene, ContentNode } from "@writer/shared";

interface ParagraphActionButtonsProps {
  sceneId: string;
  paragraphId: string;
  scene?: Scene;
  text: string | ContentNode;
  onGenerateBetween: () => void;
  aiCharacters?: string;
  humanCharacters?: string;
}

export const ParagraphActionButtons = (props: ParagraphActionButtonsProps) => {
  const [showInventory, setShowInventory] = createSignal(false);
  const [showPlotpoint, setShowPlotpoint] = createSignal(false);
  const [rewriteOpen, setRewriteOpen] = createSignal(false);
  const [manualRewriteText, setManualRewriteText] = createSignal("");
  const [translationModalOpen, setTranslationModalOpen] = createSignal(false);
  const [translationText, setTranslationText] = createSignal("");

  const help = async (helpKind: "rewrite_spelling" | "rewrite" | "snowflake_refine_scene_style" | "snowflake_convert_perspective") => {
    if (!props.scene) return;
    
    updateSceneParagraphData(props.sceneId, props.paragraphId, {
      extraLoading: true,
    });

    try {
      const result = await useAi(helpKind, typeof props.text === "string" ? props.text : contentSchemaToText(props.text));
      updateSceneParagraphData(props.sceneId, props.paragraphId, {
        extra: result,
        extraLoading: false,
      });
    } catch (error) {
      console.error(`Failed to ${helpKind}:`, error);
      updateSceneParagraphData(props.sceneId, props.paragraphId, {
        extraLoading: false,
      });
    }
  };

  return (
    <>
      <div class="absolute top-[-0.5em] right-0 flex gap-2 z-10">
        {/* Primary Actions */}
        <div class="flex gap-1">
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => moveParagraphUp(props.sceneId, props.paragraphId)}
            title="Move paragraph up"
          >
            <FiArrowUp />
          </button>
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => moveParagraphDown(props.sceneId, props.paragraphId)}
            title="Move paragraph down"
          >
            <FiArrowDown />
          </button>
          <button
            type="button"
            class="btn btn-xs"
            onClick={props.onGenerateBetween}
            title="Generate content after this paragraph"
          >
            🪄
          </button>
        </div>

        {/* AI Writing Tools */}
        <div class="flex gap-1">
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => help("rewrite_spelling")}
            title="Fix spelling and basic grammar"
          >
            <BsSpellcheck />
          </button>
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => help("rewrite")}
            title="Rewrite with style improvements"
          >
            <RiBuildingsAncientGateLine />
          </button>
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => help("snowflake_refine_scene_style")}
            title="Refine paragraph style"
          >
            <RiSystemStarFill />
          </button>
        </div>

        {/* Context Tools */}
        <div class="flex gap-1">
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => setShowInventory(p => !p)}
            title="Toggle inventory actions"
            classList={{ "btn-primary": showInventory() }}
          >
            <TbBuildingStore />
          </button>
          <button
            type="button"
            class="btn btn-xs"
            onClick={() => setShowPlotpoint(p => !p)}
            title="Toggle plotpoint actions"
            classList={{ "btn-primary": showPlotpoint() }}
          >
            <TbTimeline />
          </button>
        </div>

        {/* Audio */}
        <AudioButton text={typeof props.text === "string" ? props.text : contentSchemaToText(props.text)} />

        {/* More Actions Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger class="btn btn-xs">
            <FiMenu />
          </DropdownMenuTrigger>
          <DropdownMenuPortal>
            <DropdownMenuContent class="dropdown-content menu bg-base-100 rounded-box">
              <DropdownMenuLabel>AI Assistance</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setRewriteOpen(true)}>
                Custom Rewrite...
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => help("snowflake_convert_perspective")}>
                Convert to First Person
              </DropdownMenuItem>

              <DropdownMenuLabel>Paragraph Tools</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => setTranslationModalOpen(true)}>
                Translation
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => splitScene(props.sceneId, props.paragraphId)}>
                Split into New Scene
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => removeSceneParagraph(props.sceneId, props.paragraphId)}>
                Delete Paragraph
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => createSceneParagraph(props.sceneId, {
                id: shortUUID.generate(),
                text: "",
                state: "draft",
                comments: [],
              }, props.paragraphId)}>
                Add New Paragraph
              </DropdownMenuItem>
              
              <DropdownMenuLabel>Paragraph State</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => updateSceneParagraphData(props.sceneId, props.paragraphId, { state: "draft" })}>
                Set as Draft
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSceneParagraphData(props.sceneId, props.paragraphId, { state: "revise" })}>
                Set as Revise
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSceneParagraphData(props.sceneId, props.paragraphId, { state: "ai" })}>
                Set as AI
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => updateSceneParagraphData(props.sceneId, props.paragraphId, { state: "final" })}>
                Set as Final
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenuPortal>
        </DropdownMenu>

        <div class="text-xs text-gray-500">
          AI {props.aiCharacters} H {props.humanCharacters}
        </div>
      </div>

      {/* Modals and Popovers */}
      {showInventory() && (
        <div class="absolute left-2 ml-4 top-4 z-20 bg-base-100 shadow-lg rounded-lg p-4">
          <InventoryActions />
        </div>
      )}
      {showPlotpoint() && (
        <div class="absolute left-2 ml-4 top-4 z-20 bg-base-100 shadow-lg rounded-lg p-4">
          <PlotpointActions onClose={() => setShowPlotpoint(false)} />
        </div>
      )}

      {/* Rewrite Modal */}
      {rewriteOpen() && (
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Custom Rewrite</h3>
            <input
              type="text"
              value={manualRewriteText()}
              onInput={(e) => setManualRewriteText(e.currentTarget.value)}
              class="input input-bordered w-full"
              placeholder="Enter rewrite instructions..."
            />
            <div class="modal-action">
              <button
                type="button"
                class="btn btn-success"
                onClick={() => {
                  help("rewrite");
                  setRewriteOpen(false);
                }}
              >
                Submit
              </button>
              <button
                type="button"
                class="btn"
                onClick={() => setRewriteOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Translation Modal */}
      {translationModalOpen() && (
        <div class="modal modal-open">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Translation</h3>
            <input
              type="text"
              value={translationText()}
              onInput={(e) => setTranslationText(e.currentTarget.value)}
              class="input input-bordered w-full"
              placeholder="Enter translation..."
            />
            <div class="modal-action">
              <button
                type="button"
                class="btn btn-success"
                onClick={() => {
                  updateSceneParagraphData(props.sceneId, props.paragraphId, {
                    translation: translationText(),
                  });
                  setTranslationModalOpen(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                class="btn"
                onClick={() => setTranslationModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}; 