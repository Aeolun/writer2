import { Box, Button, Flex } from "@chakra-ui/react";
import { convertFileSrc } from "@tauri-apps/api/core";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";
import { CharacterModal } from "./CharacterModal";

export const CharacterPanel = () => {
  const dispatch = useDispatch();
  const [charModal, setCharacterModal] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<string>("");
  const openPath = useSelector((state: RootState) => state.base.openPath);

  const characters = useSelector((state: RootState) => state.story.characters);

  return (
    <Flex flexDir={"column"} gap={2}>
      {charModal && (
        <CharacterModal
          characterId={characterId}
          onClose={() => {
            setCharacterModal(false);
          }}
        />
      )}
      <Flex
        wrap={"wrap"}
        alignItems={"flex-start"}
        gap={2}
        mt={2}
        flex={1}
        overflow={"auto"}
      >
        {Object.values(characters).map((char) => (
          <Box
            key={char.id}
            onClick={() => {
              setCharacterModal(true);
              setCharacterId(char.id);
            }}
            p={2}
            h={300}
            w={300}
            border={"1px solid black"}
            backgroundColor={"gray.500"}
            backgroundImage={`url(${convertFileSrc(`${openPath}/data/${char.picture}`)})`}
            backgroundSize={"cover"}
            backgroundPosition={"center"}
          >
            <Box
              color={"white"}
              textShadow={"2px 2px 3px black"}
              fontSize={"lg"}
              fontWeight={"bold"}
            >
              {char.name} ({char.age})
            </Box>
            <Button
              cursor={"pointer"}
              colorScheme={"red"}
              size={"xs"}
              onClick={(e) => {
                e.stopPropagation();
                e.preventDefault();
                dispatch(storyActions.removeCharacter(char.id));
              }}
            >
              X
            </Button>
          </Box>
        ))}
      </Flex>
      <Button
        onClick={() => {
          dispatch(storyActions.createCharacter({}));
        }}
      >
        Add character
      </Button>
    </Flex>
  );
};
