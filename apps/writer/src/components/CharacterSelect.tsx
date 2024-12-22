import { Select } from "@thisbeyond/solid-select";
import "@thisbeyond/solid-select/style.css";
import { convertFileSrc } from "@tauri-apps/api/core";
import { storyState } from "../lib/stores/story";
import { charactersState } from "../lib/stores/characters";
import type { Character } from "@writer/shared";

type CharacterSelectProps = {
  placeholder: string;
  value?: string;
  onChange: (characterId: string) => void;
  characters?: string[];
  emptyMessage?: string;
};

const getFullName = (character: Character) => {
  const parts = [character.firstName, character.middleName, character.lastName]
    .filter(Boolean)
    .join(" ");
  return character.nickname ? `${parts} "${character.nickname}"` : parts;
};

export const CharacterSelect = (props: CharacterSelectProps) => {
  const openPath = storyState.openPath;
  const characters = () =>
    Object.values(charactersState.characters)
      .filter((char) => {
        return !props.characters || props.characters.includes(char.id);
      })
      .sort((a, b) => getFullName(a).localeCompare(getFullName(b)));

  const getCharacterImage = (character: Character) => {
    if (character.picture) {
      return convertFileSrc(`${openPath}/data/${character.picture}`);
    }

    // Fallback based on gender
    const gender = character.gender?.toLowerCase();
    if (gender === "female") {
      return "/unknown-female.png";
    }
    // Default to male icon for any other gender or if gender is not specified
    return "/unknown-male.jpg";
  };

  const formatOption = (character: Character) => (
    <div class="flex items-center gap-3">
      <div
        class="w-8 h-8 rounded-full bg-cover bg-center border border-gray-300"
        style={{
          "background-image": `url(${getCharacterImage(character)})`,
        }}
      />
      <span>{getFullName(character)}</span>
    </div>
  );

  return (
    <Select
      placeholder={props.placeholder}
      options={characters()}
      initialValue={
        props.value ? charactersState.characters[props.value] : undefined
      }
      onChange={(character) => {
        props.onChange(character ? character.id : "");
      }}
      format={formatOption}
    />
  );
};
