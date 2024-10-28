import { convertFileSrc } from "@tauri-apps/api/core";
import { CharacterModal } from "./CharacterModal";
import {
  charactersState,
  createCharacter,
  removeCharacter,
  setSelectedCharacterId,
} from "../lib/stores/characters";
import { createSignal, For } from "solid-js";
import { storyState } from "../lib/stores/story";
import { NoItems } from "./NoItems";

export const CharacterPanel = () => {
  const [charModal, setCharacterModal] = createSignal(false);
  const [characterId, setCharacterId] = createSignal("");
  const openPath = storyState.openPath;
  const characters = charactersState.characters;

  console.log(characters);

  return (
    <div class="flex flex-col gap-2 p-2 w-full">
      {charModal() && (
        <CharacterModal
          onClose={() => {
            setCharacterModal(false);
          }}
        />
      )}
      {Object.values(characters).length === 0 ? (
        <NoItems itemKind="characters" />
      ) : (
        <div class="flex-1 overflow-auto">
          <div class="flex flex-wrap items-start gap-2">
            <For each={Object.values(characters)}>
              {(char) => (
                <div
                  onClick={() => {
                    setCharacterModal(true);
                    setSelectedCharacterId(char.id);
                  }}
                  class="p-2 h-48 w-48 border border-black border-solid bg-gray-500"
                  style={{
                    "background-image": `url(${convertFileSrc(
                      `${openPath}/data/${char.picture}`,
                    )})`,
                    "background-size": "cover",
                    "background-position": "center",
                  }}
                >
                  <div class="text-white text-shadow-2px-2px-3px-black text-lg font-bold">
                    {char.name} ({char.age})
                  </div>
                  <button
                    type="button"
                    class="btn btn-error btn-xs"
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      removeCharacter(char.id);
                    }}
                  >
                    X
                  </button>
                </div>
              )}
            </For>
          </div>
        </div>
      )}
      <button
        type="button"
        class="btn btn-primary"
        onClick={() => {
          createCharacter();
        }}
      >
        Add character
      </button>
    </div>
  );
};
