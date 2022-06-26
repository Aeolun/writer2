import React, { useState } from "react";
import { Tab, TabList, TabPanel, Tabs } from "@chakra-ui/react";
import { CharacterModal } from "./CharacterModal";
import { useSelector } from "react-redux";
import { GlobalState } from "../lib/slices/global";

export const CharacterPanel = () => {
  const [charModal, setCharacterModal] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<number>(0);

  const characters = useSelector((state: GlobalState) => state.characters);

  return (
    <TabPanel>
      <table>
        {characters.map((char) => (
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
      <CharacterModal characterId={characterId} />
    </TabPanel>
  );
};
