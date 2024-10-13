import {
  Box,
  Checkbox,
  FormControl,
  FormLabel,
  Input,
  Modal,
  ModalBody,
  ModalContent,
  ModalHeader,
  ModalOverlay,
  Textarea,
} from "@chakra-ui/react";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { storyActions } from "../lib/slices/story";
import type { RootState } from "../lib/store";

export const CharacterModal = (props: {
  characterId: string;
  onClose: () => void;
}) => {
  const { characterId } = props;
  const dispatch = useDispatch();

  const character = useSelector(
    (state: RootState) => state.story.characters[characterId],
  );

  return (
    <Modal isOpen={true} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Character {character?.id}</ModalHeader>
        <ModalBody>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type={"text"}
              value={character?.name || undefined}
              onChange={(e) => {
                dispatch(
                  storyActions.updateCharacter({
                    id: characterId,
                    name: e.currentTarget.value,
                  }),
                );
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Picture</FormLabel>
            <Input
              type={"text"}
              value={character?.picture || undefined}
              onChange={(e) => {
                dispatch(
                  storyActions.updateCharacter({
                    id: characterId,
                    picture: e.currentTarget.value,
                  }),
                );
              }}
            />
          </FormControl>

          <FormControl>
            <FormLabel>Summary</FormLabel>
            <Textarea
              value={character?.summary}
              onChange={(e) => {
                dispatch(
                  storyActions.updateCharacter({
                    id: characterId,
                    summary: e.currentTarget.value,
                  }),
                );
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Age</FormLabel>
            <Input
              type={"number"}
              value={character?.age || undefined}
              onChange={(e) => {
                dispatch(
                  storyActions.updateCharacter({
                    id: characterId,
                    age: e.currentTarget.value,
                  }),
                );
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Protagonist</FormLabel>
            <Checkbox
              isChecked={character?.isProtagonist}
              onChange={(e) => {
                dispatch(
                  storyActions.updateCharacter({
                    id: characterId,
                    isProtagonist: !character?.isProtagonist,
                  }),
                );
              }}
            />
          </FormControl>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
