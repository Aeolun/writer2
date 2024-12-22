import { createStore } from "solid-js/store";
import { generate as short } from "short-uuid";
import { Character } from "@writer/shared";

export const [charactersState, setCharactersState] = createStore<{
  characters: Record<string, Character>;
  selectedCharacterId: string;
  selectedCharacter?: Character;
}>({
  selectedCharacterId: "",
  characters: {},
  get selectedCharacter() {
    return this.characters[this.selectedCharacterId];
  },
});

export const createCharacter = () => {
  const id = short();
  setCharactersState("characters", (characters) => ({
    ...characters,
    [id]: {
      id,
      name: "",
      age: "0",
      picture: "",
      isProtagonist: false,
      summary: "",
      gender: "",
      sexualOrientation: "",
      height: 170,
      hairColor: "",
      eyeColor: "",
      distinguishingFeatures: "",
      modifiedAt: Date.now(),
    },
  }));
  return id;
};

export const updateCharacterProperty = <T extends keyof Character>(
  characterId: string,
  property: T,
  value: Character[T],
) => {
  setCharactersState("characters", characterId, (character) => ({
    ...character,
    [property]: value,
    modifiedAt: Date.now(),
  }));
};

export const setSelectedCharacterId = (characterId: string) => {
  setCharactersState("selectedCharacterId", characterId);
};

export const removeCharacter = (characterId: string) => {
  // @ts-expect-error: yes, this is a valid operation
  setCharactersState("characters", characterId, undefined);
};
