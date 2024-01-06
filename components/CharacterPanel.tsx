import React, { useState } from "react";
import {Button, Tab, TabList, TabPanel, Tabs} from "@chakra-ui/react";
import { CharacterModal } from "./CharacterModal";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "../lib/store";
import {storyActions} from "../lib/slices/story";

export const CharacterPanel = () => {
  const dispatch = useDispatch();
  const [charModal, setCharacterModal] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<number>(0);

  const characters = useSelector((state: RootState) => state.story.characters);

  return (
    <>
      <table>
        {Object.values(characters).map((char) => (
          <tr
            key={char.id}
            onClick={() => {
              setCharacterModal(true);
              setCharacterId(char.id);
            }}
          >
            <td>
              <img height={60} src={char.picture || undefined} />
            </td>
            <td>
              {char.name} ({char.age}) [
              <span
                style={{ cursor: "pointer" }}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                X
              </span>
              ]
            </td>
          </tr>
        ))}
      </table>
      <Button onClick={() => {
        dispatch(storyActions.createCharacter({}));
      }}>Add character</Button>
      {charModal && (
        <CharacterModal
          characterId={characterId}
          onClose={() => {
            setCharacterModal(false);
          }}
        />
      )}
    </>
  );
};
