import type { HelpKind } from "../lib/ai-instructions";
import type { Scene } from "../../../shared/src/schema.ts";
import { useAi } from "../lib/use-ai.ts";
import { updateSceneParagraphData } from "../lib/stores/scenes.ts";
import { createSignal } from "solid-js";
import { BsSpellcheck } from "solid-icons/bs";
import { RiBuildingsAncientGateLine } from "solid-icons/ri";
import { ImMagicWand, ImMenu, ImPlay2 } from "solid-icons/im";
import { Popover } from "@ark-ui/solid/popover";
import { Portal } from "solid-js/web";
import { DropdownMenu } from "@kobalte/core/dropdown-menu";
import {
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuTrigger,
} from "../solid-ui/dropdown-menu.tsx";
import { FiMenu } from "solid-icons/fi";

export const StoryParagraphButtons = (props: {
  scene?: Scene;
  paragraphId: string;
}) => {
  const scene = props.scene;

  const currentParagraph = scene?.paragraphs.find(
    (p) => p.id === scene.selectedParagraph,
  );
  const [menuOpen, setMenuOpen] = createSignal(false);

  const help = (helpKind: HelpKind, extra = false, addInstructions = true) => {
    if (!scene) return;
    if (!currentParagraph) {
      return;
    }
    return useAi(helpKind, `${currentParagraph.text}`, addInstructions).then(
      (res) => {
        if (extra) {
          updateSceneParagraphData(scene.id, currentParagraph.id, {
            extra: res ?? undefined,
          });
        } else {
          updateSceneParagraphData(scene.id, currentParagraph.id, {
            extra: res ?? undefined,
          });
        }
      },
    );
  };
  const [translationModalOpen, setTranslationModalOpen] = createSignal(false);
  const [translationText, setTranslationText] = createSignal(
    currentParagraph?.translation ?? "",
  );

  return scene && currentParagraph ? (
    <div class="flex flex-wrap justify-end w-32 gap-2 p-2">
      <button
        type="button"
        aria-label="rewrite"
        class="btn btn-xs"
        title="Rewrite the paragraph with AI, with a focus on spelling. This will show the suggestion next to the existing paragraph."
        onClick={() => {
          updateSceneParagraphData(scene.id, currentParagraph.id, {
            extraLoading: true,
          });
          help("rewrite_spelling")?.then(() => {
            updateSceneParagraphData(scene.id, currentParagraph.id, {
              extraLoading: false,
            });
          });
        }}
      >
        <ImMagicWand />
      </button>
      <button
        type="button"
        aria-label="rewrite"
        class="btn btn-xs"
        title="Rewrite the paragraph with AI. This will show the suggestion next to the existing paragraph."
        onClick={() => {
          updateSceneParagraphData(scene.id, currentParagraph.id, {
            extraLoading: true,
          });
          help("rewrite")?.then(() => {
            updateSceneParagraphData(scene.id, currentParagraph.id, {
              extraLoading: false,
            });
          });
        }}
      >
        <RiBuildingsAncientGateLine />
      </button>
      <button
        type="button"
        class="btn btn-xs"
        disabled={!currentParagraph?.text}
        aria-label="read paragraph out loud"
        title="Read paragraph out loud"
      >
        <ImPlay2 />
      </button>
      <button
        type="button"
        aria-label="rewrite"
        class="btn btn-xs"
        title="Fix the grammar with AI, and keep as close to the original as possible. This will show the suggestion next to the existing paragraph."
        onClick={() => {
          updateSceneParagraphData(scene.id, currentParagraph.id, {
            extraLoading: true,
          });
          help("rewrite_similar", true, false)?.then(() => {
            updateSceneParagraphData(scene.id, currentParagraph.id, {
              extraLoading: false,
            });
          });
        }}
      >
        <BsSpellcheck />
      </button>
      <DropdownMenu>
        <DropdownMenuTrigger
          type="button"
          class="btn btn-xs"
          aria-label="Options"
        >
          <FiMenu />
        </DropdownMenuTrigger>

        <DropdownMenuPortal>
          <DropdownMenuContent class="dropdown-content menu flex-col bg-base-100 rounded-box">
            <DropdownMenuItem
              onClick={() => {
                updateSceneParagraphData(scene.id, currentParagraph.id, {
                  state: "draft",
                });
              }}
            >
              <span class="font-bold">Split into new scene from here</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updateSceneParagraphData(scene.id, currentParagraph.id, {
                  state: "draft",
                });
              }}
            >
              <span class="font-bold">Draft</span>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updateSceneParagraphData(scene.id, currentParagraph.id, {
                  state: "revise",
                });
              }}
            >
              Revise
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updateSceneParagraphData(scene.id, currentParagraph.id, {
                  state: "ai",
                });
              }}
            >
              AI
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                updateSceneParagraphData(scene.id, currentParagraph.id, {
                  state: "final",
                });
              }}
            >
              Finalized
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setTranslationModalOpen(true)}>
              Translation
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenuPortal>
      </DropdownMenu>
      {translationModalOpen() && (
        <div class="modal">
          <div class="modal-box">
            <h3 class="font-bold text-lg">Translation</h3>
            <input
              type="text"
              value={translationText()}
              onInput={(e) => setTranslationText(e.currentTarget.value)}
              class="input input-bordered w-full"
            />
            <div class="modal-action">
              <button
                type="button"
                class="btn btn-success"
                onClick={() => {
                  updateSceneParagraphData(scene.id, currentParagraph.id, {
                    translation: translationText(),
                  });
                  setTranslationModalOpen(false);
                }}
              >
                Save
              </button>
              <button
                type="button"
                onClick={() => setTranslationModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) : null;
};
