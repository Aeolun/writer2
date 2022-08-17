import React from "react";
import {
  Box,
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
import { useSelector } from "react-redux";
import { RootState } from "../lib/store";

export const CharacterModal = (props: {
  characterId: number;
  onClose: () => void;
}) => {
  const { characterId } = props;

  const character = useSelector(
    (state: RootState) => state.story.characters[characterId]
  );

  return (
    <Modal isOpen={true} onClose={props.onClose}>
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Character {character?.id}</ModalHeader>
        <ModalBody>
          <div>
            <img src={character?.picture || undefined} />
          </div>
          <FormControl>
            <FormLabel>Name</FormLabel>
            <Input
              type={"text"}
              value={character?.name || undefined}
              onChange={(e) => {
                // setCharacter({
                //   ...character,
                //   name: e.currentTarget.value,
                // })
              }}
            />
          </FormControl>
          <FormControl>
            <FormLabel>Summary</FormLabel>
            <Textarea value={character?.summary} />
          </FormControl>
          <FormControl>
            <FormLabel>Age</FormLabel>
            <Input
              type={"number"}
              value={character?.age || undefined}
              onChange={(e) => {
                // setCharacter({
                //   ...character,
                //   age: e.currentTarget.value,
                // })
              }}
            />
          </FormControl>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
};
