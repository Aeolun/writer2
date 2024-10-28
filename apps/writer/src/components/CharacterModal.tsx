import {
  charactersState,
  updateCharacterProperty,
} from "../lib/stores/characters";
import { FileSelector } from "./FileSelector";

export const CharacterModal = (props: {
  onClose: () => void;
}) => {
  return (
    <div class="modal modal-open">
      <div class="modal-box">
        <h3 class="font-bold text-lg">
          Character{" "}
          {charactersState.selectedCharacter?.name ??
            charactersState.selectedCharacter?.id}
        </h3>
        <div class="py-4">
          <div class="form-control">
            <label class="label">
              <span class="label-text">Name</span>
            </label>
            <input
              type="text"
              class="input input-bordered"
              value={charactersState.selectedCharacter?.name ?? ""}
              onInput={(e) => {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "name",
                  e.currentTarget.value,
                );
              }}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Picture</span>
            </label>
            <FileSelector
              name={charactersState.selectedCharacter?.name ?? ""}
              value={charactersState.selectedCharacter?.picture ?? ""}
              onChange={(file) => {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "picture",
                  file,
                );
              }}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Summary</span>
            </label>
            <textarea
              class="textarea textarea-bordered"
              value={charactersState.selectedCharacter?.summary ?? ""}
              onInput={(e) => {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "summary",
                  e.currentTarget.value,
                );
              }}
            />
          </div>
          <div class="form-control">
            <label class="label">
              <span class="label-text">Age</span>
            </label>
            <input
              type="number"
              class="input input-bordered"
              value={charactersState.selectedCharacter?.age ?? ""}
              onInput={(e) => {
                updateCharacterProperty(
                  charactersState.selectedCharacterId,
                  "age",
                  e.currentTarget.value,
                );
              }}
            />
          </div>
          <div class="form-control">
            <label class="label cursor-pointer">
              <span class="label-text">Protagonist</span>
              <input
                type="checkbox"
                class="checkbox"
                checked={
                  charactersState.selectedCharacter?.isProtagonist ?? false
                }
                onChange={(e) => {
                  updateCharacterProperty(
                    charactersState.selectedCharacterId,
                    "isProtagonist",
                    e.currentTarget.checked,
                  );
                }}
              />
            </label>
          </div>
        </div>
        <div class="modal-action">
          <button type="button" class="btn" onClick={props.onClose}>
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
