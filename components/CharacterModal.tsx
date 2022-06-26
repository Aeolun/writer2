import React from "react";
import { Modal } from "@chakra-ui/react";
import { Character, GlobalState } from "../lib/slices/global";
import { useSelector } from "react-redux";

export const CharacterModal = (props: { characterId: number }) => {
  const { characterId } = props;

  const character = useSelector((state: GlobalState) =>
    state.characters.find((c) => c.id === characterId)
  );

  return (
    <Modal isOpen={true} onClose={() => {}}>
      <div>Character {character?.id}</div>
      <div>
        <img src={character?.picture || undefined} />
      </div>
      <div>
        <label>Name</label>
        <input
          type={"text"}
          value={character?.name || undefined}
          onChange={(e) => {
            // setCharacter({
            //   ...character,
            //   name: e.currentTarget.value,
            // })
          }}
        />
      </div>
      <div>
        <label>Summary</label>

        {character?.summary}
      </div>
      <div>
        <label>Age</label>
        <input
          type={"number"}
          value={character?.age || undefined}
          onChange={(e) => {
            // setCharacter({
            //   ...character,
            //   age: e.currentTarget.value,
            // })
          }}
        />
      </div>
    </Modal>
  );
};
