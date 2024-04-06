import React, { useState } from "react";
import {Box, Button, Flex, Tab, TabList, TabPanel, Tabs} from "@chakra-ui/react";
import { CharacterModal } from "./CharacterModal";
import {useDispatch, useSelector} from "react-redux";
import { RootState } from "../lib/store";
import {storyActions} from "../lib/slices/story";

export const CharacterPanel = () => {
  const dispatch = useDispatch();
  const [charModal, setCharacterModal] = useState<boolean>(false);
  const [characterId, setCharacterId] = useState<number>(0);
  const storyName = useSelector((state: RootState) => state.story.name);

  const characters = useSelector((state: RootState) => state.story.characters);

  return (
    <>
      <Flex wrap={'wrap'} gap={2} mt={2}>
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
            backgroundColor={'gray.500'}
            backgroundImage={`url(/api/image?story=${storyName}&path=` + char.picture + ")"} backgroundSize={"cover"} backgroundPosition={"center"}
          >

            <Box color={"white"} textShadow={'2px 2px 3px black'} fontSize={'lg'} fontWeight={'bold'}>{char.name} ({char.age})</Box>
              <Button
                cursor={"pointer"}
                colorScheme={'red'}
                size={'xs'}
                onClick={(e) => {
                  e.stopPropagation();
                  e.preventDefault();
                }}
              >
                X
              </Button>
          </Box>
        ))}
      </Flex>
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
